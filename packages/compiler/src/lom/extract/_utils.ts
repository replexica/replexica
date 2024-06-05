import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nNode, I18nNodeRole } from './_types';

export type I18nNodeExtractor = {
  (path: NodePath<t.Node>): I18nNode | null;
};
export const composeExtractors = (...extractors: I18nNodeExtractor[]): I18nNodeExtractor => {
  return (path) => {
    for (const extractor of extractors) {
      const node = extractor(path);
      if (node) { return node; }
    }
    return null;
  }
}

export type I18nNodeParser = {
  (path: NodePath<t.Node>): Omit<I18nNode, 'role'> | null;
};
export const composeParsers = (role: I18nNodeRole, ...parsers: I18nNodeParser[]): I18nNodeExtractor => {
  return (path) => {
    for (const parser of parsers) {
      const node = parser(path);
      if (node) { return { role, ...node }; }
    }
    return null;
  }
}