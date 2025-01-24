import { describe, it, expect } from "vitest";
import createVariableLoader, { VariableLoaderParams } from "./index";

describe("createVariableLoader", () => {
  describe("ieee format", () => {
    it("extracts variables during pull", async () => {
      const loader = createLoader("ieee");
      const input = {
        simple: "Hello %s!",
        multiple: "Value: %d and %f",
        complex: "Precision %.2f with position %1$d",
      };

      const result = await loader.pull("en", input);
      expect(result).toEqual({
        simple: "Hello {variable:0}!",
        multiple: "Value: {variable:0} and {variable:1}",
        complex: "Precision {variable:0} with position {variable:1}",
      });
    });

    it("restores variables during push", async () => {
      const loader = createLoader("ieee");
      const input = {
        simple: "Hello %s!",
        multiple: "Value: %d and %f",
        complex: "Precision %.2f with position %1$d",
      };

      const payload = {
        simple: "[updated] Hello {variable:0}!",
        multiple: "[updated] Value: {variable:0} and {variable:1}",
        complex: "[updated] Precision {variable:0} with position {variable:1}",
      };

      await loader.pull("en", input);
      const result = await loader.push("en", payload);

      expect(result).toEqual({
        simple: "[updated] Hello %s!",
        multiple: "[updated] Value: %d and %f",
        complex: "[updated] Precision %.2f with position %1$d",
      });
    });

    it("handles empty input", async () => {
      const loader = createLoader("ieee");
      const result = await loader.pull("en", {});
      expect(result).toEqual({});
    });
  });

  describe("python format", () => {
    it("extracts python variables during pull", async () => {
      const loader = createLoader("python");
      const input = {
        simple: "Hello %(name)s!",
        multiple: "Value: %(num)d and %(float)f",
      };

      const result = await loader.pull("en", input);
      expect(result).toEqual({
        simple: "Hello {variable:0}!",
        multiple: "Value: {variable:0} and {variable:1}",
      });
    });

    it("restores python variables during push", async () => {
      const loader = createLoader("python");
      const input = {
        simple: "Hello %(name)s!",
        multiple: "Value: %(num)d and %(float)f",
      };

      const payload = {
        simple: "[updated] Hello {variable:0}!",
        multiple: "[updated] Value: {variable:0} and {variable:1}",
      };

      await loader.pull("en", input);
      const result = await loader.push("en", input);
      expect(result).toEqual({
        simple: "Hello %(name)s!",
        multiple: "Value: %(num)d and %(float)f",
      });
    });
  });

  it("throws error for unsupported format type", () => {
    expect(() => {
      // @ts-expect-error Testing invalid type
      createVariableLoader({ type: "invalid" });
    }).toThrow("Unsupported variable format type: invalid");
  });
});

function createLoader(type: VariableLoaderParams["type"]) {
  return createVariableLoader({ type }).setDefaultLocale("en");
}
