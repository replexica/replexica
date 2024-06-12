import { createUnplugin } from 'unplugin';
import Z from 'zod';
import crypto from 'crypto';
import { localeSchema } from '@replexica/spec';
import createCodeConverter from './workers/converter';
import createArtifactor from './workers/artifactor';
import { extractI18n } from './iom';
import createCodeWriter from './workers/writer';

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

    const writer = createCodeWriter(ast);
    const reactEnv = writer.resolveReactEnv(ast, config.rsc);

    const i18nTree = extractI18n(ast);
    if (!i18nTree) { throw new Error(`Failed to parse i18n tree from code located at ${filePath}`); }

    const fileId = generateFileIdHash(filePath);
    i18nTree.injectI18n({
      fileId,
      supportedLocales,
      ast,
      isClientCode: reactEnv === 'client',
    });

    const artifactor = createArtifactor(filePath, fileId);
    artifactor.storeMetadata(i18nTree);
    artifactor.storeSourceDictionary(i18nTree, config.locale.source);
    artifactor.storeStubDictionaries(config.locale.targets);

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

export function generateFileIdHash(filePath: string): string {
  const hash = crypto.createHash('md5');
  hash.update(filePath);
  return hash.digest('base64').substring(0, 12);
}