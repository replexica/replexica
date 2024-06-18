import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nInjectionParams, I18nScope, I18nScopeData, I18nScopeExtractor } from './_scope';
import { JsTextFragment } from './js-text.fragment';
import createCodeWriter from '../workers/writer';
import { CLIENT_IMPORT_MODULE, I18N_ACCESS_METHOD, I18N_IMPORT_NAME, I18N_LOADER_PROP, NEXTJS_IMPORT_MODULE, PROXY_IMPORT_NAME } from './_const';
import { parseMemberExpressionFromJsxMemberExpression } from './_utils';

export class JsxAttributeScope extends I18nScope<'jsx/attribute', 'js/text'> {
  public static fromNodePath(rootExtractor: I18nScopeExtractor) {
    return (nodePath: NodePath<t.Node>, index: number) => {
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
          name: jsxAttrName,
          hint: '',
          explicit: false,
        },
        index,
        rootExtractor,
        hostJsxElementNodePath.node,
      );
    }
  }

  private constructor(
    public nodePath: NodePath<t.JSXAttribute>,
    public data: I18nScopeData<'jsx/attribute', 'js/text'>,
    public readonly index: number,
    protected rootExtractor: I18nScopeExtractor,
    private readonly hostJsxElement: t.JSXElement,
  ) {
    super(nodePath, data, index, rootExtractor);
  }

  public injectOwnI18n(ast: t.File, params: I18nInjectionParams): void {
    if (!this.fragments.length) { return; }

    const writer = createCodeWriter(ast);

    const idParams = {
      fileId: params.fileId,
      scopeId: this.hash,
      chunkId: this.fragments[0].index.toString(),
    };

    const shouldSwapJsxHost = !this._isHostJsxProxied();
    if (shouldSwapJsxHost) {
      if (params.isClientCode) {
        this._initHostJsxClientProxy(writer);
      } else {
        this._initHostJsxServerProxy(writer);
      }
    }

    const dollarAttr = writer.upsertJsxAttribute(
      this.hostJsxElement,
      '$',
      t.objectExpression([]),
    );

    if (t.isJSXExpressionContainer(dollarAttr.value) && t.isObjectExpression(dollarAttr.value.expression)) {
      // Add identification property
      dollarAttr.value.expression.properties.push(
        t.objectProperty(
          t.identifier('attributes'),
          t.objectExpression([
            t.objectProperty(
              t.identifier(this.data.name),
              t.objectExpression([
                t.objectProperty(
                  t.identifier('fileId'),
                  t.stringLiteral(idParams.fileId),
                ),
                t.objectProperty(
                  t.identifier('scopeId'),
                  t.stringLiteral(idParams.scopeId),
                ),
                t.objectProperty(
                  t.identifier('chunkId'),
                  t.stringLiteral(idParams.chunkId),
                ),
              ]),
            ),
          ]),
        ),
      );
    }
  }

  public initFragments(): void {
    const fragment = JsTextFragment.fromAttributeValue(this.nodePath, 0);
    if (!fragment) { return; }

    this.fragments.push(fragment);
  }

  // private helper functions

  private _isHostJsxProxied() {
    return t.isJSXElement(this.hostJsxElement)
      && t.isJSXIdentifier(this.hostJsxElement.openingElement.name)
      && this.hostJsxElement.openingElement.name.name === PROXY_IMPORT_NAME;
  }

  private _initHostJsxClientProxy(writer: ReturnType<typeof createCodeWriter>): void {
    const proxyImport = writer.upsertNamedImport(CLIENT_IMPORT_MODULE, PROXY_IMPORT_NAME);
    this._initHostJsxProxy(writer, proxyImport.name);
  }

  private _initHostJsxServerProxy(writer: ReturnType<typeof createCodeWriter>) {
    const proxyImport = writer.upsertNamedImport(NEXTJS_IMPORT_MODULE, PROXY_IMPORT_NAME);
    const i18nInstanceImport = writer.upsertNamedImport(NEXTJS_IMPORT_MODULE, I18N_IMPORT_NAME);

    this._initHostJsxProxy(writer, proxyImport.name);

    const dollarAttr = writer.upsertJsxAttribute(
      this.hostJsxElement, 
      '$',
      t.objectExpression([]),
    );

    if (t.isJSXExpressionContainer(dollarAttr.value) && t.isObjectExpression(dollarAttr.value.expression)) {
      dollarAttr.value.expression.properties.push(
        t.objectProperty(
          t.identifier(I18N_LOADER_PROP),
          t.arrowFunctionExpression(
            [],
            t.callExpression(
              t.memberExpression(
                t.identifier(i18nInstanceImport.name),
                t.identifier(I18N_ACCESS_METHOD),
              ),
              [],
            ),
          ),
        ),
      );
    }
  }

  private _initHostJsxProxy(writer: ReturnType<typeof createCodeWriter>, proxyName: string) {
    // Identify host jsx element's component type, to be used in the proxy component's React.createElement call.
    // Note: must be called before swapping the host jsx element with the proxy component.
    const hostElementComponent = getJsxComponentType(this.hostJsxElement);
    // swap host's opening element
    this.hostJsxElement.openingElement.name = t.jsxIdentifier(proxyName);
    // swap host's closing element if it exists
    if (t.isJSXClosingElement(this.hostJsxElement.closingElement)) {
      this.hostJsxElement.closingElement.name = t.jsxIdentifier(proxyName);
    }
    // init dollar prop
    const dollarAttribute = writer.upsertJsxAttribute(
      this.hostJsxElement,
      '$',
      t.objectExpression([]),
    );
    // set $={{ Component: 'div' }}
    if (t.isJSXExpressionContainer(dollarAttribute.value) && t.isObjectExpression(dollarAttribute.value.expression)) {
      dollarAttribute.value.expression.properties.push(
        t.objectProperty(
          t.identifier('Component'),
          hostElementComponent,
        ),
      );
    }
  }
}

// helper functions

// This returns what can be passed to React.createElement
function getJsxComponentType(element: t.JSXElement) {
  // Cases:
  // 1. <div /> - Built-in element, must be passed to React.createElement as string literal
  // 2. <Component /> - Custom component, must be passed to React.createElement as identifier
  // 3. <Component.Prop />, <Component.Prop.prop />, etc. - Custom component with prop, must be passed to React.createElement as member expression
  // 4. Must throw an error if it's not one of the above cases

  if (t.isJSXIdentifier(element.openingElement.name)) {
    // Case 1. Simple built-in element
    if (element.openingElement.name.name.toLowerCase() === element.openingElement.name.name) {
      return t.stringLiteral(element.openingElement.name.name);
    }
    // Case 2. Custom component
    else {
      return t.identifier(element.openingElement.name.name);
    }
  } else if (t.isJSXMemberExpression(element.openingElement.name)) {
    // Case 3. Custom component with prop
    return parseMemberExpressionFromJsxMemberExpression(element.openingElement.name);
  } else {
    throw new Error(`Couldn't parse JSX component type, ${element.openingElement.name.type} is not supported.`);
  }
}

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
