import walk from 'ignore-walk';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { basePlugin, shouldTransformFile, transformFile } from './base';
import { configFileSchema, defaultConfig } from '@replexica/spec';

export function nextPlugin(partialReplexicaConfig?: Partial<typeof configFileSchema._type>) {
  const replexicaFileConfig = loadReplexicaFileConfig();
  const finalReplexicaConfig = _.merge(
    {},
    defaultConfig,
    replexicaFileConfig,
    partialReplexicaConfig,
  );
  return (nextConfig: any) => {
    return {
      ...nextConfig,
      webpack(config: any, ctx: any) {
        const plugin = basePlugin.webpack(finalReplexicaConfig);
        config.plugins.unshift(plugin);
  
        const files = walk.sync({
          path: ctx.dir,
          ignoreFiles: ['.gitignore'],
        })
          .map((relFilePath) => path.resolve(ctx.dir, relFilePath))
          .filter((file) => shouldTransformFile(file));
  
        for (const file of files) {
          const code = fs.readFileSync(file, 'utf-8');
          transformFile(code, file, finalReplexicaConfig);
        }
  
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, ctx);
        }
  
        return config;
      },
    };
  }
}

function loadReplexicaFileConfig(): any {
  const replexicaConfigPath = path.resolve(process.cwd(), 'i18n.json');
  const fileExists = fs.existsSync(replexicaConfigPath);
  if (!fileExists) { return undefined; }

  const fileContent = fs.readFileSync(replexicaConfigPath, 'utf-8');
  const replexicaFileConfig = JSON.parse(fileContent);
  return replexicaFileConfig;
}
