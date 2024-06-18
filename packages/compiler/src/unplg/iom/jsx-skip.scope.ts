import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nScope, I18nScopeData, I18nScopeExtractor } from './_scope';
import { getJsxElementName } from './_utils';

export class JsxSkipScope extends I18nScope<'jsx/skip', 'jsx/text'> {
  public static fromExplicitNodePath(rootExtractor: I18nScopeExtractor) {
    return (nodePath: NodePath<t.Node>, index: number) => {
      // Exit if the node is not a JSX element.
      if (!t.isJSXElement(nodePath.node)) { return null; }

      // Exit if the node does not have a `data-i18n` attribute.
      const i18nAttr = nodePath.node.openingElement.attributes.find((a) => {
        if (!t.isJSXAttribute(a)) { return false; }
        return a.name.name === 'data-i18n';
      }) as t.JSXAttribute | undefined;
      if (!i18nAttr) { return null; }

      // Exit if the `data-i18n` attribute is not set to a boolean literal.
      if (!t.isJSXExpressionContainer(i18nAttr.value)) { return null; }
      if (!t.isBooleanLiteral(i18nAttr.value.expression)) { return null; }
      
      // Exit if the `data-i18n` attribute is set to `true`.
      const i18nAttrValue = i18nAttr.value.expression.value;
      if (i18nAttrValue) { return null; }

      // Get JSX element name
      const elementName = getJsxElementName(nodePath.node);

      return new JsxSkipScope(nodePath, {
        role: 'scope',
        type: 'jsx/skip',
        name: elementName,
        hint: '',
        explicit: true,
      }, index, rootExtractor);
    }
  }

  private constructor(
    public nodePath: NodePath<t.Node>,
    public data: I18nScopeData<'jsx/skip', never>,
    public readonly index: number,
    protected rootExtractor: I18nScopeExtractor,
  ) {
    super(nodePath, data, index, rootExtractor);
  }
}
