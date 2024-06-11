import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nInjectionParams, I18nScope, I18nScopeData, I18nScopeExtractor } from './.scope';
import createCodeWriter from '../workers/writer';
import { JsxTextFragment } from './jsx-text.fragment';
import { I18N_ACCESS_METHOD, I18N_IMPORT_MODULE, I18N_IMPORT_NAME, I18N_LOADER_PROP, NEXTJS_FRAGMENT_IMPORT_MODULE, FRAGMENT_IMPORT_NAME, CLIENT_IMPORT_MODULE } from './_const';

export class JsxElementScope extends I18nScope<'jsx/element', 'jsx/text'> {
  public static fromNodePath(rootExtractor: I18nScopeExtractor) {
    return (nodePath: NodePath<t.Node>, id: string) => {
      if (!t.isJSXElement(nodePath.node) && !t.isJSXFragment(nodePath.node)) { return null; }

      const jsxEl = nodePath.node;
      const jsxTextChildren = jsxEl.children.filter((c) => t.isJSXText(c)) as t.JSXText[];
      const nonEmptyJsxTextChildren = jsxTextChildren.filter((c) => c.value.trim());
      const hasNonEmptyJsxTextChildren = nonEmptyJsxTextChildren.length > 0;
      if (!hasNonEmptyJsxTextChildren) { return null; }

      const jsxParentEl = nodePath.findParent((p) => t.isJSXElement(p.node) || t.isJSXFragment(p.node)) as NodePath<t.JSXElement | t.JSXFragment> | null;
      const siblingJsxTextChildren = jsxParentEl?.node.children.filter((c) => t.isJSXText(c)) as t.JSXText[] | undefined;
      const nonEmptySiblingJsxTextChildren = siblingJsxTextChildren?.filter((c) => c.value.trim());
      const hasNonEmptySiblingJsxTextChildren = !!nonEmptySiblingJsxTextChildren?.length;
      if (hasNonEmptySiblingJsxTextChildren) { return null; }

      return new JsxElementScope(nodePath, {
        role: 'scope',
        type: 'jsx/element',
        id,
        hint: '',
        explicit: false,
      }, rootExtractor);
    };
  }

  public static fromExplicitNodePath(rootExtractor: I18nScopeExtractor) {
    return (nodePath: NodePath<t.Node>, id: string) => {
      if (!t.isJSXElement(nodePath.node)) { return null; }

      const i18nAttr = nodePath.node.openingElement.attributes.find((a) => {
        if (!t.isJSXAttribute(a)) { return false; }
        return a.name.name === 'data-i18n';
      }) as t.JSXAttribute | undefined;
      if (!i18nAttr) { return null; }

      return new JsxElementScope(nodePath, {
        role: 'scope',
        type: 'jsx/element',
        id,
        hint: '',
        explicit: true,
      }, rootExtractor);
    }
  }

  private constructor(
    public nodePath: NodePath<t.Node>,
    public data: I18nScopeData<'jsx/element', 'jsx/text'>,
    protected rootExtractor: I18nScopeExtractor,
  ) {
    super(nodePath, data, rootExtractor);
  }

  protected injectOwnI18n(params: I18nInjectionParams): void {
    if (!this.fragments.length) { return; }

    const writer = createCodeWriter(params.ast);

    for (const fragment of this.fragments) {
      const fragmentFactory = params.isClientCode
        ? this._createClientFragmentElement
        : this._createServerFragmentElement;

      const element = fragmentFactory(writer, {
        fileId: params.fileId,
        scopeId: this.data.id,
        chunkId: fragment.data.id,
      })

      fragment.nodePath.replaceWith(element);
    }
  }

  public initFragments() {
    if (this.data.explicit) { return; }

    const self = this;
    let index = 0;
    this.nodePath.traverse({
      JSXText(childPath: NodePath<t.JSXText>) {
        const fragment = JsxTextFragment.fromNodePath(childPath, String(index));
        if (fragment) {
          self.fragments.push(fragment);
          index++;
        }
      },
    });
  }

  // helper functions

  private _createClientFragmentElement(
    writer: ReturnType<typeof createCodeWriter>,
    params: { fileId: string, scopeId: string, chunkId: string },
  ) {
    const fragmentImport = writer.upsertNamedImport(CLIENT_IMPORT_MODULE, FRAGMENT_IMPORT_NAME);
    const result = this._createFragmentElement(fragmentImport.name, params);
    return result;
  }

  private _createServerFragmentElement(
    writer: ReturnType<typeof createCodeWriter>,
    params: { fileId: string, scopeId: string, chunkId: string },
  ) {
    const fragmentImport = writer.upsertNamedImport(NEXTJS_FRAGMENT_IMPORT_MODULE, FRAGMENT_IMPORT_NAME);
    const i18nInstanceImport = writer.upsertNamedImport(I18N_IMPORT_MODULE, I18N_IMPORT_NAME);

    const result = this._createFragmentElement(fragmentImport.name, params);
    result.openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier(I18N_LOADER_PROP),
        t.jsxExpressionContainer(
          t.arrowFunctionExpression(
            [],
            t.callExpression(
              t.memberExpression(t.identifier(i18nInstanceImport.name), t.identifier(I18N_ACCESS_METHOD)),
              [],
            ),
          ),
        ),
      )
    );

    return result;
  }

  private _createFragmentElement(
    componentName: string,
    params: { fileId: string, scopeId: string, chunkId: string },
  ) {
    return t.jsxElement(
      t.jsxOpeningElement(
        t.jsxIdentifier(componentName),
        [
          t.jsxAttribute(t.jsxIdentifier('fileId'), t.stringLiteral(params.fileId)),
          t.jsxAttribute(t.jsxIdentifier('scopeId'), t.stringLiteral(params.scopeId)),
          t.jsxAttribute(t.jsxIdentifier('chunkId'), t.stringLiteral(params.chunkId)),
        ],
        true,
      ),
      null,
      [],
    );
  }
}
