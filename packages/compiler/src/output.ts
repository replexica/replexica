import { File } from "@babel/types";
import fs from 'fs';
import path from 'path';
import { ReplexicaCompilerData } from "./compiler";
import { ReplexicaLocaleData, ReplexicaData } from "./types";
import { ReplexicaConfig } from "./options";

export class ReplexicaOutputProcessor {
  public static create(relativeFilePath: string, options: ReplexicaConfig) {
    return new ReplexicaOutputProcessor(relativeFilePath, options);
  }

  private constructor(
    private readonly relativeFilePath: string,
    private readonly options: ReplexicaConfig,
  ) { }

  private _outDir = path.join(process.cwd(), `node_modules/@replexica/translations`);
  private _debugDir = path.join(process.cwd(), '.debug/replexica');

  public saveBuildData(data: ReplexicaCompilerData) {
    const filePath = path.join(this._outDir, '.replexica.json');
    const existingData: ReplexicaData = this._loadObject<ReplexicaData>(filePath) || this._createEmptyData();
    const newData: ReplexicaData = {
      ...existingData,
    };
    for (const [fileId, fileData] of Object.entries(data)) {
      newData.meta.files[fileId] = {
        isClient: fileData.context.isClient,
      };
      for (const [scopeId, scopeData] of Object.entries(fileData.data)) {
        newData.meta.scopes[scopeId] = {
          hints: scopeData.hints,
        };
      }
    }
    this._saveObject(filePath, newData);
  }

  public saveFullSourceLocaleData(data: ReplexicaCompilerData) {
    const fileName = `${this.options.locale.source}.json`;
    this._saveSourceLocaleData(data, fileName);
  }

  public saveClientSourceLocaleData(data: ReplexicaCompilerData) {
    const fileName = `${this.options.locale.source}.client.json`;
    this._saveSourceLocaleData(
      data,
      fileName,
      (fileData) => fileData.context.isClient,
    );
  }

  public saveStubLocaleData() {
    for (const targetLocale of this.options.locale.targets) {
      const fullLocaleDataFilePath = path.join(this._outDir, `${targetLocale}.json`);
      if (!fs.existsSync(fullLocaleDataFilePath)) {
        fs.writeFileSync(fullLocaleDataFilePath, '{}', 'utf-8');
      }

      const clientLocaleDataFilePath = path.join(this._outDir, `${targetLocale}.client.json`);
      if (!fs.existsSync(clientLocaleDataFilePath)) {
        fs.writeFileSync(clientLocaleDataFilePath, '{}', 'utf-8');
      }
    }
  }

  private _saveSourceLocaleData(
    data: ReplexicaCompilerData,
    fileName: string,
    fileDataPredicate: (fileData: ReplexicaCompilerData['']) => boolean = () => true,
  ) {
    const existingData: ReplexicaLocaleData =
      this._loadObject<ReplexicaLocaleData>(path.join(this._outDir, fileName)) ||
      this._createEmptyLocaleData();

    const newLocaleData: ReplexicaLocaleData = {
      ...existingData,
    };
    for (const [fileId, fileData] of Object.entries(data)) {
      if (!fileDataPredicate(fileData)) { continue; }

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
    const filePath = path.join(this._outDir, fileName);
    this._saveObject(filePath, newLocaleData);
  }

  public saveAst(ast: File, phase: 'pre' | 'post') {
    const filePath = path.join(this._debugDir, this.relativeFilePath + `.${phase}` + '.json');
    this._saveObject(filePath, ast);
  }

  public saveOutput(output: string) {
    const filePath = path.join(this._debugDir, this.relativeFilePath + '.txt');
    this._saveText(filePath, output);
  }

  // Private

  private _createEmptyData(): ReplexicaData {
    return {
      settings: {
        locale: {
          source: this.options.locale.source,
          targets: this.options.locale.targets,
        },
      },
      meta: {
        files: {},
        scopes: {},
      },
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
