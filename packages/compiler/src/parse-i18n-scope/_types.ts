import * as t from '@babel/types';
import { NodePath } from '@babel/core';

export type I18nNode<R extends 'scope' | 'fragment'> = {
  role: R;
};

export type I18nScopeType =
  | 'js/program'
  | 'jsx/element'
  | 'jsx/attribute'
;
export type I18nScope<T extends t.Node = t.Node> = I18nNode<'scope'> & {
  type: I18nScopeType;
  hint: string;
  explicit: boolean;
  fragments: I18nFragment[];
  scopes: I18nScope<T>[];
};

export type I18nFragmentType =
  | 'text'
;
export type I18nFragment = I18nNode<'fragment'> & {
  type: I18nFragmentType;
  value: string;
};

export type I18nScopeParser<T extends t.Node> = {
  (nodePath: NodePath<T>): I18nScope<T> | null;
};

export type I18nFragmentsParser<T extends t.Node> = {
  (nodePath: NodePath<T>): I18nFragment[];
}
