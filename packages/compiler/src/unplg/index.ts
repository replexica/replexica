import fs from 'fs';
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
  const i18nRoot = path.resolve(process.cwd(), 'node_modules', '@replexica/.cache');

  const localeResolver = createLocaleResolver(i18nRoot, config.locale);
  const iom = createIomStorage();
  const localeServer = createLocaleServer(iom.storage);
  const artifactor = createArtifactor(i18nRoot, localeResolver.supportedLocales);

  traverseCodeFiles((filePath) => {
    if (!shouldTransform(filePath)) { return; }
    const fileId = createFileId(filePath);

    const code = fs.readFileSync(filePath, 'utf-8');
    const { scope } = extractIomEntry(filePath, code);
    if (!scope) { return; }

    iom.pushScope(fileId, scope);
  });
  artifactor.createMockLocaleModules();

  // localeServer.fetchAllDictionaries();

  return {
    name: 'replexica',
    enforce: 'pre',
    // buildStart() {
    //   artifactor.createMockLocaleModules();
    // },
    // buildEnd() {
    //   artifactor.deleteMockLocaleModules();
    // },
    transformInclude(filePath) {
      return shouldTransform(filePath);
    },
    watchChange: console.log,
    async load(filePath) {
      const localeModuleId = localeResolver.tryParseLocaleModuleId(filePath);
      if (!localeModuleId) { return null; }

      const data = await localeServer.loadDictionary(localeModuleId);
      return {
        code: JSON.stringify(data),
        map: null,
      };
    },
    async transform(code, filePath) {
      const fileId = createFileId(filePath);
      const { scope, ast, converter } = extractIomEntry(filePath, code);

      if (!scope) { return { code, map: null }; }

      iom.pushScope(fileId, scope);
      artifactor.invalidateMockLocaleModules();

      scope.injectI18n(ast, {
        fileId,
        i18nRoot,
        supportedLocales: localeResolver.supportedLocales,
        isClientCode: !config.isServer,
      });


      const result = converter.generateUpdatedCode(ast);

      return {
        code: result.code,
        map: result.map,
      };
    },
  };

  function extractIomEntry(filePath: string, code: string) {
    const converter = createCodeConverter(code);
    const { ast } = converter.generateAst();

    const fileName = path.relative(config.sourceRoot, filePath);
    const scope = extractI18n(ast, fileName);

    return { ast, converter, scope };
  }

function traverseCodeFiles(fn: (filePath: string) => void) {
  const directory = config.sourceRoot;
  // fs.readdirSync does not support the recursive option with withFileTypes
  // Need to create a helper function to handle recursion manually
  const traverse = (dir: string) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        traverse(filePath); // Recurse into subdirectories
      } else {
        fn(filePath); // Apply the function to each file path
      }
    }
  };

  traverse(directory);
}

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
