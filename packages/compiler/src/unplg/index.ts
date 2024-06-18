import path from 'path';
import { createUnplugin } from 'unplugin';
import Z from 'zod';
import crypto from 'crypto';
import { localeSchema } from '@replexica/spec';
import createCodeConverter from './workers/converter';
import { extractI18n } from './iom';
import createLocaleResolver from './workers/locale-resolver';
import createIomStorage from './workers/iom-storage';
import createLocaleServer from './workers/locale-server';
import createArtifactor from './workers/artifactor';

const unplgConfigSchema = Z.object({
  // absolute path to the source root
  sourceRoot: Z.string(),
  isServer: Z.boolean(),
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
  locale: localeSchema,
});

export default createUnplugin<Z.infer<typeof unplgConfigSchema>>((_config) => {
  const config = unplgConfigSchema.parse(_config);

  const localeResolver = createLocaleResolver(config.locale);
  const iom = createIomStorage();
  const localeServer = createLocaleServer(iom.storage);
  const artifactor = createArtifactor(localeResolver.supportedLocales);

  return {
    name: 'replexica',
    enforce: 'pre',
    buildStart() {
      artifactor.createMockLocaleModules();
    },
    buildEnd() {
      artifactor.deleteMockLocaleModules();
    },
    transformInclude(filePath) {
      return shouldTransform(filePath);
    },
    watchChange(id, change) {
      console.log('WatchChange', { id, change });
    },
    async transform(code, filePath) {
      const fileId = createFileId(filePath);

      const converter = createCodeConverter(code);
      const { ast } = converter.generateAst();

      const fileName = path.relative(config.sourceRoot, filePath);
      const scope = extractI18n(ast, fileName);
      if (!scope) { return { code, map: null }; }

      iom.pushScope(fileId, scope);
      artifactor.invalidateMockLocaleModules();

      scope.injectI18n(ast, {
        fileId,
        i18nRoot: artifactor.i18nRoot,
        supportedLocales: localeResolver.supportedLocales,
        isClientCode: !config.isServer,
      });

      const result = converter.generateUpdatedCode(ast);

      return {
        code: result.code,
        map: result.map,
      };
    },
    async load(filePath) {
      const localeModuleId = localeResolver.tryParseLocaleModuleId(filePath);
      if (!localeModuleId) { return null; }

      const data = await localeServer.loadDictionary(localeModuleId);
      return {
        code: JSON.stringify(data),
        map: null,
      };
    },
  };

  function shouldTransform(filePath: string) {
    const supportedFileExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    const ignoredPaths = ['node_modules'];

    const result = [
      supportedFileExtensions.includes(path.extname(filePath)),
      !ignoredPaths.some((ignoredPath) => filePath.includes(ignoredPath)),
    ].every((Boolean));
    return result;
  }

  function createFileId(filePath: string) {
    const hash = crypto.createHash('sha256');
    hash.update(filePath);
    return hash.digest('hex').slice(0, 16);
  }
});
