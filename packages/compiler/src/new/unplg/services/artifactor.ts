import fs from 'fs';
import path from 'path';
import { I18nScope } from '../_types';
import crypto from 'crypto';
import { generateFileIdHash } from '@/utils/id';

// functional version below

export default function createArtifactor(fileId: string) {
  const artifactsDir = path.resolve(process.cwd(), 'node_modules', '@replexica/.cache');
  const i18nTreePath = path.resolve(artifactsDir, '.json');
  const debugDir = path.resolve(process.cwd(), '.replexica');
  const relativeFileId = path.relative(process.cwd(), fileId);

  return {
    storeMetadata(i18nTree: I18nScope) {
      const fileIdHash = generateFileIdHash(fileId);
      const payload = {
        [fileIdHash]: i18nTree,
      };
      _mergeAsJson(i18nTreePath, payload);
    },
    storeSourceDictionary(i18nTree: I18nScope, sourceLocale: string) {
      const defaultLocalePath = path.resolve(artifactsDir, `${sourceLocale}.json`);

      const fileIdHash = generateFileIdHash(fileId);

      const payload = _extractDictionary(i18nTree, {}, fileIdHash);

      _mergeAsJson(defaultLocalePath, payload);
    },
    storeStubDictionaries(targetLocales: string[]) {
      const fileIdHash = generateFileIdHash(fileId);

      for (const targetLocale of targetLocales) {
        const targetLocalePath = path.resolve(artifactsDir, `${targetLocale}.json`);

        const payload = {
          [fileIdHash]: {},
        };

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

  function _extractDictionary(i18nTree: I18nScope, rootDictionary: Record<string, string[]> = {}, rootKey = '') {
    const dictionary: Record<string, string[]> = {
      ...rootDictionary,
      [rootKey]: [],
    };

    for (let i = 0; i < i18nTree.fragments.length; i++) {
      const fragment = i18nTree.fragments[i];

      dictionary[rootKey].push(fragment.value);
    }

    for (let i = 0; i < i18nTree.scopes.length; i++) {
      const scope = i18nTree.scopes[i];

      const key = [
        rootKey,
        String(i),
      ]
      .filter(Boolean)
      .join('.');

      const childDictionary = _extractDictionary(scope, dictionary, key);
      Object.assign(dictionary, childDictionary);
    }

    for (const [key, value] of Object.entries(dictionary)) {
      if (value.length === 0) {
        delete dictionary[key];
      }
    }

    return dictionary;
  }

  function _mergeAsJson(filePath: string, data: any) {
    const existingData = _loadAsJson(filePath);
    const mergedData = { ...existingData, ...data };
    _writeAsJson(filePath, mergedData);
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
