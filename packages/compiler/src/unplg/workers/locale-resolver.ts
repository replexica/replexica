import path from 'path';
import fs from 'fs';

export type LocaleResolverParams = {
  source: string;
  targets: string[];
};

export default function createLocaleResolver(i18nRoot: string, localeConfig: LocaleResolverParams) {
  const supportedLocales = [
    ...new Set([
      localeConfig.source,
      ...localeConfig.targets,
    ]),
  ];

  const localeMap = new Map(
    supportedLocales
      .map(locale => [
        path.resolve(i18nRoot, `${locale}.json`),
        locale,
      ]),
  );

  return {
    supportedLocales,
    tryParseLocaleModuleId(filePath: string) {
      const result = localeMap.get(filePath) || null;
      return result;
    },
  };
}