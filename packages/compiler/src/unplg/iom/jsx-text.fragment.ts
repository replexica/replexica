import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nFragment } from './_fragment';

export class JsxTextFragment extends I18nFragment<'jsx/text'> {
  public static fromNodePath(nodePath: NodePath<t.JSXText>, index: number) {
    const jsxText = nodePath.node;
    let value = jsxText.value.trim();
    if (!value) { return null; }
    value = ' ' + value + ' ';

    return new JsxTextFragment(nodePath, {
      role: 'fragment',
      type: 'jsx/text',
      value,
    }, index);
  }
}