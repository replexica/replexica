import matter from 'gray-matter';
import YAML from 'yaml';
import { BucketLoader } from "./_base";

const SECTION_REGEX = /^(#{1,6}\s.*$|[-=*]{3,}$|!\[.*\]\(.*\)$|\[.*\]\(.*\)$)/gm;
const MD_SECTION_PREFIX = 'md-section-';
const FM_ATTR_PREFIX = 'fm-attr-';

const yamlEngine = {
  parse: (str: string) => YAML.parse(str),
  stringify: (obj: any) => YAML.stringify(obj, { defaultStringType: 'PLAIN' }),
};

export const markdownLoader = (): BucketLoader<string, Record<string, any>> => ({
  async load(input: string): Promise<Record<string, any>> {
    const { data: frontmatter, content } = matter(input, {
      engines: {
        yaml: yamlEngine,
      },
    });

    const sections = content.split(SECTION_REGEX)
    .map(section => section.trim())
    .filter(Boolean);

    return {
      ...Object.fromEntries(
        sections
          .map((section, index) => [`${MD_SECTION_PREFIX}${index}`, section.trim()])
          .filter(([, section]) => Boolean(section))
      ),
      ...Object.fromEntries(
        Object.entries(frontmatter).map(([key, value]) => [`${FM_ATTR_PREFIX}${key}`, value])
      ),
    };
  },

  async save(payload: Record<string, any>): Promise<string> {
    const frontmatter = Object.fromEntries(
      Object.entries(payload)
        .filter(([key]) => key.startsWith(FM_ATTR_PREFIX))
        .map(([key, value]) => [key.replace(FM_ATTR_PREFIX, ''), value])
    );

    let content = Object.entries(payload)
      .filter(([key]) => key.startsWith(MD_SECTION_PREFIX))
      .sort(([a], [b]) => Number(a.split('-').pop()) - Number(b.split('-').pop()))
      .map(([, value]) => value.trim())
      .filter(Boolean)
      .join('\n\n');

    if (Object.keys(frontmatter).length > 0) {
      content = `\n${content}`;
    }

    return matter.stringify(content, frontmatter, {
      engines: {
        yaml: yamlEngine,
      },
    });
  }
});
