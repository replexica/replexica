import * as t from '@babel/types';
import { createWorker } from '../../base';
import { FRAGMENT_LABEL_ATTRIBUTE } from './_types';

export default createWorker<t.JSXElement>({
  name: 'simple-fragment-extractor',
  runIf: ({ nodePath }) => {
    const isJsxElem = t.isJSXElement(nodePath.node);
    if (!isJsxElem) { return false; }

    const jsxTextChild = nodePath.node.children?.find((child) => t.isJSXText(child)) as t.JSXText | undefined;
    const jsxTextChildValue = jsxTextChild?.value.trim();
    const hasNonEmptyJsxTextChild = !!jsxTextChildValue;
    if (!hasNonEmptyJsxTextChild) { return false; }

    return true;
  },
  post: ({ nodePath }) => {
    const jsxTextChild = nodePath.node.children?.find((child) => t.isJSXText(child)) as t.JSXText | undefined;
    const jsxTextChildValue = jsxTextChild?.value.trim();
    if (!jsxTextChildValue) { return; }

    const i18nFragment = t.jsxElement(
      t.jsxOpeningElement(
        t.jsxIdentifier('I18nFragment'),
        [
          { type: 'JSXAttribute', name: t.jsxIdentifier('id'), value: t.stringLiteral(jsxTextChildValue) },
          { type: 'JSXAttribute', name: t.jsxIdentifier(FRAGMENT_LABEL_ATTRIBUTE), value: t.stringLiteral('simple') },
        ],
        true,
      ),
      null,
      [],
    );

    nodePath.replaceWith(i18nFragment);
  },
});