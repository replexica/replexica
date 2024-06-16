import path from 'path';
import type { NextConfig } from 'next';
import Z from 'zod';
// import path from 'path';
// import fs from 'fs';
// import walk from 'ignore-walk';
import type { Configuration as WebpackConfig } from 'webpack';

import { I18nConfig } from "./config";
import unplg from './unplg';

const nextCompilerConfigSchema = Z.object({
  sourceRoot: Z.string().optional().default('src'),
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
});

export type NextCompilerConfig = Z.infer<typeof nextCompilerConfigSchema>;

export default function (_compilerConfig: NextCompilerConfig, i18nConfig: I18nConfig) {
  const compilerConfig = nextCompilerConfigSchema.parse(_compilerConfig);
  const absoluteSourceRoot = path.resolve(compilerConfig.sourceRoot);

  return (nextConfig: NextConfig): NextConfig => ({
    ...nextConfig,
    webpack(config: WebpackConfig, ctx: any) {
      config.plugins?.unshift(
        unplg.webpack({
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