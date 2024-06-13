import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nFragment } from './_fragment';

export class JsxTextFragment extends I18nFragment<'jsx/text'> {
  public static fromNodePath(nodePath: NodePath<t.JSXText>, id: string) {
    const jsxText = nodePath.node;
    const value = jsxText.value.trim();
    if (!value) { return null; }

    return new JsxTextFragment(nodePath, {
      role: 'fragment',
      type: 'jsx/text',
      id,
      value,
    });
  }
}