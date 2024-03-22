export type ReplexicaConfig = {
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
