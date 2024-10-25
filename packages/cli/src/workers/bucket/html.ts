import { JSDOM } from 'jsdom';
import { BucketLoader } from './_base';

interface LocalizableContent {
  localizableHtmlEntities: LocalizableItem[];
}

interface LocalizableItem {
  selector: string;
  type: 'text' | 'attribute';
  name?: string;
  value: string;
}

const LOCALIZABLE_ATTRIBUTES = [
  'alt',
  'title',
  'placeholder',
  'aria-label',
  'content'
];

const SKIP_ELEMENTS = ['script', 'style'];

function getSelector(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;
  
  while (current) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
    }
    parts.unshift(selector);
    current = current.parentElement;
  }
  
  return parts.join(' > ');
}

function extractLocalizableHtmlEntities(dom: JSDOM): LocalizableItem[] {
  const items: LocalizableItem[] = [];
  const document = dom.window.document;

  // Walk through all elements
  const walker = document.createTreeWalker(
    document.body,
    dom.window.NodeFilter.SHOW_ELEMENT | dom.window.NodeFilter.SHOW_TEXT
  );

  while (walker.nextNode()) {
    const node = walker.currentNode;

    // Handle text nodes
    if (node.nodeType === dom.window.Node.TEXT_NODE && node.parentElement) {
      const text = node.textContent?.trim();
      if (text && !SKIP_ELEMENTS.includes(node.parentElement.tagName.toLowerCase())) {
        items.push({
          selector: getSelector(node.parentElement),
          type: 'text',
          value: text
        });
      }
    }

    // Handle element nodes with localizable attributes
    if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
      const element = node as Element;
      for (const attr of LOCALIZABLE_ATTRIBUTES) {
        if (element.hasAttribute(attr)) {
          const value = element.getAttribute(attr);
          if (value?.trim()) {
            items.push({
              selector: getSelector(element),
              type: 'attribute',
              name: attr,
              value: value
            });
          }
        }
      }
    }
  }

  return items;
}

export const htmlLoader = (): BucketLoader<string, LocalizableContent> => {
  const state = { jsdom: new JSDOM() };

  return {
    async load(text: string) {
      if (!text) return { localizableHtmlEntities: [] };
      state.jsdom = new JSDOM(text);
      const localizableHtmlEntities = extractLocalizableHtmlEntities(state.jsdom);
  
      const result: LocalizableContent = {
        localizableHtmlEntities
      };

      return result;
    },
  
    async save(payload: LocalizableContent) {
      const document = state.jsdom.window.document;


      console.log({
        payload,
        html: document.documentElement.outerHTML
      });
  
      for (const item of payload.localizableHtmlEntities) {
        const element = document.querySelector(item.selector);
        if (!element) continue;
  
        if (item.type === 'text') {
          element.textContent = item.value;
        } else if (item.type === 'attribute' && item.name) {
          element.setAttribute(item.name, item.value);
        }
      }
  
      // Return the serialized HTML content of the entire document
      return state.jsdom.window.document.documentElement.outerHTML;
    }
  }
};
