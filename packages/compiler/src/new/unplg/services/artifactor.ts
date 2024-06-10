import fs from 'fs';
import path from 'path';
import { sourceLocaleSchema } from '@replexica/spec';
import { I18nScope } from '../_types';
import crypto from 'crypto';

export type CodeArtifactorParams = {
  fileId: string;
  sourceLocale: typeof sourceLocaleSchema._type;
};

// functional version below

export default function createArtifactor(params: CodeArtifactorParams) {
  const artifactsDir = path.resolve(process.cwd(), 'node_modules', '@replexica/.cache');
  const i18nTreePath = path.resolve(artifactsDir, '.json');
  const defaultLocalePath = path.resolve(artifactsDir, `${params.sourceLocale}.json`);

  // ensure the artifacts directory exists
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  return {
    storeMetadata(i18nTree: I18nScope) {
      const fileIdHash = _generateFileIdHash(params.fileId);
      const payload = {
        [fileIdHash]: i18nTree,
      };
      _mergeAsJson(i18nTreePath, payload);
    },
    storeDefaultDictionary(i18nTree: I18nScope) {
      const fileIdHash = _generateFileIdHash(params.fileId);

      const payload = _extractDictionary(i18nTree, {}, fileIdHash);

      _mergeAsJson(defaultLocalePath, payload);
    },
  };

  // helper functions

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

  // helper functions

function _generateFileIdHash(fileId: string): string {
  const hash = crypto.createHash('md5');
  hash.update(fileId);
  return hash.digest('base64').substring(0, 12);
}

  function _mergeAsJson(filePath: string, data: any) {
    const existingData = _loadAsJson(filePath);
    const mergedData = { ...existingData, ...data };
    _writeAsJson(filePath, mergedData);
  }

  function _writeAsJson(filePath: string, data: any) {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString);
  }

  function _loadAsJson(filePath: string): any {
    const exists = fs.existsSync(filePath);
    if (!exists) { return null; }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}