import { NodePath, traverse } from '@babel/core';
import * as t from '@babel/types';
import _ from 'lodash';
import { I18nScopeExtractor, I18nScope } from './.scope';
import { ProgramScope } from './program.scope';
import { JsxElementScope } from './jsx-element.scope';
import { JsxAttributeScope } from './jsx-attribute.scope';

export * from './.scope';
export function extractI18n(fileNode: t.File): I18nScope | null {
  let scope: I18nScope | null = null;

  traverse(fileNode, {
    Program(programPath) {
      scope = extractI18nScopeFromPath(programPath);
      programPath.stop();
    }
  });

  return scope;
}

// helper functions

function composeScopeExtractors(...parsers: I18nScopeExtractor[]): I18nScopeExtractor {
  return (nodePath, id) => {
    for (const parser of parsers) {
      const scope = parser(nodePath, id);
      if (scope) { return scope; }
    }

    return null;
  };
}

function extractI18nScopeFromPath(nodePath: NodePath<t.Node>): I18nScope | null {
  return composeScopeExtractors(
    ProgramScope.fromNodePath(extractI18nScopeFromPath),
    JsxElementScope.fromNodePath(extractI18nScopeFromPath),
    JsxElementScope.fromExplicitNodePath(extractI18nScopeFromPath),
    JsxAttributeScope.fromNodePath(extractI18nScopeFromPath),
  )(nodePath, '');
}
