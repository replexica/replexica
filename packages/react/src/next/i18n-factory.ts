'use server';

import { loadLocale } from "./utils";
import { createBaseI18n, CreateBaseI18nConfig } from '../shared'

export type CreateI18nConfig = CreateBaseI18nConfig;

export function createI18n<S, T>(
  config: CreateI18nConfig,
  localeLoaders: Record<string, () => Promise<{ default: any }>>
) {
  const baseI18n = createBaseI18n(config);

  let currentLocale: typeof config.locale.source;
  let currentData: any;

  return {
    ...baseI18n,
    params: {
      ...baseI18n.params,
      get currentLocale() {
        if (!currentLocale) {
          throw createNotInitializedError();
        }
        return currentLocale;
      },
    },
    async init() {
      currentLocale = await loadLocale() || baseI18n.params.defaultLocale;

      const localeDataLoader = localeLoaders[currentLocale];
      if (!localeDataLoader) {
        throw new Error(`Could not find loader for locale "${currentLocale}"`);
      }

      const dataModule = await localeDataLoader();
      currentData = dataModule.default;
    },
    get data() {
      if (!currentData) {
        throw createNotInitializedError();
      }
      return currentData;
    },
  };
}

function createNotInitializedError() {
  return new Error(`I18n is not initialized. Did you forget to call "await i18n.init()"?`);
}