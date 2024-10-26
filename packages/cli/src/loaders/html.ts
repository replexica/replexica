import { JSDOM } from 'jsdom';
import { ILoader } from './_types';
import { createLoader } from './_utils';

function normalizeTextContent(text: string, isStandalone: boolean): string {
  // Remove any leading/trailing whitespace for initial comparison
  const trimmed = text.trim();
  if (!trimmed) return '';

  // Check if the original text is surrounded by newlines
  const hasLeadingNewline = /^\s*\n/.test(text);
  const hasTrailingNewline = /\n\s*$/.test(text);
  
  // Text is standalone if it's surrounded by newlines in the original content
  const isActuallyStandalone = hasLeadingNewline && hasTrailingNewline;
  
  if (isActuallyStandalone) {
    // For standalone text (surrounded by newlines), return just the trimmed content
    return trimmed;
  } else {
    // For inline text, preserve necessary whitespace but normalize it
    const normalized = text
      // First normalize spaces around newlines
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      // Then collapse multiple newlines
      .replace(/\n+/g, '\n')
      // Then collapse multiple spaces
      .replace(/[ \t]+/g, ' ')
      // Trim only leading/trailing newlines, preserve spaces
      .replace(/^\n+|\n+$/g, '');

    return normalized;
  }
}

export default function createHtmlLoader(): ILoader<string, Record<string, any>> {
  const LOCALIZABLE_ATTRIBUTES: Record<string, string[]> = {
    'meta': ['content'],
    'img': ['alt'],
    'input': ['placeholder'],
    'a': ['title'],
  };

  return createLoader({
    async pull(locale, rawData) {
      const result: Record<string, any> = {};
      const dom = new JSDOM(rawData);
      const document = dom.window.document;

      const getPath = (node: Node, attribute?: string): string => {
        const indices: number[] = [];
        let current = node as ChildNode;
        let rootParent = '';
        
        while (current) {
          const parent = current.parentElement as Element;
          if (!parent) break;
          
          if (parent === document.documentElement) {
            rootParent = current.nodeName.toLowerCase();
            break;
          }
          
          // Get index among significant siblings (non-whitespace text nodes and elements)
          const siblings = Array.from(parent.childNodes)
            .filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()));
          const index = siblings.indexOf(current);
          if (index !== -1) {
            indices.unshift(index);
          }
          current = parent;
        }
        
        const basePath = rootParent ? `${rootParent}/${indices.join('/')}` : indices.join('/');
        return attribute ? `${basePath}#${attribute}` : basePath;
      };

      const processNode = (node: Node) => {
        if (node.nodeType === 3) { // Text node
          const text = node.textContent || '';
          if (text.trim()) {
            const normalizedText = normalizeTextContent(text, true);
            if (normalizedText) {
              result[getPath(node)] = normalizedText;
            }
          }
        } else if (node.nodeType === 1) { // Element node
          const element = node as Element;
          
          // Handle localizable attributes
          const tagName = element.tagName.toLowerCase();
          const attributes = LOCALIZABLE_ATTRIBUTES[tagName] || [];
          attributes.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value) {
              result[getPath(element, attr)] = value;
            }
          });

          // For elements with single text node, store content directly
          if (element.childNodes.length === 1 && element.firstChild?.nodeType === 3) {
            const text = element.textContent || '';
            const normalizedText = normalizeTextContent(text, false);
            if (normalizedText) {
              result[getPath(element)] = normalizedText;
            }
          } else {
            // Process child nodes
            Array.from(element.childNodes)
              .filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()))
              .forEach(processNode);
          }
        }
      };

      // Process head and body
      Array.from(document.head.childNodes)
        .filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()))
        .forEach(processNode);
      Array.from(document.body.childNodes)
        .filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()))
        .forEach(processNode);

      return result;
    },

    async push(locale, data) {
      const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
      const document = dom.window.document;

      // Sort paths to ensure proper order of creation
      const paths = Object.keys(data).sort((a, b) => {
        const aDepth = a.split('/').length;
        const bDepth = b.split('/').length;
        return aDepth - bDepth;
      });

      paths.forEach(path => {
        const value = data[path];
        const [nodePath, attribute] = path.split('#');
        const [rootTag, ...indices] = nodePath.split('/');
        
        let parent: any = rootTag === 'head' ? document.head : document.body;
        let current: any = parent;

        // Create or navigate to the target node
        for (let i = 0; i < indices.length; i++) {
          const index = parseInt(indices[i]);
          const siblings = Array.from(parent.childNodes)
            .filter((n: any) => n.nodeType === 1 || n.nodeType === 3);
          
          while (siblings.length <= index) {
            if (i === indices.length - 1) {
              // Last index - create text node
              parent.appendChild(document.createTextNode(''));
            } else {
              // Create element node
              parent.appendChild(document.createElement('div'));
            }
            siblings.push(parent.lastChild!);
          }
          
          current = siblings[index] as ChildNode;
          if (current.nodeType === 1) {
            parent = current as Element;
          }
        }

        // Set content
        if (attribute) {
          (current as Element).setAttribute(attribute, value);
        } else {
          current.textContent = value;
        }
      });

      return dom.serialize();
    }
  });
}
