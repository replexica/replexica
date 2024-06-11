import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nScope, I18nScopeData, I18nScopeExtractor } from './.scope';
import createCodeWriter from '../workers/writer';
import { JsxTextFragment } from './jsx-text.fragment';
import { I18N_ACCESS_METHOD, I18N_IMPORT_MODULE, I18N_IMPORT_NAME, I18n_LOADER_PROP, NEXTJS_FRAGMENT_IMPORT_MODULE, NEXTJS_FRAGMENT_IMPORT_NAME } from './_const';

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

  protected injectOwnI18n(fileId: string, ast: t.File): void {
    if (!this.fragments.length) { return; }

    const writer = createCodeWriter(ast);
    const fragmentComponentImport = writer.upsertNamedImport(NEXTJS_FRAGMENT_IMPORT_MODULE, NEXTJS_FRAGMENT_IMPORT_NAME);
    const i18nInstanceImport = writer.upsertNamedImport(I18N_IMPORT_MODULE, I18N_IMPORT_NAME);

    for (const fragment of this.fragments) {
      fragment.nodePath.replaceWith(
        t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier(fragmentComponentImport.name),
            [
              t.jsxAttribute(
                t.jsxIdentifier(I18n_LOADER_PROP),
                t.jsxExpressionContainer(
                  t.arrowFunctionExpression(
                    [],
                    t.callExpression(
                      t.memberExpression(t.identifier(i18nInstanceImport.name), t.identifier(I18N_ACCESS_METHOD)),
                      [],
                    ),
                  ),
                ),
              ),
              t.jsxAttribute(t.jsxIdentifier('fileId'), t.stringLiteral(fileId)),
              t.jsxAttribute(t.jsxIdentifier('scopeId'), t.stringLiteral(this.data.id)),
              t.jsxAttribute(t.jsxIdentifier('chunkId'), t.stringLiteral(fragment.data.id)),
            ],
            true,
          ),
          null,
          [],
        ),
      );
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
}
