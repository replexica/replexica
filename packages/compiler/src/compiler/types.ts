export type ReplexicaCompilerPayload = {
  settings: {
    locale: { source: string; targets: string[]; };
  };
  data: ReplexicaCompilerData;
};

export type ReplexicaCompilerData = {
  [fileId: string]: ReplexicaFilePayload;
};

export type ReplexicaFileContext = {
  isClient: boolean;
};

export type ReplexicaFilePayload = {
  context: ReplexicaFileContext;
  data: ReplexicaFileData;
};

export type ReplexicaFileData = {
  [scopeId: string]: ReplexicaScopePayload;
}

export type ReplexicaScopePayload = {
  hints: ReplexicaScopeHint[];
  data: ReplexicaScopeData;
};

export type ReplexicaScopeHint = {
  type: 'attribute';
  name: string;
} | {
  type: 'element';
  name: string;
  hint: string | null;
};

export type ReplexicaScopeData = {
  [chunkId: string]: string;
};
