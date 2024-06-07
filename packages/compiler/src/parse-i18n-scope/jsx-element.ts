import * as t from '@babel/types';
import { createScopeParser } from "./_utils";
import { NodePath } from '@babel/core';
import { I18nFragment } from './_types';

const parseJsxTextFragments = (nodePath: NodePath<t.JSXElement | t.JSXFragment>): I18nFragment[] => {
  const result: I18nFragment[] = [];

  nodePath.traverse({
    JSXText(childPath: NodePath<t.JSXText>) {
      const jsxText = childPath.node;
      const value = jsxText.value.trim();
      if (!value) { return null; }
    
      result.push({
        role: 'fragment',
        type: 'text',
        value,
      });
    },
  });

  return result;
};

export const jsxElementScopeParser = createScopeParser({
  selector: (nodePath) => {
    if (!t.isJSXElement(nodePath.node) && !t.isJSXFragment(nodePath.node)) { return false; }

    const jsxEl = nodePath.node;
    const jsxTextChildren = jsxEl.children.filter((c) => t.isJSXText(c)) as t.JSXText[];
    const nonEmptyJsxTextChildren = jsxTextChildren.filter((c) => c.value.trim());
    const hasNonEmptyJsxTextChildren = nonEmptyJsxTextChildren.length > 0;
    if (!hasNonEmptyJsxTextChildren) { return false; }

    const jsxParentEl = nodePath.findParent((p) => t.isJSXElement(p.node) || t.isJSXFragment(p.node)) as NodePath<t.JSXElement | t.JSXFragment> | null;
    const siblingJsxTextChildren = jsxParentEl?.node.children.filter((c) => t.isJSXText(c)) as t.JSXText[] | undefined;
    const nonEmptySiblingJsxTextChildren = siblingJsxTextChildren?.filter((c) => c.value.trim());
    const hasNonEmptySiblingJsxTextChildren = !!nonEmptySiblingJsxTextChildren?.length;
    if (hasNonEmptySiblingJsxTextChildren) { return false; }

    return true;
  },
  parseFragments: parseJsxTextFragments,
  type: 'jsx/element',
  explicit: false,
});

export const explicitJsxElementScopeParser = createScopeParser({
  selector: (nodePath) => {
    if (!t.isJSXElement(nodePath.node)) { return false; }

    const i18nAttr = nodePath.node.openingElement.attributes.find((a) => {
      if (!t.isJSXAttribute(a)) { return false; }
      return a.name.name === 'data-i18n';
    }) as t.JSXAttribute | undefined;

    return !!i18nAttr;
  },
  parseFragments: () => [],
  type: 'jsx/element',
  explicit: true,
});