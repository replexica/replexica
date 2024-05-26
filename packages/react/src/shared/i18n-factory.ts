export type CreateBaseI18nConfig = {
  locale: {
    source: string;
    targets: string[];
  };
};

export function createBaseI18n<S, T>(
  config: CreateBaseI18nConfig,
) {
  return {
    params: {
      defaultLocale: config.locale.source,
      supportedLocales: Array
        .from(new Set([
          config.locale.source,
          ...config.locale.targets,
        ]))
        .filter(Boolean),
    },
  };
}

export type CreateI18nResult = {
  params: {
    currentLocale: string;
    defaultLocale: string;
    supportedLocales: string[];
  };
  data: any;
};