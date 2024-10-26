import { describe, it, expect } from 'vitest';
import createAndroidLoader from './android';

describe('androidLoader', () => {
  describe('load', () => {
    it('should parse string resources', async () => {
      const loader = createAndroidLoader().setLocale('en');
      const xml = `
        <resources>
          <string name="hello">Hello, World!</string>
        </resources>
      `;
      const result = await loader.pull(xml);
      expect(result).toEqual({ hello: 'Hello, World!' });
    });

    it('should parse string-array resources', async () => {
      const loader = createAndroidLoader().setLocale('en');
      const xml = `
        <resources>
          <string-array name="colors">
            <item>Red</item>
            <item>Green</item>
            <item>Blue</item>
          </string-array>
        </resources>
      `;
      const result = await loader.pull(xml);
      expect(result).toEqual({ colors: ['Red', 'Green', 'Blue'] });
    });

    it('should parse plurals resources', async () => {
      const loader = createAndroidLoader().setLocale('en');
      const xml = `
        <resources>
          <plurals name="cats">
            <item quantity="one">cat</item>
            <item quantity="other">cats</item>
          </plurals>
        </resources>
      `;
      const result = await loader.pull(xml);
      expect(result).toEqual({ cats: { one: 'cat', other: 'cats' } });
    });

    it('should parse bool resources', async () => {
      const loader = createAndroidLoader().setLocale('en');
      const xml = `
        <resources>
          <bool name="is_enabled">true</bool>
        </resources>
      `;
      const result = await loader.pull(xml);
      expect(result).toEqual({ is_enabled: true });
    });

    it('should parse integer resources', async () => {
      const loader = createAndroidLoader().setLocale('en');
      const xml = `
        <resources>
          <integer name="max_count">100</integer>
        </resources>
      `;
      const result = await loader.pull(xml);
      expect(result).toEqual({ max_count: 100 });
    });
  });

  describe('save', () => {
    it('should generate XML for various resource types', async () => {
      const loader = createAndroidLoader().setLocale('en');
      await loader.pull('<resources></resources>');
      const input = {
        hello: 'Hello, World!',
        colors: ['Red', 'Green', 'Blue'],
        cats: { one: 'cat', other: 'cats' },
        is_enabled: true,
        max_count: 100
      };
      const xml = await loader.push(input);
      expect(xml).toContain('<string name="hello">Hello, World!</string>');
      expect(xml).toContain('<string-array name="colors">');
      expect(xml).toContain('<plurals name="cats">');
      expect(xml).toContain('<bool name="is_enabled">true</bool>');
      expect(xml).toContain('<integer name="max_count">100</integer>');
    });
  });
});
