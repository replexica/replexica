import * as t from '@babel/types';
import { createWorker } from "../base";
import { NodePath } from '@babel/core';

export default createWorker<t.JSXElement>({
  shouldRun: ({ nodePath }) => {
    // - The node is a JSXElement
    const isJsxElem = t.isJSXElement(nodePath.node);
    if (!isJsxElem) { return false; }

    // - The node has a JSXText as one of its direct children, that isn't empty when trimmed
    const jsxTextChild = nodePath.node.children?.find((child) => t.isJSXText(child)) as t.JSXText | undefined;
    const jsxTextChildValue = jsxTextChild?.value.trim();
    const hasNonEmptyJsxTextChild = !!jsxTextChildValue;
    if (!hasNonEmptyJsxTextChild) { return false; }

    // - The node doesn't have JSXText among its siblings, or have JSXText siblings that are empty when trimmed
    const parentJsxElem = nodePath.findParent((path) => t.isJSXElement(path.node)) as NodePath<t.JSXElement> | undefined;
    const jsxTextSibling = parentJsxElem?.node.children?.find((child) => t.isJSXText(child)) as t.JSXText | undefined;
    const jsxTextSiblingValue = jsxTextSibling?.value.trim();
    const hasNonEmptyJsxTextSibling = !!jsxTextSiblingValue;
    if (hasNonEmptyJsxTextSibling) { return false; }

    return true;
  },
  run: ({ nodePath }) => {
    // add data-replexica-been-here attribute to the title element
    nodePath.node.openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('data-replexica-scope'),
      )
    );
  },
});