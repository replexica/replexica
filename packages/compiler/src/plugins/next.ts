import walk from 'ignore-walk';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { basePlugin, shouldTransformFile, transformFile } from './base';
import { configFileSchema } from '@replexica/spec';
import { ReplexicaConfig } from '../options';

export type ReplexicaNextCompilerConfig = {
  rsc?: boolean;
  debug?: boolean;
};

const defaultNextCompilerConfig: ReplexicaNextCompilerConfig = {
  rsc: true,
  debug: false,
};

export function nextPlugin(partialNextCompilerConfig = defaultNextCompilerConfig) {
  const i18nConfig = loadI18nConfig();
  const compilerConfig = _.merge(
    {},
    defaultNextCompilerConfig,
    partialNextCompilerConfig,
  );
  return (nextConfig: any) => {
    return {
      ...nextConfig,
      webpack(config: any, ctx: any) {
        const compilerBucketPath = Object.entries(i18nConfig.buckets || {})
          .filter(([_, value]) => value === 'i18n')
          ?.map(([key]) => key)
          ?.[0];

        // If there's not compiler's bucket path, we don't need to do anything
        if (!compilerBucketPath) { return config; }

        const replexicaConfig: ReplexicaConfig = {
          bucketPath: compilerBucketPath,
          rsc: !!compilerConfig.rsc,
          debug: !!compilerConfig.debug,
          locale: {
            source: i18nConfig.locale.source,
            targets: i18nConfig.locale.targets,
          },
        };
        const plugin = basePlugin.webpack(replexicaConfig);
        config.plugins.unshift(plugin);
  
        const files = walk.sync({
          path: ctx.dir,
          ignoreFiles: ['.gitignore'],
        })
          .map((relFilePath) => path.resolve(ctx.dir, relFilePath))
          .filter((file) => shouldTransformFile(file));
  
        for (const file of files) {
          const code = fs.readFileSync(file, 'utf-8');
          transformFile(code, file, replexicaConfig);
        }
  
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, ctx);
        }
  
        return config;
      },
    };
  }
}

function loadI18nConfig() {
  const replexicaConfigPath = path.resolve(process.cwd(), 'i18n.json');
  const fileExists = fs.existsSync(replexicaConfigPath);
  if (!fileExists) { throw new Error('i18n.json file not found'); }

  const fileContent = fs.readFileSync(replexicaConfigPath, 'utf-8');
  const replexicaFileConfig = JSON.parse(fileContent);

  return configFileSchema.parse(replexicaFileConfig);
}
