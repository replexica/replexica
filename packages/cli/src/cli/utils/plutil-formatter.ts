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

    const items = keys.map((key) => {
      const value = data[key];
      return `${nextIndent}${JSON.stringify(key)} : ${format(value, level + 1)}`;
    });

    return `{\n${items.join(",\n")}\n${currentIndent}}`;
  }

  return format(jsonData);
}

function detectIndentation(jsonStr: string): string {
  // Find the first indented line
  const match = jsonStr.match(/\n(\s+)/);
  return match ? match[1] : "    "; // fallback to 4 spaces if no indentation found
}
