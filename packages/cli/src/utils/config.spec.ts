import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import mockFs from "mock-fs";
import { getConfig, saveConfig } from "./config";
import { defaultConfig, I18nConfig } from "@replexica/spec";

describe("@replexica/cli", () => {
  beforeEach(() => {
    mockFs.restore();
  });

  it("should return null if the config file does not exist", async () => {
    const config = getConfig();
    expect(config).toBeNull();
  });

  it("should load a valid configuration file", async () => {
    const configContent = JSON.stringify({ buckets: {} }, null, 2);

    mockFs({
      "i18n.json": configContent,
    });

    const config = getConfig();

    expect(config).toEqual({
      buckets: {},
      locale: {
        source: "en",
        targets: ["es"],
      },
      version: 1.2,
    });
  });

  it("should save a new configuration with default formatting when initializing", async () => {
    mockFs({});

    await saveConfig(defaultConfig);

    const savedContent = fs.readFileSync("i18n.json", "utf8");

    expect(savedContent).toEqual(
      JSON.stringify(defaultConfig, null, 2), // Default to 2 spaces
    );
  });

  it("should save a new configuration preserving existing formatting", async () => {
    const originalContent = JSON.stringify({ buckets: {} }, null, 6); // 6 spaces

    mockFs({
      "i18n.json": originalContent,
    });

    const newConfig: I18nConfig = {
      buckets: {},
      version: 1.3,
      locale: { source: "en", targets: ["es"] },
    };

    await saveConfig(newConfig, originalContent);

    const updatedContent = fs.readFileSync("i18n.json", "utf8");

    expect(updatedContent).toEqual(JSON.stringify(newConfig, null, 6));
  });
});
