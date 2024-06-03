import * as t from '@babel/types';
import { createWorker } from '../../base';
import { NodePath } from '@babel/core';
import { FRAGMENT_LABEL_ATTRIBUTE } from './_types';

export default createWorker<t.JSXText>({
  name: 'naked-fragment-extractor',
  runIf: ({ nodePath }) => {
    const isJsxText = t.isJSXText(nodePath.node);
    if (!isJsxText) { return false; }

    const jsxTextValue = nodePath.node.value.trim();
    if (!jsxTextValue) { return false; }

    const parentJsxElem = nodePath.findParent((p) => t.isJSXElement(p.node)) as NodePath<t.JSXElement> | null;
    if (!parentJsxElem) { return false; }

    const hasNonTextSibling = parentJsxElem.get('children').find((sibling) => !t.isJSXText(sibling.node));
    if (!hasNonTextSibling) { return false; }

    return true;
  },
  post: ({ nodePath }) => {
    const jsxTextChildValue = nodePath.node.value.trim();

    const i18nFragment = t.jsxElement(
      t.jsxOpeningElement(
        t.jsxIdentifier('I18nFragment'),
        [
          { type: 'JSXAttribute', name: t.jsxIdentifier('id'), value: t.stringLiteral(jsxTextChildValue) },
          { type: 'JSXAttribute', name: t.jsxIdentifier(FRAGMENT_LABEL_ATTRIBUTE), value: t.stringLiteral('naked') },
        ],
        true,
      ),
      null,
      [],
    );

    nodePath.replaceWith(i18nFragment);
  },
});
