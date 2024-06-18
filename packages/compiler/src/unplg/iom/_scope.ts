import _ from "lodash";
import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nNodeData, I18nNode } from "./_node";
import { I18nFragment, I18nFragmentType } from "./_fragment";
import createObjectHash from 'object-hash';

export type I18nScopeType =
  | 'js/program'
  | 'jsx/element'
  | 'jsx/skip'
  | 'jsx/attribute'
  ;

export type I18nScopeExtractor = (nodePath: NodePath<t.Node>, index: number) => I18nScope | null;

export type I18nScopeData<
  T extends I18nScopeType = I18nScopeType,
  F extends I18nFragmentType = I18nFragmentType,
> = I18nNodeData<'scope'> & {
  name: string;
  type: T;
  hint: string;
  explicit: boolean;
};

export type I18nInjectionParams = {
  fileId: string;
  i18nRoot: string;
  supportedLocales: string[];
  isClientCode: boolean;
};

export abstract class I18nScope<
  T extends I18nScopeType = I18nScopeType,
  F extends I18nFragmentType = I18nFragmentType,
> extends I18nNode<'scope'> {
  public hash: string = '';

  public constructor(
    public readonly nodePath: NodePath<t.Node>,
    public readonly data: I18nScopeData<T>,
    public readonly index: number,
    protected readonly rootExtractor: I18nScopeExtractor,
  ) {
    super(nodePath, data, index);
    this.initFragments();
    this.initScopes();
    this.initHash();
  }

  public readonly fragments: I18nFragment<F>[] = [];

  public readonly scopes: I18nScope[] = [];

  public injectI18n(ast: t.File, params: I18nInjectionParams) {
    this.scopes.forEach((s) => s.injectI18n(ast, params));
    this.injectOwnI18n(ast, params);
  }

  public initFragments() {
    // Do nothing in the base class.
  }

  protected injectOwnI18n(ast: t.File, params: I18nInjectionParams) {
    // Do nothing in the base class.
  }

  private initScopes() {
    const self = this;
    let index = 0;
    this.nodePath.traverse({
      enter(childPath) {
        const childScope = self.rootExtractor(childPath, index);
        if (childScope) {
          self.nodePath.skip();
          self.scopes.push(childScope);
          index += 1;
        }
      }
    });
  }

  private initHash() {
    const payload = {
      data: this.data,
      fragments: this.fragments.map((f) => f.data.value),
    };

    this.hash = createObjectHash(payload);
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