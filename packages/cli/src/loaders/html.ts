import { JSDOM } from "jsdom";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

function normalizeTextContent(text: string, isStandalone: boolean): string {
  // Remove any leading/trailing whitespace for initial comparison
  const trimmed = text.trim();
  if (!trimmed) return "";

  // For all text nodes, just return the trimmed content
  return trimmed;
}

export default function createHtmlLoader(): ILoader<
  string,
  Record<string, any>
> {
  const LOCALIZABLE_ATTRIBUTES: Record<string, string[]> = {
    meta: ["content"],
    img: ["alt"],
    input: ["placeholder"],
    a: ["title"],
  };
  const UNLOCALIZABLE_TAGS = ["script", "style"];

  return createLoader({
    async pull(locale, input) {
      const result: Record<string, any> = {};
      const dom = new JSDOM(input);
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

          // Get index among significant siblings (non-empty text nodes and elements)
          const siblings = Array.from(parent.childNodes).filter(
            (n) =>
              n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()),
          );
          const index = siblings.indexOf(current);
          if (index !== -1) {
            indices.unshift(index);
          }
          current = parent;
        }

        const basePath = rootParent
          ? `${rootParent}/${indices.join("/")}`
          : indices.join("/");
        return attribute ? `${basePath}#${attribute}` : basePath;
      };

      const processNode = (node: Node) => {
        // Check if node is inside an unlocalizable tag
        let parent = node.parentElement;
        while (parent) {
          if (UNLOCALIZABLE_TAGS.includes(parent.tagName.toLowerCase())) {
            return; // Skip processing this node and its children
          }
          parent = parent.parentElement;
        }

        if (node.nodeType === 3) {
          // Text node
          const text = node.textContent || "";
          const normalizedText = normalizeTextContent(text, true);
          if (normalizedText) {
            result[getPath(node)] = normalizedText;
          }
        } else if (node.nodeType === 1) {
          // Element node
          const element = node as Element;

          // Handle localizable attributes
          const tagName = element.tagName.toLowerCase();
          const attributes = LOCALIZABLE_ATTRIBUTES[tagName] || [];
          attributes.forEach((attr) => {
            const value = element.getAttribute(attr);
            if (value) {
              result[getPath(element, attr)] = value;
            }
          });

          // Process all child nodes
          Array.from(element.childNodes)
            .filter(
              (n) =>
                n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()),
            )
            .forEach(processNode);
        }
      };

      // Process head and body
      Array.from(document.head.childNodes)
        .filter(
          (n) =>
            n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()),
        )
        .forEach(processNode);
      Array.from(document.body.childNodes)
        .filter(
          (n) =>
            n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()),
        )
        .forEach(processNode);

      return result;
    },

    async push(locale, data, originalInput) {
      const dom = new JSDOM(
        originalInput ??
          "<!DOCTYPE html><html><head></head><body></body></html>",
      );
      const document = dom.window.document;

      // Set the HTML lang attribute to the current locale
      const htmlElement = document.documentElement;
      htmlElement.setAttribute("lang", locale);

      // Sort paths to ensure proper order of creation
      const paths = Object.keys(data).sort((a, b) => {
        const aDepth = a.split("/").length;
        const bDepth = b.split("/").length;
        return aDepth - bDepth;
      });

      paths.forEach((path) => {
        const value = data[path];
        const [nodePath, attribute] = path.split("#");
        const [rootTag, ...indices] = nodePath.split("/");

        let parent: Element =
          rootTag === "head" ? document.head : document.body;
        let current: Node | null = parent;

        // Navigate to the target node
        for (let i = 0; i < indices.length; i++) {
          const index = parseInt(indices[i]);
          const siblings = Array.from(parent.childNodes).filter(
            (n) =>
              n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()),
          );

          if (index >= siblings.length) {
            // Create missing nodes
            if (i === indices.length - 1) {
              // Last index - create text node
              const textNode = document.createTextNode("");
              parent.appendChild(textNode);
              current = textNode;
            } else {
              // Create intermediate element
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

        // Set content
        if (current) {
          if (attribute) {
            (current as Element).setAttribute(attribute, value);
          } else {
            current.textContent = value;
          }
        }
      });

      // Preserve formatting by using serialize() with pretty print
      return dom.serialize();
    },
  });
}
