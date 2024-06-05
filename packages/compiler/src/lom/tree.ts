import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import _ from 'lodash';
import extractI18nNode, { I18nNode } from './extract';

export const createI18nNode = (rootNodePath: NodePath<t.Node>, idPath: number[] = []): I18nNode | null => {
  const rootNode = extractI18nNode(rootNodePath);
  if (!rootNode) { return null; }

  if (rootNode.role === 'fragment') { return rootNode; }

  rootNodePath.skip();

  let i = 0;
  rootNodePath.traverse({
    enter(nodePath) {
      const node = createI18nNode(nodePath, [...idPath, i]);
      if (node) {
        rootNode.nodes.push(node);
        i++;
      }
    }
  });

  return rootNode;
};
