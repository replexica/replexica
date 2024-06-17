import { NodePath, traverse } from '@babel/core';
import * as t from '@babel/types';
import _ from 'lodash';
import { I18nScopeExtractor, I18nScope } from './_scope';
import { ProgramScope } from './program.scope';
import { JsxElementScope } from './jsx-element.scope';
import { JsxAttributeScope } from './jsx-attribute.scope';
import { JsxSkipScope } from './jsx-skip.scope';

export * from './_scope';
export function extractI18n(fileNode: t.File, filePath: string): I18nScope | null {
  let scope: I18nScope | null = null;
  const extractScope = createI18nScopeExtractor(filePath);

  traverse(fileNode, {
    Program(programPath) {
      scope = extractScope(programPath);
      programPath.stop();
    }
  });

  return scope;
}

// helper functions

function composeScopeExtractors(...parsers: I18nScopeExtractor[]): I18nScopeExtractor {
  return (nodePath) => {
    for (const parser of parsers) {
      const scope = parser(nodePath);
      if (scope) { return scope; }
    }

    return null;
  };
}

function createI18nScopeExtractor(filePath: string) {
  return function extractI18nScopeFromPath(nodePath: NodePath<t.Node>): I18nScope | null {
    return composeScopeExtractors(
      ProgramScope.fromNodePath(extractI18nScopeFromPath, filePath),
      JsxSkipScope.fromExplicitNodePath(extractI18nScopeFromPath),
      JsxElementScope.fromNodePath(extractI18nScopeFromPath),
      JsxElementScope.fromExplicitNodePath(extractI18nScopeFromPath),
      JsxAttributeScope.fromNodePath(extractI18nScopeFromPath),
    )(nodePath);
  }  
}