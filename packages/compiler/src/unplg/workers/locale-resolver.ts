import path from 'path';

export type LocaleResolverParams = {
  source: string;
  targets: string[];
};

export default function createLocaleResolver(localeConfig: LocaleResolverParams) {
  const i18nRoot = path.resolve(process.cwd(), '.replexica');

  return {
    i18nRoot,
    supportedLocales: [
      ...new Set([
        localeConfig.source,
        ...localeConfig.targets,
      ]),
    ],
    tryParseLocaleModuleId(filePath: string) {
      for (const locale of this.supportedLocales) {
        const localeFile = path.resolve(i18nRoot, `${locale}.json`);
        if (filePath === localeFile) {
          return locale;
        }
      }

      return null;
    },
  };
}