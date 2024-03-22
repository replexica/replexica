import { UnpluginInstance } from 'unplugin';

export function createNextPlugin<O>(unplugin: UnpluginInstance<O>) {
  return (replexicaOptions: O, nextConfig: any) => {
    return {
      ...nextConfig,
      webpack(config: any, options: any) {
        config.plugins.unshift(unplugin.webpack(replexicaOptions));

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    };
  }
}
