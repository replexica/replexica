import path from 'path';
import type { NextConfig } from 'next';
import Z from 'zod';
import type { Configuration as WebpackConfig } from 'webpack';

import unplg from './unplg';
import { I18nConfig } from '@replexica/spec';

const nextCompilerConfigSchema = Z.object({
  sourceRoot: Z.string().optional().default('src'),
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
});

export type NextCompilerConfig = Z.infer<typeof nextCompilerConfigSchema>;

export default function (_compilerConfig: NextCompilerConfig, i18nConfig: I18nConfig) {
  const compilerConfig = nextCompilerConfigSchema.parse(_compilerConfig);
  const absoluteSourceRoot = path.resolve(process.cwd(), compilerConfig.sourceRoot);

  return (nextConfig: NextConfig): NextConfig => ({
    ...nextConfig,
    webpack(oldWebpackConfig: WebpackConfig, ctx: any) {
      const newWebpackConfig: WebpackConfig = {
        ...oldWebpackConfig,
        plugins: [
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
          ...oldWebpackConfig.plugins || [],
        ],
      };

      return typeof nextConfig.webpack === 'function'
        ? nextConfig.webpack(newWebpackConfig, ctx)
        : newWebpackConfig;
    },
  });
}
