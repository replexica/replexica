export type ReplexicaServerProps = {
  loadLocale: () => Promise<string>;
  loadLocaleData: (locale: string) => Promise<any>;
};
