import GrayMatter from 'gray-matter';
import { createLoader } from "./_base";

const mdLinePrefix = 'markdown-line-';
const fmAttributePrefix = 'frontmatter-attribute-';

export const markdownLoader = createLoader<string, Record<string, any>>({
  async load(text: string) {
    const fmContent = GrayMatter(text);

    const attributes = fmContent.data;
    const body = fmContent.content;

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

    return GrayMatter.stringify(body, attributes);
  },
});