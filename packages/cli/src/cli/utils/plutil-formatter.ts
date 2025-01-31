export function formatPlutilStyle(jsonData: any, existingJson?: string): string {
  // Detect indentation from existing JSON if provided
  const indent = existingJson ? detectIndentation(existingJson) : "  ";

  function format(data: any, level = 0): string {
    const currentIndent = indent.repeat(level);
    const nextIndent = indent.repeat(level + 1);

    if (typeof data !== "object" || data === null) {
      return JSON.stringify(data);
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return "[]";
      const items = data.map((item) => `${nextIndent}${format(item, level + 1)}`);
      return `[\n${items.join(",\n")}\n${currentIndent}]`;
    }

    const keys = Object.keys(data);
    if (keys.length === 0) {
      return `{\n\n${currentIndent}}`; // Empty object with proper indentation
    }

    // Sort keys to ensure whitespace keys come first
    const sortedKeys = keys.sort((a, b) => {
      // If both keys are whitespace or both are non-whitespace, maintain stable order
      const aIsWhitespace = /^\s*$/.test(a);
      const bIsWhitespace = /^\s*$/.test(b);

      if (aIsWhitespace && !bIsWhitespace) return -1;
      if (!aIsWhitespace && bIsWhitespace) return 1;
      return a.localeCompare(b, undefined, { numeric: false });
    });

    const items = sortedKeys.map((key) => {
      const value = data[key];
      return `${nextIndent}${JSON.stringify(key)} : ${format(value, level + 1)}`;
    });

    return `{\n${items.join(",\n")}\n${currentIndent}}`;
  }

  const result = format(jsonData);
  return result;
}

function detectIndentation(jsonStr: string): string {
  // Find the first indented line
  const match = jsonStr.match(/\n(\s+)/);
  return match ? match[1] : "    "; // fallback to 4 spaces if no indentation found
}
