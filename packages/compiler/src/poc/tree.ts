import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import _ from 'lodash';

export type I18nNodeType = 'program' | 'superdom' | 'dom' | 'text';

export type I18nNode = {
  id: string;
  type: I18nNodeType;
  label: string;
  value: string;
  nodes: I18nNode[];
}

type NodeExtractor = {
  (path: NodePath<t.Node>, id: string): I18nNode | null;
};

const parseJsxElementName = (element: t.JSXFragment | t.JSXElement): string => {
  if (t.isJSXFragment(element)) {
    return 'Fragment';
  } else if (t.isJSXIdentifier(element.openingElement.name)) {
    return element.openingElement.name.name;
  } else if (t.isJSXNamespacedName(element.openingElement.name)) {
    return `${element.openingElement.name.namespace.name}:${element.openingElement.name.name.name}`;
  } else {
    throw new Error('Could not parse JSX element name: invalid element type');
  }
}

const extractProgramNode: NodeExtractor = (path, id) => {
  const programEl = t.isProgram(path.node) ? path.node : null;
  if (!programEl) { return null; }

  return {
    id,
    type: 'program',
    label: '',
    value: '',
    nodes: [],
  };
}

const extractTextNode: NodeExtractor = (path, id) => {
  const jsxTextEl = t.isJSXText(path.node) ? path.node : null;
  if (!jsxTextEl) { return null; }

  const value = jsxTextEl.value.trim();
  if (!value) { return null; }

  return {
    id,
    type: 'text',
    label: '',
    value,
    nodes: [],
  };
}

const extractDomNode: NodeExtractor = (path, id) => {
  const jsxEl = t.isJSXElement(path.node) || t.isJSXFragment(path.node) ? path.node : null;
  if (!jsxEl) { return null; }

  const jsxTextChildren = jsxEl.children.filter((c) => t.isJSXText(c)) as t.JSXText[];
  const nonEmptyJsxTextChildren = jsxTextChildren.filter((c) => c.value.trim());
  const hasNonEmptyJsxTextChildren = nonEmptyJsxTextChildren.length > 0;
  if (!hasNonEmptyJsxTextChildren) { return null; }

  const elementName = parseJsxElementName(jsxEl);

  return {
    id,
    type: 'dom',
    label: elementName,
    value: '',
    nodes: [],
  };
}

const composeExtractors = (...extractors: NodeExtractor[]): NodeExtractor => {
  return (path, id) => {
    for (const extractor of extractors) {
      const result = extractor(path, id);
      if (result) { return result; }
    }

    return null;
  };
}

const extractNode = composeExtractors(
  extractProgramNode,
  extractDomNode,
  extractTextNode,
);

export const getI18nTree = (rootNodePath: NodePath<t.Node>, idPath: number[] = []): I18nNode | null => {
  const rootNode = extractNode(rootNodePath, idPath.join('.'));
  if (!rootNode) { return null; }

  if (rootNode.type === 'text') { return rootNode; }

  rootNodePath.skip();

  let i = 0;
  rootNodePath.traverse({
    enter(nodePath) {
      const node = getI18nTree(nodePath, [...idPath, i]);
      if (node) {
        rootNode.nodes.push(node);
        i++;
      }
    }
  });

  return rootNode;
};

export const getFlatI18nNodes = (tree: I18nNode | null): I18nNode[] => {
  if (!tree) { return []; }

  const nodes = [tree];
  tree.nodes.forEach((node) => {
    nodes.push(...getFlatI18nNodes(node));
  });

  nodes.forEach((node) => {
    node.nodes = [];
  });
  return nodes;
};