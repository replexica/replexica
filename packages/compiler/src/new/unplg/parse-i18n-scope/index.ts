import { NodePath, traverse } from '@babel/core';
import * as t from '@babel/types';
import { composeScopeParsers } from './_utils';
import { programScopeParser } from './program';
import { I18nScope } from './../_types';
import { explicitJsxElementScopeParser, jsxElementScopeParser } from './jsx-element';
import { jsxAttributeScopeParser } from './jsx-attribute';

export * from './_types';
export function parseI18nScopeFromPath(nodePath: NodePath<t.Node>): I18nScope<t.Node> | null {
  return composeScopeParsers(
    programScopeParser(parseI18nScopeFromPath),
    jsxElementScopeParser(parseI18nScopeFromPath),
    explicitJsxElementScopeParser(parseI18nScopeFromPath),
    jsxAttributeScopeParser(parseI18nScopeFromPath),
  )(nodePath);
};

export function parseI18nScopeFromAst(fileNode: t.File): I18nScope<t.File> | null {
  let scope: I18nScope<t.File> | null = null;

  traverse(fileNode, {
    Program(programPath) {
      scope = parseI18nScopeFromPath(programPath);
      programPath.stop();
    }
  });

  return scope;
}