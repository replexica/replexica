import { File } from "@babel/types";
import fs from 'fs';
import path from 'path';
import { ReplexicaCompilerData, ReplexicaCompilerPayload } from "./compiler";
import { ReplexicaLocaleData, ReplexicaConfig } from "./types";

export class ReplexicaOutputProcessor {
  public static create(relativeFilePath: string, options: ReplexicaConfig) {
    return new ReplexicaOutputProcessor(relativeFilePath, options);
  }

  private constructor(
    private readonly relativeFilePath: string,
    private readonly options: ReplexicaConfig,
  ) {}

  private _outDir = path.join(process.cwd(), `node_modules/@replexica/translations`);
  private _debugDir = path.join(process.cwd(), '.debug/replexica');
  
  public saveData(data: ReplexicaCompilerData) {
    const filePath = path.join(this._outDir, '.replexica.json');
    const existingData: ReplexicaCompilerPayload = this._loadObject<ReplexicaCompilerPayload>(filePath) || this._createEmptyCompilerPayload();
    const newData = {
      ...existingData,
      data: {
        ...existingData.data,
        ...data,
      },
    };
    this._saveObject(filePath, newData);
  }


  public saveSourceLocaleData(data: ReplexicaCompilerData) {
    const existingData: ReplexicaLocaleData =
      this._loadObject<ReplexicaLocaleData>(path.join(this._outDir, `${this.options.sourceLocale}.json`)) ||
      this._createEmptyLocaleData();

    const newLocaleData: ReplexicaLocaleData = {
      ...existingData,
    };
    for (const [fileId, fileData] of Object.entries(data)) {
      newLocaleData[fileId] = {};
      for (const [scopeId, scopeData] of Object.entries(fileData.data)) {
        for (const [chunkId, value] of Object.entries(scopeData.data)) {
          newLocaleData[fileId] = {
            ...newLocaleData[fileId],
            [scopeId]: {
              ...newLocaleData[fileId]?.[scopeId],
              [chunkId]: value,
            },
          };
        }
      }
      if (Object.keys(newLocaleData[fileId]).length === 0) {
        delete newLocaleData[fileId];
      }
    }
    const filePath = path.join(this._outDir, `${this.options.sourceLocale}.json`);
    this._saveObject(filePath, newLocaleData);
  }

  public saveAst(ast: File) {
    const filePath = path.join(process.cwd(), this._debugDir, this.relativeFilePath + '.json');
    this._saveObject(filePath, ast);
  }

  public saveOutput(output: string) {
    const filePath = path.join(process.cwd(), this._debugDir, this.relativeFilePath + '.txt');
    this._saveText(filePath, output);
  }

  // Private

  private _createEmptyCompilerPayload(): ReplexicaCompilerPayload {
    return {
      settings: {
        locale: {
          source: this.options.sourceLocale,
        },
      },
      data: {},
    };
  }

  private _createEmptyLocaleData(): ReplexicaLocaleData {
    return {};
  }

  private _loadObject<T>(filePath: string): T | null {
    const content = this._loadText(filePath);
    if (!content) { return null; }
    return JSON.parse(content);
  }

  private _saveObject<T>(filePath: string, data: T) {
    const content = JSON.stringify(data, null, 2);
    this._saveText(filePath, content);
  }

  private _loadText(filePath: string): string | null {
    if (!fs.existsSync(filePath)) { return null; }
    return fs.readFileSync(filePath, 'utf-8');
  }

  private _saveText(filePath: string, content: string) {
    const filePathDir = path.dirname(filePath);
    if (!fs.existsSync(filePathDir)) {
      fs.mkdirSync(filePathDir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}
