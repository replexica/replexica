import { createUnplugin } from 'unplugin';
import Z from 'zod';
import { localeSchema } from '@replexica/spec';
import { parseI18nScopeFromAst } from './parse-i18n-scope';
import createCodeConverter from './services/converter';
import createArtifactor from './services/artifactor';
import createI18nInjector from './inject-i18n';

const unplgConfigSchema = Z.object({
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
  locale: localeSchema,
});

export default createUnplugin<Z.infer<typeof unplgConfigSchema>>((_config) => ({
  name: 'replexica',
  enforce: 'pre',
  transformInclude(id) {
    // - tsx, jsx
    // - exclude node_modules
    return /\.(tsx|jsx)$/.test(id) && !/node_modules/.test(id);
  },
  transform(code, fileId) {
    const config = unplgConfigSchema.parse(_config);
    const converter = createCodeConverter(code);
    const { ast } = converter.generateAst();
    const i18nTree = parseI18nScopeFromAst(ast);
    if (!i18nTree) { throw new Error(`Failed to parse i18n tree from code located at ${fileId}`); }

    const artifactor = createArtifactor({ fileId, sourceLocale: config.locale.source });
    artifactor.storeMetadata(i18nTree);
    artifactor.storeDefaultDictionary(i18nTree);

    const i18nInjector = createI18nInjector(ast);
    i18nInjector.injectLoaders();
    i18nInjector.injectFragments(i18nTree);

    const result = converter.generateUpdatedCode(ast);
    return {
      code: result.code,
      map: result.map,
    };
  },
}));
