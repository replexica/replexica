import { NodePath, traverse } from '@babel/core';
import * as t from '@babel/types';
import _ from 'lodash';
import createCodeWriter from '../services/writer';
import { isLocalizableAttributeName, isSystemAttributeName } from './_utils';

// Types

export type I18nNodeRole = 'scope' | 'fragment';

export type I18nScopeType =
  | 'js/program'
  | 'jsx/element'
  | 'jsx/attribute'
  ;

export type I18nFragmentType =
  | 'js/text'
  | 'jsx/text'
  ;

// Abstract

export type I18nNodeData<R extends I18nNodeRole> = {
  id: string;
  role: R;
};

export abstract class I18nNode<R extends I18nNodeRole = I18nNodeRole> {
  public constructor(
    public readonly nodePath: NodePath<t.Node>,
    public readonly data: I18nNodeData<R>,
  ) { }

  public toJSON() {
    const keysToOmit: (keyof this['data'])[] = ['id'];
    const result = _.omit(this.data, keysToOmit);

    return result;
  }
}

export type I18nFragmentData<T extends I18nFragmentType = I18nFragmentType> = I18nNodeData<'fragment'> & {
  type: T;
  value: string;
};

export abstract class I18nFragment<T extends I18nFragmentType = I18nFragmentType> extends I18nNode<'fragment'> {
  public constructor(
    public nodePath: NodePath<t.Node>,
    public readonly data: I18nFragmentData<T>,
  ) {
    super(nodePath, data);
  }
}

export type I18nScopeData<
  T extends I18nScopeType = I18nScopeType,
  F extends I18nFragmentType = I18nFragmentType,
> = I18nNodeData<'scope'> & {
  type: T;
  hint: string;
  explicit: boolean;
};

export abstract class I18nScope<
  T extends I18nScopeType = I18nScopeType,
  F extends I18nFragmentType = I18nFragmentType,
> extends I18nNode<'scope'> {
  public constructor(
    public readonly nodePath: NodePath<t.Node>,
    public readonly data: I18nScopeData<T>,
    protected readonly rootExtractor: I18nScopeExtractor,
  ) {
    super(nodePath, data);
    this.initFragments();
    this.initScopes();
  }

  public readonly fragments: I18nFragment<F>[] = [];

  public readonly scopes: I18nScope[] = [];

  public abstract injectI18n(ast: t.File): void;

  public abstract initFragments(): void;

  private initScopes() {
    const self = this;
    this.nodePath.traverse({
      enter(childPath) {
        const childScope = self.rootExtractor(childPath, '');
        if (childScope) {
          self.nodePath.skip();
          self.scopes.push(childScope);
        }
      }
    });
  }

  public toJSON(): any {
    const base = super.toJSON();

    const fragments = this.fragments.map((f) => f.toJSON());
    const scopes = this.scopes.map((s) => s.toJSON());

    return {
      ...base,
      fragments,
      scopes,
    };
  }
}

// Concrete

/// Fragments
export class JsTextFragment extends I18nFragment<'js/text'> {
  public static fromAttributeValue(
    nodePath: NodePath<t.JSXAttribute>,
    id: string,
  ) {
    if (!nodePath.isJSXAttribute()) { return null; }

    const jsxAttrValue = nodePath.node.value;
    // Only string literals are supported for now
    if (!t.isStringLiteral(jsxAttrValue)) { return null; }
    if (!jsxAttrValue.value.trim()) { return null; }

    return new JsTextFragment(nodePath, {
      role: 'fragment',
      type: 'js/text',
      id,
      value: jsxAttrValue.value,
    });
  }
}

export class JsxTextFragment extends I18nFragment<'jsx/text'> {
  public static fromNodePath(
    nodePath: NodePath<t.JSXText>,
    id: string,
  ) {
    const jsxText = nodePath.node;
    const value = jsxText.value.trim();
    if (!value) { return null; }

    return new JsxTextFragment(nodePath, {
      role: 'fragment',
      type: 'jsx/text',
      id,
      value,
    });
  }
}

/// Scopes
export class JsxElementScope extends I18nScope<'jsx/element', 'jsx/text'> {
  public static fromNodePath(
    rootExtractor: I18nScopeExtractor,
  ) {
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

  public injectI18n(ast: t.File): void {
    if (!this.fragments.length) { return; }

    const writer = createCodeWriter(ast);
    const importName = writer.upsertNamedImport('@replexica/react/next', 'I18nFragment');

    for (const fragment of this.fragments) {
      fragment.nodePath.replaceWith(
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier(importName.name), [
            t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral(fragment.data.id)),
          ]),
          null,
          [],
          true,
        ),
      );
    }
  }

  public initFragments() {
    if (this.data.explicit) { return; }

    const self = this;

    this.nodePath.traverse({
      JSXText(childPath: NodePath<t.JSXText>) {
        const fragment = JsxTextFragment.fromNodePath(childPath, '');
        if (!fragment) { return; }

        self.fragments.push(fragment);
      },
    });
  }
}

export class ProgramScope extends I18nScope<'js/program', never> {
  public static fromNodePath(
    rootExtractor: I18nScopeExtractor,

  ) {
    return (
      nodePath: NodePath<t.Node>,
      id: string,
    ) => {
      if (!nodePath.isProgram()) { return null; }

      return new ProgramScope(nodePath, {
        role: 'scope',
        type: 'js/program',
        id,
        hint: '',
        explicit: false,
      }, rootExtractor);
    };
  }

  private constructor(
    public nodePath: NodePath<t.Node>,
    public data: I18nScopeData<'js/program', never>,
    public rootExtractor: I18nScopeExtractor,
  ) {
    super(nodePath, data, rootExtractor);
  }

  public injectI18n(ast: t.File): void {
    // Do nothing.
  }

  public initFragments(): void {
    // Do nothing.
  }
}

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
      console.log(hostJsxElementNodePath?.type);
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

  public injectI18n(ast: t.File): void {
    // TODO: Replace JSX Element with an I18n Proxy.
  }

  public initFragments(): void {
    const fragment = JsTextFragment.fromAttributeValue(this.nodePath, '');
    if (!fragment) { return; }

    this.fragments.push(fragment);
  }
}

export type I18nScopeExtractor = (nodePath: NodePath<t.Node>, id: string) => I18nScope | null;

const composeScopeExtractors = (...parsers: I18nScopeExtractor[]): I18nScopeExtractor =>
  (nodePath, id) => {
    for (const parser of parsers) {
      const scope = parser(nodePath, id);
      if (scope) { return scope; }
    }

    return null;
  };

function extractI18nScopeFromPath(nodePath: NodePath<t.Node>): I18nScope | null {
  return composeScopeExtractors(
    ProgramScope.fromNodePath(extractI18nScopeFromPath),
    JsxElementScope.fromNodePath(extractI18nScopeFromPath),
    JsxElementScope.fromExplicitNodePath(extractI18nScopeFromPath),
    JsxAttributeScope.fromNodePath(extractI18nScopeFromPath),
  )(nodePath, '');
}

export default function extractI18nScopeFromAst(fileNode: t.File): I18nScope | null {
  let scope: I18nScope | null = null;

  traverse(fileNode, {
    Program(programPath) {
      scope = extractI18nScopeFromPath(programPath);
      programPath.stop();
    }
  });

  return scope;
}