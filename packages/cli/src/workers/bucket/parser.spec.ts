import { describe, it, expect } from 'vitest';
import { createJsonParser } from './parser';

describe('JsonParser', () => {
  const parser = createJsonParser();
  const complexNestedJsonObject = {
    a: { b: { c: 'd' } },
    'x/y': { z: 'w' },
    'unicode': '😊',
    special: { 'chars': 'a/b?c&d' },
    array: [1, 2, 3],
    yesno: true,
  };
  const complexNestedFlatJsonObject: Record<string, string | number | boolean> = {
    'a/b/c': 'd',
    'x%2Fy/z': 'w',
    'unicode': '😊',
    'special/chars': 'a/b?c&d',
    'array/0': 1,
    'array/1': 2,
    'array/2': 3,
    'yesno': true,
  };

  // Helper function for round-trip testing
  async function roundTrip(content: string) {
    const deserialized = await parser.deserialize('en', content);
    const serialized = await parser.serialize('en', deserialized);
    return serialized;
  }

  it('should round-trip a complex nested JSON', async () => {
    const input = JSON.stringify(complexNestedJsonObject, null, 2);

    const result = await roundTrip(input);

    expect(result).toEqual(input);
  });

  it('should deserialize a complex nested JSON', async () => {
    const input = JSON.stringify(complexNestedJsonObject, null, 2);

    const result = await parser.deserialize('en', input);

    expect(result).toEqual(complexNestedFlatJsonObject);
  });

  it('should serialize a complex nested JSON', async () => {
    const input = complexNestedFlatJsonObject;

    const result = await parser.serialize('en', input);

    expect(result).toEqual(JSON.stringify(complexNestedJsonObject, null, 2));
  });
});