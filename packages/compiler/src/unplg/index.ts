import path from 'path';
import fs from 'fs';
import { createUnplugin } from 'unplugin';
import Z from 'zod';
import crypto from 'crypto';
import { localeSchema } from '@replexica/spec';
import createCodeConverter from './workers/converter';
import createArtifactor from './workers/artifactor';
import { extractI18n } from './iom';
import createCodeWriter from './workers/writer';
import { FakeI18nServer } from './_fake-server';

const unplgConfigSchema = Z.object({
  sourceRoot: Z.string(),
  isServer: Z.boolean(),
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
  locale: localeSchema,
});

const i18nServer = new FakeI18nServer();

export default createUnplugin<Z.infer<typeof unplgConfigSchema>>((_config) => {
  const config = unplgConfigSchema.parse(_config);
  const supportedLocales = getSupportedLocales(config.locale);

  const i18nRoot = path.resolve('/tmp/replexica/.cache');

  return {
    name: 'replexica',
    enforce: 'pre',
    watchChange(id, change) {
      console.log('WatchChange', {
        id,
        change,
      });
    },
    async load(id) {
      if (id.endsWith('@replexica/.cache/en.json')) {
        const data = await i18nServer.pullLocaleData('en');
        console.log('pulled en.json', data);
        return {
          code: JSON.stringify(data),
        };
      } else if (id.endsWith('@replexica/.cache/es.json')) {
        const data = await i18nServer.pullLocaleData('es');
        console.log('pulled es.json', data);
        return {
          code: JSON.stringify(data),
        };
      } else {
        return null;
      }
    },
    transformInclude(id) {
      // - tsx, jsx
      // - exclude node_modules
      return /\.(ts|tsx|js|jsx)$/.test(id) && !/node_modules/.test(id);
    },
    async transform(code, filePath) {
      const filePathLabel = path.relative(process.cwd(), filePath);

      const converter = createCodeConverter(code);
      const { ast } = converter.generateAst();

      const writer = createCodeWriter(ast);
      const reactEnv = writer.resolveReactEnv(ast, config.rsc);

      const i18nTree = extractI18n(ast);
      if (!i18nTree) { throw new Error(`Failed to parse i18n tree from code located at ${filePath}`); }

      const fileId = generateStringHash(filePath);
      i18nTree.injectI18n({
        fileId,
        filePath,
        supportedLocales,
        i18nRoot,
        ast,
        isClientCode: reactEnv === 'client',
      });

      const artifactor = createArtifactor(filePath, fileId, i18nRoot);
      // artifactor.storeMetadata(i18nTree);
      // artifactor.storeSourceDictionary(i18nTree, config.locale.source);
      // artifactor.storeStubDictionaries(config.locale.targets);

      await i18nServer.pushIomChunk(fileId, filePathLabel, i18nTree);

      if (i18nTree.scopes.length) {
        for (const locale of supportedLocales) {
          const localeFile = path.resolve(i18nRoot, `${locale}.json`);
          // touch file to trigger watchChange
          fs.utimesSync(localeFile, new Date(), new Date());
        }
      }

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
  };
});

// helper functions

function getSupportedLocales(localeConfig: Z.infer<typeof unplgConfigSchema>['locale']): string[] {
  return [
    ...new Set([
      localeConfig.source,
      ...localeConfig.targets,
    ]),
  ];
}

export function generateStringHash(text: string): string {
  const hash = crypto.createHash('md5');
  hash.update(text);
  return hash.digest('base64').substring(0, 12);
}

// PoC
