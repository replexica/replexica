import { describe, it, expect } from 'vitest';
import { xcodeStringsLoader } from './xcode-strings';

describe('xcodeStringsLoader', () => {
  const loader = xcodeStringsLoader();

  describe('load', () => {
    it('should parse simple key-value pairs', async () => {
      const input = '"key1" = "value1";\n"key2" = "value2";';
      const result = await loader.load(input);
      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should ignore comments and empty lines', async () => {
      const input = '// Comment\n\n"key" = "value";\n\n// Another comment';
      const result = await loader.load(input);
      expect(result).toEqual({ key: 'value' });
    });

    it('should unescape special characters', async () => {
      const input = '"key" = "Line 1\\nLine 2\\"quoted\\"";';
      const result = await loader.load(input);
      expect(result).toEqual({ key: 'Line 1\nLine 2"quoted"' });
    });
  });

  describe('save', () => {
    it('should generate properly formatted strings', async () => {
      const input = { key1: 'value1', key2: 'value2' };
      const result = await loader.save(input);
      expect(result).toBe('"key1" = "value1";\n"key2" = "value2";');
    });

    it('should escape special characters', async () => {
      const input = { key: 'Line 1\nLine 2"quoted"' };
      const result = await loader.save(input);
      expect(result).toBe('"key" = "Line 1\\nLine 2\\"quoted\\"";');
    });
  });
});
