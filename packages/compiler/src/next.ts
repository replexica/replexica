import type { NextConfig } from 'next';
import Z from 'zod';
// import path from 'path';
// import fs from 'fs';
// import walk from 'ignore-walk';
import { Configuration as WebpackConfig } from 'webpack';

import { I18nConfig } from "./config";
import unplg from './unplg';

const nextCompilerConfigSchema = Z.object({
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
});

export type NextCompilerConfig = Z.infer<typeof nextCompilerConfigSchema>;

export default function (_nextCompilerConfig: any, i18nConfig: I18nConfig) {
  return (nextConfig: NextConfig): NextConfig => ({
    ...nextConfig,
    webpack(config: WebpackConfig, ctx: any) {
      const nextCompilerConfig = nextCompilerConfigSchema.parse(_nextCompilerConfig);
      const plugin = unplg.webpack({
        rsc: nextCompilerConfig.rsc,
        debug: nextCompilerConfig.debug,
        locale: {
          source: i18nConfig.locale.source,
          targets: i18nConfig.locale.targets,
        },
      });
      config.plugins?.unshift(plugin);

      // const files = walk.sync({
      //   path: ctx.dir,
      //   ignoreFiles: ['.gitignore'],
      // })
      //   .map((relFilePath) => path.resolve(ctx.dir, relFilePath))
      //   .filter((file) => shouldTransformFile(file));

      // for (const file of files) {
      //   const code = fs.readFileSync(file, 'utf-8');
      //   transformFile(code, file, replexicaConfig);
      // }

      return typeof nextConfig.webpack === 'function'
        ? nextConfig.webpack(config, ctx)
        : config;
    },
  });
}