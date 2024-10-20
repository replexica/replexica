import { describe, it, expect } from 'vitest';
import { flutterLoader } from './flutter';

describe('flutterLoader', () => {
  const loader = flutterLoader('en');

  describe('load', () => {
    it('should load data correctly', async () => {
      const input = {
        '@@locale': 'en',
        key1: 'value1',
        key2: 'value2',
      };

      const result = await loader.load(input);

      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should skip @@locale metadata', async () => {
      const input = {
        '@@locale': 'en',
        key: 'value',
      };

      const result = await loader.load(input);

      expect(result).toEqual({
        key: 'value',
      });
      expect(result).not.toHaveProperty('@@locale');
    });
  });

  describe('save', () => {
    it('should save data correctly', async () => {
      const input = {
        key1: 'value1',
        key2: 'value2',
      };

      const result = await loader.save(input);

      expect(result).toEqual({
        '@@locale': 'en',
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should add @@locale metadata', async () => {
      const input = {
        key: 'value',
      };

      const result = await loader.save(input);

      expect(result).toHaveProperty('@@locale', 'en');
    });
  });
});
