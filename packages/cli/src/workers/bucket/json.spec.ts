import { describe, it, expect } from 'vitest';
import { jsonLoader } from './json';

describe('jsonLoader', () => {
  const loader = jsonLoader();

  describe('load', () => {
    it('should parse valid JSON', async () => {
      const input = '{"name": "John", "age": 30}';
      const result = await loader.load(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should handle trailing comma', async () => {
      const input = '{"name": "John", "age": 30,}';
      const result = await loader.load(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should handle empty input', async () => {
      const result = await loader.load('');
      expect(result).toEqual({});
    });

    it('should repair and parse invalid JSON', async () => {
      const input = '{"name": "John", age: 30}'; // Missing quotes around "age"
      const result = await loader.load(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('save', () => {
    it('should stringify object to JSON', async () => {
      const input = { name: 'John', age: 30 };
      const result = await loader.save(input);
      expect(JSON.parse(result)).toEqual(input);
    });

    it('should produce formatted JSON with 2-space indentation', async () => {
      const input = { name: 'John', age: 30 };
      const result = await loader.save(input);
      expect(result).toBe('{\n  "name": "John",\n  "age": 30\n}');
    });
  });
});
