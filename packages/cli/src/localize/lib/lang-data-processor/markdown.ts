import fs from 'fs/promises';
import path from "path";
import { BaseLangDataProcessor, ILangDataProcessor } from "./base.js";

export class MarkdownLangDataProcessor extends BaseLangDataProcessor implements ILangDataProcessor {
  override async validatePath(filePathPattern: string): Promise<void> {
    if (!filePathPattern.includes('[lang]')) { throw new Error('The file path must include the [lang] placeholder'); }
    if (!['.md', '.mdx'].some((ext) => filePathPattern.endsWith(ext))) { throw new Error('Markdown dictionary must have .md or .mdx file extension'); }
  }

  async loadLangJson(filePathPattern: string, lang: string): Promise<Record<string, string>> {
    await this.validatePath(filePathPattern);

    const filePath = filePathPattern.replace('[lang]', lang);
    const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
    if (!fileExists) {
      return {};
    } else {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const result = { '': fileContent };
      return result;
    }
  }

  async saveLangJson(filePathPattern: string, lang: string, record: Record<string, string>): Promise<void> {
    await this.validatePath(filePathPattern);

    const filePath = filePathPattern.replace('[lang]', lang);
    const fileContent = record[''];
    // Create all directories in the path if they don't exist
    const dirPath = path.dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });
    // Write the file
    await fs.writeFile(filePath, fileContent);
  }
}
