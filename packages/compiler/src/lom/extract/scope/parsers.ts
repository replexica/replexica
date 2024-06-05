import * as t from '@babel/types';
import { getJsxElementName } from '../../_ast';
import { I18nNodeParser } from '../_core';

export const fromJsxElement: I18nNodeParser = (path, id) => {
  const jsxEl = t.isJSXElement(path.node) || t.isJSXFragment(path.node) ? path.node : null;
  if (!jsxEl) { return null; }

  const jsxTextChildren = jsxEl.children.filter((c) => t.isJSXText(c)) as t.JSXText[];
  const nonEmptyJsxTextChildren = jsxTextChildren.filter((c) => c.value.trim());
  const hasNonEmptyJsxTextChildren = nonEmptyJsxTextChildren.length > 0;
  if (!hasNonEmptyJsxTextChildren) { return null; }

  const elementName = getJsxElementName(jsxEl);

  return {
    id,
    value: elementName,
    nodes: [],
  };
};
