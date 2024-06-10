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

    const artifactor = createArtifactor(fileId);
    artifactor.storeMetadata(i18nTree);
    artifactor.storeSourceDictionary(i18nTree, config.locale.source);
    artifactor.storeStubDictionaries(config.locale.targets);

    if (config.debug) {
      artifactor.storeOriginalCode(code);
      artifactor.storeI18nTree(i18nTree);
    }

    const i18nInjector = createI18nInjector(ast, {
      supportedLocales: [...new Set([config.locale.source, ...config.locale.targets])],
    });
    i18nInjector.injectLoaders();
    i18nInjector.injectFragments(i18nTree);

    const result = converter.generateUpdatedCode(ast);

    if (config.debug) {
      artifactor.storeTransformedCode(result.code);
    }

    return {
      code: result.code,
      map: result.map,
    };
  },
}));
