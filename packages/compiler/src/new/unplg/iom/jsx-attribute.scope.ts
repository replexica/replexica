import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nScope, I18nScopeData, I18nScopeExtractor } from './.scope';
import { JsTextFragment } from './js-text.fragment';

export class JsxAttributeScope extends I18nScope<'jsx/attribute', 'js/text'> {
  public static fromNodePath(rootExtractor: I18nScopeExtractor) {
    return (nodePath: NodePath<t.Node>, id: string) => {
      if (!t.isJSXAttribute(nodePath.node)) { return null; }

      const jsxAttr = nodePath.node;
      const jsxAttrName = jsxAttr.name.name;
      if (!(typeof jsxAttrName === 'string')) { return null; }
      if (!isLocalizableAttributeName(jsxAttrName)) { return null; }
      if (isSystemAttributeName(jsxAttrName)) { return null; }

      const hostJsxElementNodePath = nodePath.parentPath?.parentPath;
      if (!hostJsxElementNodePath?.isJSXElement()) {
        throw new Error('JSX attribute must be a child of a JSX element.');
      }

      return new JsxAttributeScope(
        nodePath as NodePath<t.JSXAttribute>,
        {
          role: 'scope',
          type: 'jsx/attribute',
          id,
          hint: '',
          explicit: false,
        },
        rootExtractor,
        hostJsxElementNodePath);
    }
  }

  private constructor(
    public nodePath: NodePath<t.JSXAttribute>,
    public data: I18nScopeData<'jsx/attribute', 'js/text'>,
    protected rootExtractor: I18nScopeExtractor,
    private readonly hostJsxElementNodePath: NodePath<t.JSXElement>,
  ) {
    super(nodePath, data, rootExtractor);
  }

  public injectOwnI18n(ast: t.File): void {
    // TODO: Replace JSX Element with an I18n Proxy.
  }

  public initFragments(): void {
    const fragment = JsTextFragment.fromAttributeValue(this.nodePath, '');
    if (!fragment) { return; }

    this.fragments.push(fragment);
  }
}

// helper functions

function isLocalizableAttributeName(name: string) {
  const commonlyLocalizableAttributes = [
    'title', // Used to render a tooltip when the user hovers over the element
    'alt', // Used to provide a text alternative for images
    'placeholder', // Used to provide a hint to the user of what can be entered in the input
    'label', // Used to provide a label for form elements
  ];

  return commonlyLocalizableAttributes.includes(name);
}

function isSystemAttributeName(name: string) {
  if (name.startsWith('data-')) { return true; }
  if ([
    'key',
  ].includes(name)) { return true; }

  return false;
}

function getJsxElementName(element: t.JSXFragment | t.JSXElement): string {
  if (t.isJSXFragment(element)) {
    return 'Fragment';
  } else if (t.isJSXIdentifier(element.openingElement.name)) {
    return element.openingElement.name.name;
  } else if (t.isJSXNamespacedName(element.openingElement.name)) {
    return `${element.openingElement.name.namespace.name}:${element.openingElement.name.name.name}`;
  } else {
    throw new Error('Could not parse JSX element name: invalid element type');
  }
}