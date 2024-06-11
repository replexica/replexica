import * as t from '@babel/types';
import { NodePath, traverse } from '@babel/core';
import { I18nScope, I18nScopeData, I18nScopeExtractor } from './.scope';
import createCodeWriter from '../workers/writer';
import { I18N_ACCESS_METHOD, I18N_IMPORT_MODULE, I18N_IMPORT_NAME, I18N_LOADER_METHOD } from './.const';

export class ProgramScope extends I18nScope<'js/program', never> {
  public static fromNodePath(rootExtractor: I18nScopeExtractor) {
    return (nodePath: NodePath<t.Node>, id: string) => {
      if (!nodePath.isProgram()) { return null; }

      return new ProgramScope(nodePath, {
        role: 'scope',
        type: 'js/program',
        id,
        hint: '',
        explicit: false,
      }, rootExtractor);
    };
  }

  private constructor(
    public nodePath: NodePath<t.Node>,
    public data: I18nScopeData<'js/program', never>,
    public rootExtractor: I18nScopeExtractor,
  ) {
    super(nodePath, data, rootExtractor);
  }

  protected injectOwnI18n(ast: t.File, supportedLocales: string[]) {
    const writer = createCodeWriter(ast);
    const i18nImport = writer.findNamedImport(I18N_IMPORT_MODULE, I18N_IMPORT_NAME);
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
            ),
            t.identifier(I18N_ACCESS_METHOD),
          ),
        );
      },
    });
  }
}
