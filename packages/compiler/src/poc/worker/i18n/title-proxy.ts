import * as t from '@babel/types';
import { createWorker } from "../base";

export default createWorker<t.JSXElement>({
  // runs when the worker is called on a <title> element
  shouldRun: ({ nodePath }) => {
    return t.isJSXElement(nodePath.node) && t.isJSXIdentifier(nodePath.node.openingElement.name, { name: 'title' });
  },
  run: ({ nodePath }) => {
    // add data-replexica-been-here attribute to the title element
    nodePath.node.openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('data-replexica-been-here'),
      )
    );
  },
});
