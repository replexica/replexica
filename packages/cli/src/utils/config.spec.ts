import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getConfig, saveConfig } from "./config";
import { defaultConfig, I18nConfig } from "@replexica/spec";
import prettier from "prettier";
import path from "path";
import fs from "fs";

describe("@replexica/cli", () => {
  const prettierConfigPath = path.join(process.cwd(), ".prettierrc.json");
  const configPath = path.join(process.cwd(), "i18n.json");

  afterEach(() => {
    if (fs.existsSync(prettierConfigPath)) {
      fs.unlinkSync(prettierConfigPath);
    }
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  });

  it("should return null if the config file does not exist", async () => {
    const config = getConfig();
    expect(config).toBeNull();
  });

  it("should load a valid configuration file", async () => {
    const configContent = JSON.stringify({ buckets: {} }, null, 2);
    fs.writeFileSync(configPath, configContent);

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
    await saveConfig(defaultConfig);

    const savedContent = fs.readFileSync(configPath, "utf8");

    expect(savedContent).toEqual(
      await prettier.format(JSON.stringify(defaultConfig), {
        parser: "json",
        useTabs: false,
        tabWidth: 2,
      }),
    );
  });

  it("should save a new configuration preserving existing formatting", async () => {
    const originalContent = JSON.stringify({ buckets: {} }, null, 4);

    fs.writeFileSync(configPath, originalContent);
    fs.writeFileSync(
      prettierConfigPath,
      JSON.stringify({ parser: "json", tabWidth: 4 }),
    );

    const newConfig: I18nConfig = {
      buckets: {},
      version: 1.3,
      locale: { source: "en", targets: ["es"] },
    };

    await saveConfig(newConfig);

    const updatedContent = fs.readFileSync("i18n.json", "utf8");

    expect(updatedContent).toEqual(
      await prettier.format(JSON.stringify(newConfig), {
        parser: "json",
        useTabs: false,
        tabWidth: 4,
      }),
    );
  });
});
