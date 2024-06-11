import { createUnplugin } from 'unplugin';
import Z from 'zod';
import { localeSchema } from '@replexica/spec';
import createCodeConverter from './workers/converter';
import createArtifactor from './workers/artifactor';
import { extractI18n } from './iom';

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
  transform(code, filePath) {
    const config = unplgConfigSchema.parse(_config);
    const supportedLocales = getSupportedLocales(config.locale);

    const converter = createCodeConverter(code);
    const { ast } = converter.generateAst();

    const i18nTree = extractI18n(ast);
    if (!i18nTree) { throw new Error(`Failed to parse i18n tree from code located at ${filePath}`); }

    i18nTree.injectI18n(ast, supportedLocales);

    const artifactor = createArtifactor(filePath);
    artifactor.storeMetadata(i18nTree);

    if (config.debug) {
      artifactor.storeOriginalCode(code);
      artifactor.storeI18nTree(i18nTree);
    }

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

// helper functions

function getSupportedLocales(localeConfig: Z.infer<typeof unplgConfigSchema>['locale']): string[] {
  return [
    ...new Set([
      localeConfig.source,
      ...localeConfig.targets,
    ]),
  ];
}