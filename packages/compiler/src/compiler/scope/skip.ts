import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { IReplexicaScope } from "./types";
import { attributeExists } from '../../utils/ast';
import { ReplexicaScopeData } from '../types';

export class ReplexicaSkipScope implements IReplexicaScope {
  public get id(): string {
    throw new Error('Method not implemented.');
  }

  public static fromNode(path: NodePath<t.Node>): IReplexicaScope[] {
    const result: IReplexicaScope[] = [];

    if (!path.isJSXElement()) { return result; }

    const skipRequired = attributeExists(path, 'data-replexica-skip');
    if (skipRequired) {
      throw 'skip';
    }

    return result;
  }

  public injectIntl(): ReplexicaScopeData {
    return {};
  }

  public extractHints(): any[] {
    return [];
  }
}
