import { basePlugin } from './base';
import { ReplexicaConfig } from '../options';

export function nextPlugin<O extends ReplexicaConfig>(replexicaOptions: O, nextConfig: any) {
  return {
    ...nextConfig,
    webpack(config: any, options: any) {
      config.plugins.unshift(basePlugin.webpack(replexicaOptions));

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  };
}
