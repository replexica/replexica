import { JSDOM } from "jsdom";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

const EJS_PLACEHOLDER_REGEX = /<%[\-=]?\s*(.*?)\s*%>/g;
const LOCALIZABLE_ATTRIBUTES: Record<string, string[]> = {
  meta: ["content"],
  img: ["alt"],
  input: ["placeholder"],
  a: ["title"],
};
const UNLOCALIZABLE_TAGS = ["script", "style"];

// Unique identifier for EJS placeholders to prevent conflicts
const EJS_PLACEHOLDER_PREFIX = "__EJS_PLACEHOLDER_";

interface EJSPlaceholder {
  id: string;
  content: string;
}

function normalizeTextContent(text: string): string {
  return text.trim();
}

export default function createEjsLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      const result: Record<string, any> = {};
      const placeholders: EJSPlaceholder[] = [];
      
      // Replace EJS expressions with placeholders
      let processedInput = input.replace(EJS_PLACEHOLDER_REGEX, (match, content) => {
        const id = `${EJS_PLACEHOLDER_PREFIX}${placeholders.length}`;
        placeholders.push({ id, content: match });
        return id;
      });

      // Parse with JSDOM
      const dom = new JSDOM(processedInput);
      const document = dom.window.document;

      const getPath = (node: Node, attribute?: string): string => {
        const indices: number[] = [];
        let current = node as ChildNode;
        let rootParent = "";

        while (current) {
          const parent = current.parentElement as Element;
          if (!parent) break;

          if (parent === document.documentElement) {
            rootParent = current.nodeName.toLowerCase();
            break;
          }

          const siblings = Array.from(parent.childNodes).filter(
            (n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim())
          );
          const index = siblings.indexOf(current);
          if (index !== -1) {
            indices.unshift(index);
          }
          current = parent;
        }

        const basePath = rootParent ? `${rootParent}/${indices.join("/")}` : indices.join("/");
        return attribute ? `${basePath}#${attribute}` : basePath;
      };

      const processNode = (node: Node) => {
        let parent = node.parentElement;
        while (parent) {
          if (UNLOCALIZABLE_TAGS.includes(parent.tagName.toLowerCase())) {
            return;
          }
          parent = parent.parentElement;
        }

        if (node.nodeType === 3) {
          const text = node.textContent || "";
          const normalizedText = normalizeTextContent(text);
          
          // Check if text contains EJS placeholder
          if (normalizedText.includes(EJS_PLACEHOLDER_PREFIX)) {
            // Store original EJS expression
            const placeholder = placeholders.find(p => normalizedText.includes(p.id));
            if (placeholder) {
              result[getPath(node)] = placeholder.content;
            }
          } else if (normalizedText) {
            result[getPath(node)] = normalizedText;
          }
        } else if (node.nodeType === 1) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();
          
          // Handle localizable attributes
          const attributes = LOCALIZABLE_ATTRIBUTES[tagName] || [];
          attributes.forEach((attr) => {
            const value = element.getAttribute(attr);
            if (value) {
              if (value.includes(EJS_PLACEHOLDER_PREFIX)) {
                const placeholder = placeholders.find(p => value.includes(p.id));
                if (placeholder) {
                  result[getPath(element, attr)] = placeholder.content;
                }
              } else {
                result[getPath(element, attr)] = value;
              }
            }
          });

          Array.from(element.childNodes)
            .filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()))
            .forEach(processNode);
        }
      };

      // Process head and body
      Array.from(document.head.childNodes)
        .filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()))
        .forEach(processNode);
      Array.from(document.body.childNodes)
        .filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()))
        .forEach(processNode);

      return result;
    },

    async push(locale, data, originalInput) {
      if (!originalInput) {
        throw new Error("Original input is required for EJS translation");
      }

      const placeholders: EJSPlaceholder[] = [];
      let processedInput = originalInput.replace(EJS_PLACEHOLDER_REGEX, (match, content) => {
        const id = `${EJS_PLACEHOLDER_PREFIX}${placeholders.length}`;
        placeholders.push({ id, content: match });
        return id;
      });

      const dom = new JSDOM(processedInput);
      const document = dom.window.document;

      // Set HTML lang attribute
      document.documentElement.setAttribute("lang", locale);

      // Sort paths for consistent processing
      const paths = Object.keys(data).sort((a, b) => {
        const aDepth = a.split("/").length;
        const bDepth = b.split("/").length;
        return aDepth - bDepth;
      });

      paths.forEach((path) => {
        let value = data[path];
        const [nodePath, attribute] = path.split("#");
        const [rootTag, ...indices] = nodePath.split("/");

        let parent: Element = rootTag === "head" ? document.head : document.body;
        let current: Node | null = parent;

        // Navigate to target node
        for (let i = 0; i < indices.length; i++) {
          const index = parseInt(indices[i]);
          const siblings = Array.from(parent.childNodes).filter(
            (n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim())
          );

          if (index >= siblings.length) {
            if (i === indices.length - 1) {
              const textNode = document.createTextNode("");
              parent.appendChild(textNode);
              current = textNode;
            } else {
              const element = document.createElement("div");
              parent.appendChild(element);
              current = element;
              parent = element;
            }
          } else {
            current = siblings[index];
            if (current.nodeType === 1) {
              parent = current as Element;
            }
          }
        }

        // Restore EJS placeholders in the value if needed
        if (value.includes(EJS_PLACEHOLDER_PREFIX)) {
          const placeholder = placeholders.find(p => value.includes(p.id));
          if (placeholder) {
            value = placeholder.content;
          }
        }

        // Set content
        if (current) {
          if (attribute) {
            (current as Element).setAttribute(attribute, value);
          } else {
            current.textContent = value;
          }
        }
      });

      // Get final HTML and restore all remaining EJS placeholders
      let output = dom.serialize();
      placeholders.forEach(({ id, content }) => {
        output = output.replace(new RegExp(id, 'g'), content);
      });

      return output;
    },
  });
}
