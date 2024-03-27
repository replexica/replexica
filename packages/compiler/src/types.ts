import { ReplexicaScopeHint } from "./compiler";

export type ReplexicaConfig = {
  locale: {
    source: string;
    targets: string[];
  };
  debug?: boolean;
};

export type ReplexicaLocaleData = {
  [fileId: string]: {
    [scopeId: string]: {
      [chunkId: string]: string;
    };
  };
};

export type ReplexicaData = {
  settings: ReplexicaSettingsData;
  meta: ReplexicaMetaData;
};

export type ReplexicaMetaData = {
  files: ReplexicaMetaFileData;
  scopes: ReplexicaMetaScopeData;
};

export type ReplexicaSettingsData = {
  locale: {
    source: string;
    targets: string[];
  };
};

export type ReplexicaMetaFileData = {
  [fileId: string]: {
    isClient: boolean;
  };
};

export type ReplexicaMetaScopeData = {
  [scopeId: string]: {
    hints: ReplexicaScopeHint[];
  };
};