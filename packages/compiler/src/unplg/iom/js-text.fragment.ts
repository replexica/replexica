import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nFragment } from './_fragment';

export class JsTextFragment extends I18nFragment<'js/text'> {
  public static fromAttributeValue(nodePath: NodePath<t.JSXAttribute>, index: number) {
    if (!nodePath.isJSXAttribute()) { return null; }

    const jsxAttrValue = nodePath.node.value;
    // Only string literals are supported for now
    if (!t.isStringLiteral(jsxAttrValue)) { return null; }
    if (!jsxAttrValue.value.trim()) { return null; }

    return new JsTextFragment(nodePath, {
      role: 'fragment',
      type: 'js/text',
      value: jsxAttrValue.value,
    }, index);
  }
}