import * as t from '@babel/types';
import { attributeExists, getJsxElementName, getJsxParentLine, getStringAttributeValue } from "../../utils/ast";
import { ReplexicaScopeHint } from "../types";
import { NodePath } from '@babel/core';

export abstract class ReplexicaBaseScope {
  protected _extractBaseHints(path: NodePath<t.JSXElement | t.JSXFragment>): ReplexicaScopeHint[] {
    const result: ReplexicaScopeHint[] = [];

    const elementName = getJsxElementName(path);
    const elementHint = path.isJSXElement()
      ? getStringAttributeValue(path, 'data-replexica-hint')
      : null;

    result.unshift({
      type: 'element',
      name: elementName,
      hint: elementHint,
    });

    const parentLine = getJsxParentLine(path, []);
    for (const parent of parentLine) {
      if (!parent.isJSXElement()) { continue; }
      
      const hasHintAttribute = attributeExists(parent, 'data-replexica-hint');
      if (!hasHintAttribute) { continue; }

      const hintAttributeValue = getStringAttributeValue(parent, 'data-replexica-hint');
      if (!hintAttributeValue) { continue; }

      const elementName = getJsxElementName(parent);

      result.unshift({
        type: 'element',
        name: elementName,
        hint: hintAttributeValue,
      });
    }
    return result;
  }
}