import * as t from '@babel/types';
import { NodePath } from '@babel/core';

export type I18nNodeRole = 'context' | 'scope' | 'fragment';

export type I18nNode = {
  id: string;
  role: I18nNodeRole;
  value: string;
  nodes: I18nNode[];
}

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
  (path: NodePath<t.Node>, id: string): Omit<I18nNode, 'role'> | null;
};
export const composeParsers = (role: I18nNodeRole, ...parsers: I18nNodeParser[]): I18nNodeParser => {
  return (path, id) => {
    for (const parser of parsers) {
      const node = parser(path, id);
      if (node) { return { ...node, role }; }
    }
    return null;
  }
}