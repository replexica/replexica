import { describe, it, expect } from 'vitest';
import { xcodeStringsdictLoader } from './xcode-stringsdict';
import plist from 'plist';

describe('xcodeStringsdictLoader', () => {
  const loader = xcodeStringsdictLoader();

  describe('load', () => {
    it('should parse valid .stringsdict content', async () => {
      console.log('testing load');

      const validContent = `
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
        <dict>
          <key>greeting</key>
          <string>Hello!</string>
        </dict>
        </plist>
      `;
      const result = await loader.load(validContent);
      expect(result).toEqual({ greeting: 'Hello!' });
    });

    it('should throw an error for invalid content', async () => {
      const invalidContent = 'Invalid XML';
      await expect(loader.load(invalidContent)).rejects.toThrow();
      await expect(loader.load(invalidContent)).rejects.toThrow(/Invalid .stringsdict format/);
    });
  });

  describe('save', () => {
    it('should generate valid .stringsdict content', async () => {
      console.log('testing save');
      const payload = { greeting: 'Hello!' };
      const result = await loader.save(payload);
      
      // Check for XML and DOCTYPE declarations
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">');
      
      // Parse the generated content and check the payload
      const parsedResult = plist.parse(result);
      expect(parsedResult).toEqual(payload);
    });
  });
});
