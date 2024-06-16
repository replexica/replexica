import fs from 'fs';
import path from 'path';
import { I18nScope } from '../iom';

// functional version below

export default function createArtifactor(filePath: string, fileId: string, artifactsDir: string) {
  const i18nTreePath = path.resolve(artifactsDir, '.json');
  const debugDir = path.resolve(process.cwd(), '.replexica');
  const relativeFileId = path.relative(process.cwd(), filePath);

  return {
    storeMetadata(i18nTree: I18nScope) {
      const payload = {
        [fileId]: i18nTree,
      };
      _mergeAsJson(i18nTreePath, payload);
    },
    storeSourceDictionary(i18nTree: I18nScope, sourceLocale: string) {
      const defaultLocalePath = path.resolve(artifactsDir, `${sourceLocale}.json`);

      const payload = _extractDictionary(i18nTree);

      return _mergeAsJson(defaultLocalePath, payload);
    },
    storeStubDictionaries(targetLocales: string[]) {
      for (const targetLocale of targetLocales) {
        const targetLocalePath = path.resolve(artifactsDir, `${targetLocale}.json`);

        const payload = {};

        _mergeAsJson(targetLocalePath, payload);
      }
    },
    storeOriginalCode(code: string) {
      const debugFilePath = path.resolve(debugDir, relativeFileId);
      const targetFilePath = _addExtensionSuffix(debugFilePath, 'pre');

      _saveAsText(targetFilePath, code);
    },
    storeTransformedCode(code: string) {
      const debugFilePath = path.resolve(debugDir, relativeFileId);
      const targetFilePath = _addExtensionSuffix(debugFilePath, 'post');

      _saveAsText(targetFilePath, code);
    },
    storeI18nTree(i18nTree: I18nScope) {
      const debugFilePath = path.resolve(debugDir, relativeFileId);
      const targetFilePath = _replaceExtension(debugFilePath, 'i18n.json');

      _writeAsJson(targetFilePath, i18nTree);
    },
  };

  // helper functions

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

  function _extractDictionary(scope: I18nScope) {
    const dictionary: Record<string, string> = {};

    for (const fragment of scope.fragments) {
      const key = [
        fileId,
        scope.data.id,
        fragment.data.id,
      ].join('#');

      dictionary[key] = fragment.data.value;
    }

    for (const childScope of scope.scopes) {
      const childDictionary = _extractDictionary(childScope);
      Object.assign(dictionary, childDictionary);
    }

    return dictionary;
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
}
