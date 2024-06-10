import * as t from "@babel/types";
import createCodeWriter from "../services/writer";
import { traverse, NodePath } from "@babel/core";
import { I18N_IMPORT_MODULE, I18N_IMPORT_NAME, I18N_ACCESS_METHOD, I18N_LOADER_METHOD } from "./_const";

export type LoaderInjectorParams = {
  supportedLocales: string[];
};

export default function createLoaderInjector(ast: t.File, params: LoaderInjectorParams) {
  return () => {
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
                  params.supportedLocales.map((locale) => {
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
  };
};
