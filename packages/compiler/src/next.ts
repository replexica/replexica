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
  const absoluteSourceRoot = path.resolve(compilerConfig.sourceRoot);
  const localeServer = new LocaleServer();

  return (nextConfig: NextConfig): NextConfig => ({
    ...nextConfig,
    webpack(config: WebpackConfig, ctx: any) {
      config.plugins?.unshift(
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
      );

      return typeof nextConfig.webpack === 'function'
        ? nextConfig.webpack(config, ctx)
        : config;
    },
  });
}

class LocaleServer implements ILocaleServer {
  private iomStorage: Record<string, I18nScope> = {};
  private pushPromise: Promise<any> = Promise.resolve();

  async pullLocaleData (locale: string): Promise<Record<string, string>> {
    // Wait for all ongoing push operations to complete
    await this.pushPromise;

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
    if (this.iomStorage[scope.hash] && this.iomStorage[scope.hash].hash === scope.hash) {
      return false;
    }

    // Create a new promise that represents this push operation
    const pushOperation = new Promise<boolean>(async (resolve) => {
      // wait 1 second to simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.iomStorage[fileId] = scope;
      resolve(true);
    });

    // Update the pushPromise to include this new operation
    this.pushPromise = Promise.all([this.pushPromise, pushOperation]);

    return pushOperation;
  }
}

function extractDictionary(fileId: string, scope: I18nScope) {
  const dictionary: Record<string, string> = {};

  for (const fragment of scope.fragments) {
    const key = [
      fileId,
      scope.hash,
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