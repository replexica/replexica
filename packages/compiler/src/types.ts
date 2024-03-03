export type ReplexicaConfig = {
  outDir: string;
  i18nDir: string;
  sourceLocale: string;
  debug?: boolean;
};

export type ReplexicaLocaleData = {
  [fileId: string]: {
    [scopeId: string]: {
      [chunkId: string]: string;
    };
  };
};
