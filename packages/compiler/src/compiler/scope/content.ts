import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { IReplexicaScope } from "./types";
import { findImmediateJsxParent, getImportName, hasJsxTextChildren, injectImport } from './../../utils/ast';
import { ReplexicaChunk } from './chunk';
import { generateScopeId } from '../../utils/id';
import { ReplexicaScopeData, ReplexicaScopeHint } from '../types';
import { ReplexicaBaseScope } from './base';

export class ReplexicaContentScope extends ReplexicaBaseScope implements IReplexicaScope {
  public static fromNode(path: NodePath<t.Node>): IReplexicaScope[] {
    if (!path.isJSXElement() && !path.isJSXFragment()) { return []; }
    // to return true, must have non-empty when trimmed JSXText children
    // and either not have a parent JSX element at all, or have a parent JSX element with no text children
    const hasTextContent = hasJsxTextChildren(path);
    if (!hasTextContent) { return []; }

    const jsxElementContainer = findImmediateJsxParent(path);
    if (jsxElementContainer && hasJsxTextChildren(jsxElementContainer)) { return []; }

    const scope = new ReplexicaContentScope(path);
    return [scope];
  }

  private constructor(
    private readonly path: NodePath<t.JSXElement | t.JSXFragment>,
  ) {
    super();
    const _scope = this;

    path.traverse({
      JSXOpeningElement(path) {
        path.skip();
      },
      JSXText(path) {
        const chunk = ReplexicaChunk.fromJsxText(path);
        if (chunk.text.length) {
          _scope._chunks.add(chunk);
        }
      },
      JSXExpressionContainer(path) {
        const chunk = ReplexicaChunk.fromJsxExpressionContainer(path);
        if (chunk.text.length) {
          _scope._chunks.add(chunk);
        }
      },
    });

    const chunkIds = Array.from(this._chunks).map((chunk) => chunk.id);
    this._id = generateScopeId(chunkIds, 0);
  }

  private _chunks: Set<ReplexicaChunk> = new Set();
  private _id: string;

  public get id(): string {
    return this._id;
  }

  public injectIntl(fileId: string, isServer: boolean, supportedLocales: string[]): ReplexicaScopeData {
    const result: ReplexicaScopeData = {};

    const programNode = this.path.findParent((p) => p.isProgram()) as NodePath<t.Program> | null;
    if (!programNode) { throw new Error(`Couldn't find file node`); }

    const packageName = isServer ? '@replexica/react/next' : '@replexica/react';
    const localHelperName = 'I18nChunk';

    for (const chunk of this._chunks) {
      if (chunk.isPlaceholder) { continue; }

      let helperName = getImportName(programNode, packageName, localHelperName);
      if (!helperName) {
        helperName = injectImport(programNode, packageName, localHelperName);
      }

      const injectedElement = t.jsxOpeningElement(
        t.jsxIdentifier(helperName),
        [
          t.jsxAttribute(t.jsxIdentifier('fileId'), t.stringLiteral(fileId)),
          t.jsxAttribute(t.jsxIdentifier('scopeId'), t.stringLiteral(this.id)),
          t.jsxAttribute(t.jsxIdentifier('chunkId'), t.stringLiteral(chunk.id)),
        ],
        true,
      );

      if (isServer) {
        // make sure the following import is available in the file:
        // import { loadI18n } from "@replexica/react/next";
        let localeDataLoaderImportName = getImportName(programNode, '@replexica/react/next', 'I18n');
        if (!localeDataLoaderImportName) {
          localeDataLoaderImportName = injectImport(programNode, '@replexica/react/next', 'I18n');
        }

        // Assign loadI18n prop to () => I18n
        //     .withLoaders({
        //       [key in supportedLocales]: () => import(`@replexica/.cache/${key}.json`),
        //     })
        //     .fromRscContext();
        const withLoadersCall = t.callExpression(
          t.memberExpression(
            t.identifier(localeDataLoaderImportName),
            t.identifier('withLoaders'),
          ),
          [
            t.objectExpression(
              supportedLocales.map((locale) => {
                return t.objectProperty(
                  t.identifier(locale),
                  t.arrowFunctionExpression(
                    [],
                    t.callExpression(
                      t.identifier('import'),
                      [t.stringLiteral(`@replexica/.cache/${locale}.json`)],
                    ),
                  ),
                );
              }),
            ),
          ],
        );

        const fromRscContextCall = t.callExpression(
          t.memberExpression(
            withLoadersCall,
            t.identifier('fromRscContext'),
          ),
          [],
        );

        injectedElement.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier('loadI18n'),
            t.jSXExpressionContainer(
              t.arrowFunctionExpression(
                [],
                fromRscContextCall,
              ),
            ),
          ),
        );
      }

      chunk.path.replaceWith(
        t.jsxElement(
          injectedElement,
          null,
          [],
          true,
        )  
      );

      result[chunk.id] = chunk.text;
    }

    return result;
  }

  public extractHints(): ReplexicaScopeHint[] {    
    const result = this._extractBaseHints(this.path);
    return result;
  }
}
