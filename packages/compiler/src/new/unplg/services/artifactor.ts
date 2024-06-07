import fs from 'fs';
import path from 'path';
import { sourceLocaleSchema } from '@replexica/spec';
import { I18nScope } from '../_types';

export type CodeArtifactorParams = {
  fileId: string;
  sourceLocale: typeof sourceLocaleSchema._type;
};

export class CodeArtifactor {
  private static artifactsDir = path.resolve(process.cwd(), 'node_modules', '@replexica/.cache');
  private static i18nTreePath = path.resolve(CodeArtifactor.artifactsDir, '.json');

  public static create(params: CodeArtifactorParams) {
    return new CodeArtifactor(params);
  }

  public static reset() {
    fs.rmSync(CodeArtifactor.artifactsDir, { recursive: true, force: true });
  }


  private defaultLocalePath: string;

  private constructor(
    private params: CodeArtifactorParams,
  ) {
    // ensure the artifacts directory exists
    if (!fs.existsSync(CodeArtifactor.artifactsDir)) {
      fs.mkdirSync(CodeArtifactor.artifactsDir, { recursive: true });
    }

    this.defaultLocalePath = path.resolve(CodeArtifactor.artifactsDir, `${this.params.sourceLocale}.json`);
  }

  public produceLocaleMeta(i18nTree: I18nScope) {
    const payload = {
      [this.params.fileId]: i18nTree,
    };
    this._mergeAsJson(CodeArtifactor.i18nTreePath, payload);
  }

  public produceDefaultLocaleData() {
    this._writeAsJson(this.defaultLocalePath, this.params.sourceLocale);
  }

  private _mergeAsJson(filePath: string, data: any) {
    const existingData = this._loadAsJson(filePath);
    const mergedData = { ...existingData, ...data };
    this._writeAsJson(filePath, mergedData);
  }

  private _writeAsJson(filePath: string, data: any) {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString);
  }

  private _loadAsJson(filePath: string): any {
    const exists = fs.existsSync(filePath);
    if (!exists) { return null; }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}
