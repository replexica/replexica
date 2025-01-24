import { describe, it, expect } from "vitest";
import { getAlternativeLocaleCodes } from "./locales";

describe("getAlternativeLocaleCodes", () => {
  it("should convert dash to underscore format", () => {
    expect(getAlternativeLocaleCodes("en-US")).toEqual(["en_US"]);
    expect(getAlternativeLocaleCodes("fr-FR")).toEqual(["fr_FR"]);
    expect(getAlternativeLocaleCodes("zh-Hans-CN")).toEqual(["zh_Hans_CN"]);
  });

  it("should convert underscore to dash format", () => {
    expect(getAlternativeLocaleCodes("en_US")).toEqual(["en-US"]);
    expect(getAlternativeLocaleCodes("fr_FR")).toEqual(["fr-FR"]);
    expect(getAlternativeLocaleCodes("zh_Hans_CN")).toEqual(["zh-Hans-CN"]);
  });

  it("should return empty array for simple locale codes", () => {
    expect(getAlternativeLocaleCodes("en")).toEqual([]);
    expect(getAlternativeLocaleCodes("fr")).toEqual([]);
  });
});
