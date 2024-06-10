import * as t from '@babel/types';

export type I18nNode<R extends 'scope' | 'fragment'> = {
  role: R;
  node: t.Node;
};

export type I18nScopeType =
  | 'js/program'
  | 'jsx/element'
  | 'jsx/attribute'
;
export type I18nScope = I18nNode<'scope'> & {
  type: I18nScopeType;
  hint: string;
  explicit: boolean;
  fragments: I18nFragment[];
  scopes: I18nScope[];
};

export type I18nFragmentType =
  | 'text'
;
export type I18nFragment = I18nNode<'fragment'> & {
  type: I18nFragmentType;
  value: string;
};