import path from 'path';
import * as t from '@babel/types';
import { NodePath, traverse } from '@babel/core';
import { I18nInjectionParams, I18nScope, I18nScopeData, I18nScopeExtractor } from './_scope';
import createCodeWriter from '../workers/writer';
import { I18N_ACCESS_METHOD, I18N_IMPORT_NAME, I18N_LOADER_METHOD, NEXTJS_IMPORT_MODULE } from './_const';

export class ProgramScope extends I18nScope<'js/program', never> {
  public static fromNodePath(rootExtractor: I18nScopeExtractor, fileName: string) {
    return (nodePath: NodePath<t.Node>, index: number) => {
      if (!nodePath.isProgram()) { return null; }

      return new ProgramScope(nodePath, {
        role: 'scope',
        type: 'js/program',
        name: fileName,
        hint: '',
        explicit: false,
      }, index, rootExtractor);
    };
  }

  private constructor(
    public nodePath: NodePath<t.Node>,
    public data: I18nScopeData<'js/program', never>,
    public index: number,
    public rootExtractor: I18nScopeExtractor,
  ) {
    super(nodePath, data, index, rootExtractor);
  }

  protected injectOwnI18n(ast: t.File, params: I18nInjectionParams) {
    const writer = createCodeWriter(ast);
    const i18nImport = writer.findNamedImport(NEXTJS_IMPORT_MODULE, I18N_IMPORT_NAME);
    // Early return if I18n import is not found
    if (!i18nImport) { return; }

    traverse(ast, {
      MemberExpression(nodePath: NodePath<t.MemberExpression>) {
        const isI18nAccess = t.isIdentifier(nodePath.node.object) && nodePath.node.object.name === i18nImport.name;
        if (!isI18nAccess) { return; }

        const isFromRscContext = t.isIdentifier(nodePath.node.property) && nodePath.node.property.name === I18N_ACCESS_METHOD;
        if (!isFromRscContext) { return; }

        nodePath.replaceWith(
          t.memberExpression(
            t.callExpression(
              t.memberExpression(
                t.identifier(i18nImport.name),
                t.identifier(I18N_LOADER_METHOD),
              ),
              [
                t.objectExpression(
                  params.supportedLocales.map((locale) => {
                    const localePath = path.resolve(params.i18nRoot, `${locale}.json`);
                    return t.objectProperty(
                      t.identifier(locale),
                      t.arrowFunctionExpression(
                        [],
                        t.callExpression(
                          t.identifier('import'),
                          [t.stringLiteral(localePath)],
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
            t.identifier(I18N_ACCESS_METHOD),
          ),
        );
      },
    });
  }
}
