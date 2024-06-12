import _ from "lodash";
import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { I18nNode, I18nNodeData } from "./.node";

export type I18nFragmentType =
  | 'js/text'
  | 'jsx/text'
  ;

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
