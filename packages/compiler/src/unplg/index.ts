import * as t from '@babel/types';
import path from 'path';
import fs from 'fs';
import { createUnplugin } from 'unplugin';
import Z from 'zod';
import crypto from 'crypto';
import { localeSchema } from '@replexica/spec';
import createCodeConverter from './workers/converter';
import { I18nScope, extractI18n } from './iom';

type CompilerParams = {
  sourceRoot: string;
  i18nRoot: string;
  supportedLocales: string[];
};

class Compiler {
  private iomStorage: Record<string, I18nScope | null> = {};
  private codeStorage: Record<string, string> = {};
  private astStorage: Record<string, t.File> = {};

  constructor(
    private readonly params: CompilerParams,
  ) {
    this._initOutputDir();
  }

  shouldTransform(filePath: string) {
    const supportedFileExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    const ignoredPaths = ['node_modules'];

    const result = [
      supportedFileExtensions.includes(path.extname(filePath)),
      !ignoredPaths.some((ignoredPath) => filePath.includes(ignoredPath)),
    ].every((Boolean));
    return result;
  }

  inferIom() {
    fs
      .readdirSync(this.params.sourceRoot)
      .map((file) => path.resolve(this.params.sourceRoot, file))
      .filter((file) => this.shouldTransform(file))
      .forEach((file) => this.inferScope(file));
  }

  inferScope(filePath: string) {
    if (!this.shouldTransform(filePath)) { return; }
    const fileName = path.relative(this.params.sourceRoot, filePath);

    const code = fs.readFileSync(filePath, 'utf-8');
    const converter = createCodeConverter(code);
    const { ast } = converter.generateAst();
    const i18nTree = extractI18n(ast, fileName);

    this.iomStorage[filePath] = i18nTree;
    this.codeStorage[filePath] = code;
    this.astStorage[filePath] = ast;
  }

  injectI18n(filePath: string, isClientCode: boolean) {
    const i18nTree = this.iomStorage[filePath];
    if (!i18nTree) { return; }

    const code = this.codeStorage[filePath];
    if (!code) { return; }

    const ast = this.astStorage[filePath];
    if (!ast) { return; }

    i18nTree.injectI18n({
      fileId: filePath,
      isClientCode,
      filePath,
      i18nRoot: this.params.i18nRoot,
      supportedLocales: this.params.supportedLocales,
      ast,
    });
  }

  generateCode(filePath: string) {
    const ast = this.astStorage[filePath];
    const code = this.codeStorage[filePath];

    if (!ast || !code) { return { code: '', map: null }; }

    const converter = createCodeConverter(code);
    const result = converter.generateUpdatedCode(ast);

    return result;
  }

  invalidateLocaleModules() {
    for (const locale of this.params.supportedLocales) {
      const localeFile = path.resolve(this.params.i18nRoot, `${locale}.json`);
      if (!fs.existsSync(localeFile)) {
        fs.writeFileSync(localeFile, '{}');
      } else {
        fs.utimesSync(localeFile, new Date(), new Date());
      }
    }
  }

  private _initOutputDir() {
    fs.mkdirSync(this.params.i18nRoot, { recursive: true });
  }
}

export interface ILocaleServer {
  pullLocaleData: (locale: string) => Promise<Record<string, string>>;
  pushIomChunk: (fileId: string, scope: I18nScope) => Promise<boolean>;
};

export abstract class BaseLocaleServer {
  protected _extractDictionary(fileId: string, scope: I18nScope) {
    const dictionary: Record<string, string> = {};
  
    for (const fragment of scope.fragments) {
      const key = [
        fileId,
        scope.index,
        fragment.index,
      ].join('#');
  
      dictionary[key] = fragment.data.value;
    }
  
    for (const childScope of scope.scopes) {
      const childDictionary = this._extractDictionary(fileId, childScope);
      Object.assign(dictionary, childDictionary);
    }
  
    return dictionary;
  }
}

export class RemoteLocaleServer extends BaseLocaleServer {
  private iomStorage: Record<string, I18nScope> = {};

  async pullLocaleData(locale: string) {
    if (locale !== 'en') { return {}; }

    const result: Record<string, string> = {};
    for (const [fileId, scope] of Object.entries(this.iomStorage)) {
      const dictionary = this._extractDictionary(fileId, scope);
      Object.assign(result, dictionary);
    }

    return result;
  }

  async uploadIom(iomStorage: Record<string, I18nScope>) {
    this.iomStorage = iomStorage;
  }
}

export class LocalLocaleServer extends BaseLocaleServer {
  private remoteLocaleServer: RemoteLocaleServer = new RemoteLocaleServer();

  constructor(
    private supportedLocales: string[],
  ) {
    super();
  }

  private iomStorage: Record<string, I18nScope> = {};
  private dictionaryStorage: Record<string, Record<string, string>> = {};

  async fetchAllDictionaries() {
    // fetch all dctionaries in parallel
    const promises = this.supportedLocales.map((locale) => this.remoteLocaleServer.pullLocaleData(locale));
    const dictionaries = await Promise.all(promises);

    // store the dictionaries
    for (const [index, locale] of this.supportedLocales.entries()) {
      this.dictionaryStorage[locale] = dictionaries[index];
    }
  }

  async downloadDictionary(locale: string): Promise<Record<string, string>> {
    if (locale !== 'en') { return {}; }

    const result: Record<string, string> = {};
    for (const [fileId, scope] of Object.entries(this.iomStorage)) {
      const dictionary = this._extractDictionary(fileId, scope);
      Object.assign(result, dictionary);
    }

    return result;
  }

  uploadIom(iomStorage: Record<string, I18nScope>) {
    this.iomStorage = iomStorage;
  }

  uploadScope(fileId: string, scope: I18nScope) {
    this.iomStorage[fileId] = scope;
  }
}

const unplgConfigSchema = Z.object({
  localeServer: Z.any() as Z.ZodType<ILocaleServer>,
  // absolute path to the source root
  sourceRoot: Z.string(),
  isServer: Z.boolean(),
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
  locale: localeSchema,
});

export default createUnplugin<Z.infer<typeof unplgConfigSchema>>((_config) => {
  const config = unplgConfigSchema.parse(_config);
  const supportedLocales = getSupportedLocales(config.locale);
  const i18nRoot = path.resolve(process.cwd(), '.replexica');

  const _localeServer = new LocalLocaleServer(supportedLocales);

  const compiler = new Compiler({
    sourceRoot: config.sourceRoot,
    i18nRoot,
    supportedLocales,
  });

  compiler.inferIom();
  compiler.invalidateLocaleModules();

  return {
    name: 'replexica',
    enforce: 'pre',
    transformInclude(filePath) {
      return compiler.shouldTransform(filePath);
    },
    watchChange(id, change) {
      console.log('WatchChange', { id, change });
    },
    async transform(code, filePath) {
      compiler.inferScope(filePath);
      compiler.invalidateLocaleModules();

      compiler.injectI18n(filePath, !config.isServer);

      const result = compiler.generateCode(filePath);

      return {
        code: result.code,
        map: result.map,
      };
    },
    async load(filePath) {
      const localeModuleId = tryParseLocaleModuleId(filePath, i18nRoot, supportedLocales);
      if (!localeModuleId) { return null; }

      const data = await _localeServer.downloadDictionary(localeModuleId);
      return {
        code: JSON.stringify(data),
        map: null,
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

function tryParseLocaleModuleId(filePath: string, i18nRoot: string, supportedLocales: string[]) {
  for (const locale of supportedLocales) {
    const localeFile = path.resolve(i18nRoot, `${locale}.json`);
    if (filePath === localeFile) {
      return locale;
    }
  }

  return null;
}