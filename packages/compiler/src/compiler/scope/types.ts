import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { ReplexicaScopeData, ReplexicaScopeHint } from '../types';

export interface IReplexicaScope {
  get id(): string;
  injectIntl(fileId: string, isServer: boolean): ReplexicaScopeData;
  extractHints(): ReplexicaScopeHint[];
}

export type ReplexicaScopeExtractor = {
  fromNode(path: NodePath<t.Node>): IReplexicaScope[];
}