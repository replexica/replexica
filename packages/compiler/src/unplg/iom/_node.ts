import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import _ from 'lodash';

export type I18nNodeRole = 'scope' | 'fragment';

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
    const keysToOmit: (keyof this['data'])[] = [];
    const result = _.omit(this.data, keysToOmit);

    return result;
  }
}