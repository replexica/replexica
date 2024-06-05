import * as t from '@babel/types';
import { I18nNodeParser } from '../_utils';

export const fromNonEmptyJsxText: I18nNodeParser = (path) => {
  const jsxTextEl = t.isJSXText(path.node) ? path.node : null;
  if (!jsxTextEl) { return null; }

  const value = jsxTextEl.value.trim();
  if (!value) { return null; }

  return {
    value,
    nodes: [],
  };
}