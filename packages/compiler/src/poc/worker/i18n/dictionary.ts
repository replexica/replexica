import * as t from '@babel/types';
import { createWorker } from '../base';
import { CodeImporter } from '../../../new/unplg/services/importer';

/**
 * Injects dictionary loaders into I18n loader calls.
 */
export default createWorker({
  name: 'dictionary',
  runIf: ({ ctx, nodePath }) => {
    const importer = CodeImporter.fromAst(ctx.ast);
    const i18nImport = importer.findNamedImport('@replexica/react/next', 'I18n');
    if (!i18nImport) { return false; }

    return t.isMemberExpression(nodePath.node)
      && t.isIdentifier(nodePath.node.object)
      && nodePath.node.object.name === i18nImport.name
      && t.isIdentifier(nodePath.node.property)
      && nodePath.node.property.name === 'fromRscContext';
  },

  post: ({ ctx, nodePath: path }) => {
    const importer = CodeImporter.fromAst(ctx.ast);
    const i18nImport = importer.findNamedImport('@replexica/react/next', 'I18n');
    if (!i18nImport) {
      throw new Error('Failed to find I18n import');
    }

    path.replaceWith(
      t.memberExpression(
        t.callExpression(
          t.memberExpression(
            t.identifier(i18nImport.name),
            t.identifier('withLoaders'),
          ),
          [
            t.objectExpression(
              ctx.supportedLocales.map((locale) => {
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
        t.identifier('fromRscContext'),
      ),
    );
  },
});
