import path from 'path';
import fs from 'fs';
import { createUnplugin } from 'unplugin';
import Z from 'zod';
import crypto from 'crypto';
import { localeSchema } from '@replexica/spec';
import createCodeConverter from './workers/converter';
import createArtifactor from './workers/artifactor';
import { I18nScope, extractI18n } from './iom';
import createCodeWriter from './workers/writer';

const unplgConfigSchema = Z.object({
  localeServer: Z.any() as Z.ZodType<ILocaleServer>,
  sourceRoot: Z.string(),
  isServer: Z.boolean(),
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
  locale: localeSchema,
});

export interface ILocaleServer {
  pullLocaleData: (locale: string) => Promise<Record<string, string>>;
  pushIomChunk: (fileId: string, scope: I18nScope) => Promise<boolean>;
};

export default createUnplugin<Z.infer<typeof unplgConfigSchema>>((_config) => {
  const config = unplgConfigSchema.parse(_config);
  const supportedLocales = getSupportedLocales(config.locale);
  const i18nRoot = path.resolve(process.cwd(), '.replexica');

  initReplexicaDir(i18nRoot, supportedLocales);

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
      if (id === path.resolve(i18nRoot, 'en.json')) {
        console.log('Loading en.json');
        const data = await config.localeServer.pullLocaleData('en');
        console.log('Loaded en.json', data);

        return {
          code: JSON.stringify(data),
          map: null,
        };
      } else if (id === path.resolve(i18nRoot, 'es.json')) {
        console.log('Loading es.json');
        const data = await config.localeServer.pullLocaleData('es');
        console.log('Loaded es.json', data);
        return {
          code: JSON.stringify(data),
          map: null,
        };
      }

      return null;
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

      const i18nTree = extractI18n(ast, filePathLabel);
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

      console.log(`[${filePathLabel}] pushing i18n tree to locale server...`);
      const pushHappened = await config.localeServer.pushIomChunk(fileId, i18nTree);
      console.log(`[${filePathLabel}] pushed i18n tree (${pushHappened})`);

      if (pushHappened) {
        // trigger watcher to reload locale files
        touchLocaleFiles(i18nRoot, supportedLocales);
      }

      const artifactor = createArtifactor(filePath, fileId, i18nRoot);
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

function generateStringHash(text: string): string {
  const hash = crypto.createHash('md5');
  hash.update(text);
  return hash.digest('base64').substring(0, 12);
}

function resolveLocaleFile(i18nRoot: string, locale: string) {
  return path.resolve(i18nRoot, `${locale}.json`);
}

function initReplexicaDir(i18nRoot: string, supportedLocales: string[]) {
  fs.mkdirSync(i18nRoot, { recursive: true });
  // generate stub dictionaries
  for (const locale of supportedLocales) {
    const localeFile = resolveLocaleFile(i18nRoot, locale);
    if (!fs.existsSync(localeFile)) {
      fs.writeFileSync(localeFile, '{}');
    }
  }
}

function touchLocaleFiles(i18nRoot: string, supportedLocales: string[]) {
  for (const locale of supportedLocales) {
    const localeFile = resolveLocaleFile(i18nRoot, locale);
    fs.utimesSync(localeFile, new Date(), new Date());
  }
}