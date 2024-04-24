import walk from 'ignore-walk';
import fs from 'fs';
import path from 'path';
import { basePlugin, shouldTransformFile, transformFile } from './base';
import { ReplexicaConfig } from '../options';

export function nextPlugin<O extends ReplexicaConfig>(replexicaOptions: O, nextConfig: any) {
  return {
    ...nextConfig,
    webpack(config: any, ctx: any) {
      const plugin = basePlugin.webpack(replexicaOptions);
      config.plugins.unshift(plugin);

      const files = walk.sync({
        path: ctx.dir,
        ignoreFiles: ['.gitignore'],
      })
        .map((relFilePath) => path.resolve(ctx.dir, relFilePath))
        .filter((file) => shouldTransformFile(file));

      for (const file of files) {
        const code = fs.readFileSync(file, 'utf-8');
        transformFile(code, file, replexicaOptions);
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, ctx);
      }

      return config;
    },
  };
}
