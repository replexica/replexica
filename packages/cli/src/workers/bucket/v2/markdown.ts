import YAML from 'yaml';
import { BucketLoader } from "./_base";

const mdLinePrefix = 'markdown-line-';
const fmAttributePrefix = 'frontmatter-attribute-';

export const markdownLoader = (): BucketLoader<string, Record<string, any>> => ({
  async load(text: string) {
    // Manually split frontmatter and content
    const parts = text.split(/^---\s*$/m);
    let frontmatter = '';
    let body = '';

    if (parts.length >= 3) {
      frontmatter = parts[1].trim();
      body = parts.slice(2).join('---').trim();
    } else {
      body = text.trim();
    }

    // Parse frontmatter using YAML
    const attributes = frontmatter ? YAML.parse(frontmatter) : {};

    const sectionStarters = [
      // Matches headings
      /^#+\s.*$/gm,
      // Matches dash dividers
      /^[-]{3,}$/gm,
      // Matches equals dividers
      /^[=]{3,}$/gm,
      // Matches asterisk dividers
      /^[*]{3,}$/gm,
      // Matches images that take up a line
      /^!\[.*\]\(.*\)$/gm,
      // Matches links that take up a line
      /^\[.*\]\(.*\)$/gm,
    ];

    const combinedPattern = new RegExp(sectionStarters.map(pattern => `(${pattern.source})`).join('|'), 'gm');

    const sections = body.split(combinedPattern).filter(Boolean);

    const bodyPartial: Record<string, string> = sections.reduce((acc, section, index) => ({
      ...acc,
      [`${mdLinePrefix}${index}`]: section,
    }), {} as any);

    const attributesPartial = Object.entries(attributes).reduce((acc, [key, value]) => ({
      ...acc,
      [`${fmAttributePrefix}${key}`]: value,
    }), {} as any);

    const result = {
      ...bodyPartial,
      ...attributesPartial,
    };

    return result;
  },
  async save(payload) {
    const body = Object
      .entries(payload)
      .filter(([key]) => key.startsWith(mdLinePrefix))
      .map(([, value]) => value)
      .join('');

    const attributes = Object
      .entries(payload)
      .filter(([key]) => key.startsWith(fmAttributePrefix))
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key.replace(fmAttributePrefix, '')]: value,
      }), {} as any);

    if (Object.keys(attributes).length === 0) {
      return body;
    }

    // Convert attributes to YAML string
    const frontmatter = YAML.stringify(attributes, {
      lineWidth: -1,
    });
    return `---\n${frontmatter}---\n\n${body}`;
  },
});