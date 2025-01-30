import { describe, it, expect } from "vitest";

import createJsonSortingLoader from "./json-sorting";

describe("JSON Sorting Loader", () => {
  const loader = createJsonSortingLoader();
  loader.setDefaultLocale("en");

  describe("pull", () => {
    it("should return input unchanged", async () => {
      const input = { b: 1, a: 2 };
      const result = await loader.pull("en", input);
      expect(result).toEqual(input);
    });
  });

  describe("push", () => {
    it("should sort object keys at root level", async () => {
      const input = { zebra: 1, apple: 2, banana: 3 };
      const expected = { apple: 2, banana: 3, zebra: 1 };

      const result = await loader.push("en", input);
      expect(result).toEqual(expected);
    });

    it("should sort nested object keys", async () => {
      const input = {
        b: {
          z: 1,
          y: 2,
          x: 3,
        },
        a: 1,
      };
      const expected = {
        a: 1,
        b: {
          x: 3,
          y: 2,
          z: 1,
        },
      };

      const result = await loader.push("en", input);
      expect(result).toEqual(expected);
    });

    it("should handle arrays by sorting their object elements", async () => {
      const input = {
        items: [
          { b: 1, a: 2 },
          { d: 3, c: 4 },
        ],
      };
      const expected = {
        items: [
          { a: 2, b: 1 },
          { c: 4, d: 3 },
        ],
      };

      const result = await loader.push("en", input);
      expect(result).toEqual(expected);
    });

    it("should handle mixed nested structures", async () => {
      const input = {
        zebra: [
          { beta: 2, alpha: 1 },
          { delta: 4, gamma: 3 },
        ],
        apple: {
          two: 2,
          one: 1,
        },
      };
      const expected = {
        apple: {
          one: 1,
          two: 2,
        },
        zebra: [
          { alpha: 1, beta: 2 },
          { delta: 4, gamma: 3 },
        ],
      };

      const result = await loader.push("en", input);
      expect(result).toEqual(expected);
    });

    it("should handle null and primitive values", async () => {
      const input = {
        c: null,
        b: "string",
        a: 123,
        d: true,
      };
      const expected = {
        a: 123,
        b: "string",
        c: null,
        d: true,
      };

      const result = await loader.push("en", input);
      expect(result).toEqual(expected);
    });
  });
});
