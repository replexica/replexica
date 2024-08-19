import { describe, it, expect } from 'vitest';
import { parseI18nConfig, I18nConfig, defaultConfig } from './config'; // Adjust the import path as needed

// Helper function to create a v0 config
const createV0Config = () => ({
  version: 0,
});

// Helper function to create a v1 config
const createV1Config = () => ({
  version: 1,
  locale: {
    source: 'en',
    targets: ['es'],
  },
  buckets: {
    'src/ui/[locale]/.json': 'json',
    'src/blog/[locale]/*.md': 'markdown',
  },
});

// Helper function to create a v1.1 config
const createV1_1Config = () => ({
  version: 1.1,
  locale: {
    source: 'en',
    targets: ['es', 'fr'],
  },
  buckets: {
    json: {
      include: [
        'src/ui/[locale]/.json',
      ]
    },
    markdown: {
      include: [
        'src/blog/[locale]/*.md',
      ],
      exclude: [
        'src/blog/[locale]/drafts.md',
      ],
    },
  },
});

describe('I18n Config Parser', () => {
  it('should upgrade v0 config to v1.1', () => {
    const v0Config = createV0Config();
    const result = parseI18nConfig(v0Config);
    
    expect(result.version).toBe(1.1);
    expect(result.locale).toEqual(defaultConfig.locale);
    expect(result.buckets).toEqual({});
  });

  it('should upgrade v1 config to v1.1', () => {
    const v1Config = createV1Config();
    const result = parseI18nConfig(v1Config);
    
    expect(result.version).toBe(1.1);
    expect(result.locale).toEqual(v1Config.locale);
    expect(result.buckets).toEqual({
      json: {
        include: [
          'src/ui/[locale]/.json',
        ]
      },
      markdown: {
        include: [
          'src/blog/[locale]/*.md',
        ],
      },
    });
  });

  it('should not modify v1.1 config', () => {
    const v1_1Config = createV1_1Config();
    const result = parseI18nConfig(v1_1Config);
    
    expect(result).toEqual(v1_1Config);
  });

  it('should throw an error for invalid configurations', () => {
    const invalidConfig = { version: 'invalid' };
    expect(() => parseI18nConfig(invalidConfig)).toThrow('Failed to parse config');
  });

  it('should handle empty config and use defaults', () => {
    const emptyConfig = {};
    const result = parseI18nConfig(emptyConfig);
    
    expect(result).toEqual(defaultConfig);
  });

  it('should ignore extra fields in the config', () => {
    const configWithExtra = {
      ...createV1_1Config(),
      extraField: 'should be ignored',
    };
    const result = parseI18nConfig(configWithExtra);
    
    expect(result).not.toHaveProperty('extraField');
    expect(result).toEqual(createV1_1Config());
  });
});