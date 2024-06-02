import * as t from '@babel/types';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import { NodePath, traverse } from '@babel/core';

export function generateAstFromCode(code: string) {
  return parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
}

export function generateCodeFromAst(ast: t.File, originalCode: string) {
  return generate(ast, {}, originalCode);
}

export function resolveNodePath<T extends t.Node>(node: T, predicate: (path: NodePath<t.Node>) => boolean): NodePath<t.Node> | null {
  let result: NodePath<t.Node> | null = null;

  traverse(node, {
    enter(path) {
      if (predicate(path)) {
        result = path;
        path.stop();
      }
    },
  });

  return result;
}