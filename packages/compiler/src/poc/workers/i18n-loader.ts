import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { CodeWorker } from './base';

export class I18nLoader extends CodeWorker<t.MemberExpression> {
  public shouldRun(nodePath: NodePath<t.Node>) {
    const i18nImport = this.ctx.importer.upsertNamedImport('@replexica/react/next', 'I18n');

    return t.isMemberExpression(nodePath.node)
      && t.isIdentifier(nodePath.node.object)
      && nodePath.node.object.name === i18nImport.name
      && t.isIdentifier(nodePath.node.property)
      && nodePath.node.property.name === 'fromRscContext';
  }

  public async process(path: NodePath<t.MemberExpression>) {
    const i18nImport = this.ctx.importer.upsertNamedImport('@replexica/react/next', 'I18n');

    path.replaceWith(
      t.callExpression(
        t.memberExpression(
          t.callExpression(
            t.memberExpression(
              t.identifier(i18nImport.name),
              t.identifier('withLoaders'),
            ),
            [
              t.objectExpression(
                this.ctx.params.supportedLocales.map((locale) => {
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
        [],
      ),
    );

    return super.process(path);
  }
}
