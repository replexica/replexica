import * as t from '@babel/types';
import { createWorker } from '../../base';
import { FRAGMENT_LABEL_ATTRIBUTE } from './_types';

/**
 * Extracts I18n fragments from JSX elements with a single non-empty JSXText child.
 */
export default createWorker<t.JSXElement>({
  shouldRun: ({ nodePath }) => {
    const isJsxElem = t.isJSXElement(nodePath.node);
    if (!isJsxElem) { return false; }

    const jsxTextChild = nodePath.node.children?.find((child) => t.isJSXText(child)) as t.JSXText | undefined;
    const jsxTextChildValue = jsxTextChild?.value.trim();
    const hasNonEmptyJsxTextChild = !!jsxTextChildValue;
    if (!hasNonEmptyJsxTextChild) { return false; }

    return true;
  },
  post: ({ nodePath }) => {
    nodePath.node.openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier(FRAGMENT_LABEL_ATTRIBUTE),
        t.stringLiteral('simple'),
      ),
    );
  },
});