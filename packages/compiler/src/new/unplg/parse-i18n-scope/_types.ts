import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nFragment, I18nScope } from '../_types';

export type I18nScopeParser<T extends t.Node> = {
  (nodePath: NodePath<T>): I18nScope | null;
};

export type I18nFragmentsParser<T extends t.Node> = {
  (nodePath: NodePath<T>): I18nFragment[];
}
