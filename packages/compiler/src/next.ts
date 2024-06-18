import path from 'path';
import type { NextConfig } from 'next';
import Z from 'zod';
import type { Configuration as WebpackConfig } from 'webpack';

import { I18nConfig } from "./config";
import unplg, { ILocaleServer } from './unplg';
import { I18nScope, I18nScopeType } from './unplg/iom';
import { I18nFragmentType } from './unplg/iom/_fragment';

const nextCompilerConfigSchema = Z.object({
  sourceRoot: Z.string().optional().default('src'),
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
});

export type NextCompilerConfig = Z.infer<typeof nextCompilerConfigSchema>;

export default function (_compilerConfig: NextCompilerConfig, i18nConfig: I18nConfig) {
  const compilerConfig = nextCompilerConfigSchema.parse(_compilerConfig);
  const absoluteSourceRoot = path.resolve(process.cwd(), compilerConfig.sourceRoot);
  const localeServer = new CachedLocaleServer();

  return (nextConfig: NextConfig): NextConfig => ({
    ...nextConfig,
    webpack(oldWebpackConfig: WebpackConfig, ctx: any) {
      const newWebpackConfig: WebpackConfig = {
        ...oldWebpackConfig,
        plugins: [
          unplg.webpack({
            localeServer,
            sourceRoot: absoluteSourceRoot,
            isServer: ctx.isServer,
            rsc: compilerConfig.rsc,
            debug: compilerConfig.debug,
            locale: {
              source: i18nConfig.locale.source,
              targets: i18nConfig.locale.targets,
            },
          }),
          ...oldWebpackConfig.plugins || [],
        ],
      };

      return typeof nextConfig.webpack === 'function'
        ? nextConfig.webpack(newWebpackConfig, ctx)
        : newWebpackConfig;
    },
  });
}

class CachedLocaleServer implements ILocaleServer {
  private defaultLocale = 'en';
  private iomStorage: Record<string, I18nScope> = {};
  private remoteLocaleServer = new RemoteLocaleServer();

  async pullLocaleData (locale: string): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    if (locale === this.defaultLocale) {
      console.log(`Building locale ${locale} from cache`)
      for (const [fileId, scope] of Object.entries(this.iomStorage)) {
        const dictionary = extractDictionary(fileId, scope);
        Object.assign(result, dictionary);
      }
    } else {
      console.log(`Building locale ${locale} from remote`)
      const remoteResult = await this.remoteLocaleServer.pullLocaleData(locale);
      Object.assign(result, remoteResult);
    }

    return result;
  }

  async pushIomChunk(fileId: string, scope: I18nScope<I18nScopeType, I18nFragmentType>): Promise<boolean> {
    this.iomStorage[fileId] = scope;
    return await this.remoteLocaleServer.pushIomChunk(fileId, scope);
  }
}

class RemoteLocaleServer implements ILocaleServer {
  private iomStorage: Record<string, I18nScope> = {};

  async pullLocaleData (locale: string): Promise<Record<string, string>> {
    // for demo only
    if (locale !== 'en') { return {}; }

    const result: Record<string, string> = {};

    for (const [fileId, scope] of Object.entries(this.iomStorage)) {
      const dictionary = extractDictionary(fileId, scope);
      Object.assign(result, dictionary);
    }

    // wait 1 second to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return result;
  }

  async pushIomChunk(fileId: string, scope: I18nScope<I18nScopeType, I18nFragmentType>): Promise<boolean> {
    // wait 1 second to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.iomStorage[fileId] = scope;

    return true;
  }
}

function extractDictionary(fileId: string, scope: I18nScope) {
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
    const childDictionary = extractDictionary(fileId, childScope);
    Object.assign(dictionary, childDictionary);
  }

  return dictionary;
}