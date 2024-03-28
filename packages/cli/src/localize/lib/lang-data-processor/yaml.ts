import fs from 'fs/promises';
import path from "path";
import { BaseLangDataProcessor, ILangDataProcessor, LangDataNode } from "./base.js";
import YAML from 'yaml';

export class YamlLangDataProcessor extends BaseLangDataProcessor implements ILangDataProcessor {
  override async validatePath(filePathPattern: string): Promise<void> {
    if (!filePathPattern.includes('[lang]')) { throw new Error('The file path must include the [lang] placeholder'); }
    if (!['.yaml', '.yml'].some((ext) => filePathPattern.endsWith(ext))) { throw new Error('Yaml dictionary must have .yaml or .yml file extension'); }
  }

  async loadLangJson(filePathPattern: string, lang: string): Promise<Record<string, string>> {
    await this.validatePath(filePathPattern);

    const filePath = filePathPattern.replace('[lang]', lang);
    const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
    if (!fileExists) {
      return {};
    } else {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const langData = YAML.parse(fileContent) as LangDataNode;
      const result = await this.flatten(langData, lang);
      return result;
    }
  }

  async saveLangJson(filePathPattern: string, lang: string, record: Record<string, any>): Promise<void> {
    await this.validatePath(filePathPattern);

    const langData = await this.unflatten(record, lang);

    const filePath = filePathPattern.replace('[lang]', lang);
    const fileContent = YAML.stringify(langData);
    // Create all directories in the path if they don't exist
    const dirPath = path.dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });
    // Write the file
    await fs.writeFile(filePath, fileContent);
  }
}
