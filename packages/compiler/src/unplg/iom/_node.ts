import * as t from '@babel/types';
import { NodePath } from '@babel/core';

export type I18nNodeRole = 'scope' | 'fragment';

export type I18nNodeData<R extends I18nNodeRole> = {
  role: R;
};

export abstract class I18nNode<R extends I18nNodeRole = I18nNodeRole> {
  public abstract readonly hash: string;
  public constructor(
    public readonly nodePath: NodePath<t.Node>,
    public readonly data: I18nNodeData<R>,
  ) {
  }

  public toJSON() {
    return {
      hash: this.hash,
      data: this.data,
    };
  }
}