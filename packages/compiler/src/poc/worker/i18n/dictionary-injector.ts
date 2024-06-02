import * as t from '@babel/types';
import { createWorker } from '../base';

/**
 * Injects dictionary loaders into I18n loader calls.
 */
export default createWorker({
  shouldRun: ({ ctx, path }) => {
    const i18nImport = ctx.importer.findNamedImport('@replexica/react/next', 'I18n');
    if (!i18nImport) { return false; }

    return t.isMemberExpression(path.node)
      && t.isIdentifier(path.node.object)
      && path.node.object.name === i18nImport.name
      && t.isIdentifier(path.node.property)
      && path.node.property.name === 'fromRscContext';
  },

  run: ({ ctx, path }) => {
    const i18nImport = ctx.importer.findNamedImport('@replexica/react/next', 'I18n');
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
              ctx.params.supportedLocales.map((locale) => {
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
