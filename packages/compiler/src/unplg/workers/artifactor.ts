import * as t from '@babel/types';
import fs from 'fs';
import path from 'path';
import { I18nScope } from '../iom';

export default function createArtifactor(i18nRoot: string, supportedLocales: string[]) {
  const debugRoot = path.resolve(process.cwd(), '.replexica');
  const metaRoot = path.resolve(debugRoot, 'meta');
  const codeRoot = path.resolve(debugRoot, 'code');

  return {
    storeMetadata(fileId: string, i18nTree: any) {
      const payload = {
        [fileId]: i18nTree
      };
      _mergeAsJson(path.resolve(metaRoot, 'i18n-tree.json'), payload);
    },
    storeOriginalCode(code: string, filePath: string) {
      const relativePath = path.relative(process.cwd(), filePath);
      let targetFilePath = path.resolve(codeRoot, relativePath);
      targetFilePath = _addExtensionSuffix(targetFilePath, 'pre');

      _saveAsText(targetFilePath, code);
    },
    storeTransformedCode(code: string, filePath: string) {
      const relativePath = path.relative(process.cwd(), filePath);
      let targetFilePath = path.resolve(codeRoot, relativePath);
      targetFilePath = _addExtensionSuffix(targetFilePath, 'post');

      _saveAsText(targetFilePath, code);
    },
    storeI18nTree(i18nTree: I18nScope, filePath: string) {
      const relativePath = path.relative(process.cwd(), filePath);
      let targetFilePath = path.resolve(codeRoot, relativePath);
      targetFilePath = _replaceExtension(targetFilePath, 'i18n.json');

      _writeAsJson(targetFilePath, i18nTree);
    },
    storeOriginalAst(ast: t.File, filePath: string) {
      const relativePath = path.relative(process.cwd(), filePath);
      let targetFilePath = path.resolve(codeRoot, relativePath);
      targetFilePath = _replaceExtension(targetFilePath, 'pre.ast.json');

      _writeAsJson(targetFilePath, ast);
    },
    storeTransformedAst(ast: t.File, filePath: string) {
      const relativePath = path.relative(process.cwd(), filePath);
      let targetFilePath = path.resolve(codeRoot, relativePath);
      targetFilePath = _replaceExtension(targetFilePath, 'post.ast.json');

      _writeAsJson(targetFilePath, ast);
    },
    createMockLocaleModules() {
      for (const locale of supportedLocales) {
        const localeFile = path.resolve(i18nRoot, `${locale}.json`);
        const payload = _createMockLocaleFilePayload();
        _writeAsJson(localeFile, payload);
      }
    },
    invalidateMockLocaleModules() {
      return this.createMockLocaleModules();
    },
    deleteMockLocaleModules() {
      for (const locale of supportedLocales) {
        const localeFile = path.resolve(i18nRoot, `${locale}.json`);
        if (fs.existsSync(localeFile)) {
          fs.unlinkSync(localeFile);
        }
      }
    }
  };

  function _addExtensionSuffix(filePath: string, suffix: string) {
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath, fileExt);
    const fileDir = path.dirname(filePath);
    const fileBase = `${fileName}.${suffix}${fileExt}`;
    return path.resolve(fileDir, fileBase);
  }

  function _replaceExtension(filePath: string, newExt: string) {
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath, fileExt);
    const fileDir = path.dirname(filePath);
    const fileBase = `${fileName}.${newExt}`;
    return path.resolve(fileDir, fileBase);
  }

  function _mergeAsJson(filePath: string, data: any) {
    const existingData = _loadAsJson(filePath);
    const mergedData = { ...existingData, ...data };
    _writeAsJson(filePath, mergedData);

    return mergedData;
  }

  function _writeAsJson(filePath: string, data: any) {
    const jsonString = JSON.stringify(data, null, 2);
    _saveAsText(filePath, jsonString);
  }

  function _loadAsJson(filePath: string): any {
    const content = _loadAsText(filePath);
    if (!content) { return null; }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  function _loadAsText(filePath: string): string | null {
    const exists = fs.existsSync(filePath);
    if (!exists) { return null; }

    return fs.readFileSync(filePath, 'utf8');
  }

  function _saveAsText(filePath: string, data: string) {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    fs.writeFileSync(filePath, data, 'utf8');
  }

  function _createMockLocaleFilePayload() {
    return {
      '//': new Date().toISOString(),
    };
  }
}