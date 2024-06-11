import _ from "lodash";
import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nNodeData, I18nNode } from "./.node";
import { I18nFragment, I18nFragmentType } from "./.fragment";

export type I18nScopeType =
  | 'js/program'
  | 'jsx/element'
  | 'jsx/attribute'
  ;

export type I18nScopeExtractor = (nodePath: NodePath<t.Node>, id: string) => I18nScope | null;

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

  public injectI18n(ast: t.File, supportedLocales: string[]) {
    this.injectOwnI18n(ast, supportedLocales);
    this.scopes.forEach((s) => s.injectI18n(ast, supportedLocales));
  }

  public initFragments() {
    // Do nothing in the base class.
  }

  protected injectOwnI18n(ast: t.File, supportedLocales: string[]) {
    // Do nothing in the base class.
  }

  private initScopes() {
    const self = this;
    let index = 0;
    this.nodePath.traverse({
      enter(childPath) {
        const childKey = [self.data.id, String(index)].filter(Boolean).join('.');
        const childScope = self.rootExtractor(childPath, childKey);
        if (childScope) {
          self.nodePath.skip();
          self.scopes.push(childScope);
          index += 1;
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