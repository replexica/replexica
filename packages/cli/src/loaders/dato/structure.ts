import { ILoader } from "../_types";
import { createLoader } from "../_utils";

interface DastNode {
  type: string;
  value?: string;
  marks?: Array<{ type: string }>;
  children?: DastNode[];
  [key: string]: any;
}

interface DastContent {
  schema: 'dast';
  document: {
    type: 'root';
    children: DastNode[];
  };
}

interface DatoRecord {
  id: string;
  type: string;
  [field: string]: any | DastContent;
}

export default function createDatoCMSStructureLoader(config: { fields: string[] }): ILoader<Record<string, DatoRecord>, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      const result: Record<string, any> = {};

      function processNode(node: DastNode, path: string) {
        // Text content in span nodes is localizable
        if (node.type === 'span' && node.value) {
          result[path] = node.value;
        }

        // Recursively process children
        if (node.children) {
          node.children.forEach((child, index) => {
            processNode(child, `${path}/${index}`);
          });
        }
      }

      for (const [recordId, record] of Object.entries(input)) {
        for (const field of config.fields) {
          const dastContent = record[field]?.[locale] as DastContent;
          if (dastContent?.schema === 'dast') {
            // Start traversing from root
            dastContent.document.children.forEach((node, index) => {
              processNode(node, `${recordId}/${field}/${index}`);
            });
          }
        }
      }

      return result;
    },

    async push(locale, data, originalInput = {}) {
      const updates: Record<string, DatoRecord> = { ...originalInput };

      for (const [recordId, record] of Object.entries(updates)) {
        for (const field of config.fields) {
          if (!record[field]) continue;

          // Get the original structure from the source locale
          const sourceDast = record[field]['en'] as DastContent;
          if (sourceDast?.schema !== 'dast') continue;

          // Deep clone the structure
          const updatedDast = JSON.parse(JSON.stringify(sourceDast));

          // Update span values with translations
          const updateSpanValues = (node: DastNode) => {
            if (node.type === 'span' && node.value) {
              const nodePath = findNodePath(updatedDast.document, node);
              if (nodePath) {
                const fullPath = `${recordId}/${field}/${nodePath}`;
                if (fullPath in data) { // Check if we have a translation
                  node.value = data[fullPath];
                }
              }
            }
            if (node.children) {
              node.children.forEach(child => updateSpanValues(child));
            }
          };

          updateSpanValues(updatedDast.document);

          // Update the field
          record[field] = {
            ...record[field],
            [locale]: updatedDast
          };
        }
      }

      return updates;
    }
  });
}

// Helper function to find node path in DAST structure
function findNodePath(root: DastNode, targetNode: DastNode, path: string[] = []): string | null {
  if (root === targetNode) {
    return path.join('/');
  }

  if (root.children) {
    for (let i = 0; i < root.children.length; i++) {
      const childPath = findNodePath(root.children[i], targetNode, [...path, i.toString()]);
      if (childPath !== null) {
        return childPath;
      }
    }
  }

  return null;
}
