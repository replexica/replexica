export type ReplexicaChunkSelector = {
  fileId: string;
  scopeId: string;
  chunkId: string;
};

export type ReplexicaChunkProps = ReplexicaChunkSelector;

export type ReplexicaChunkGetterArgs = {
  data: any;
  selector: ReplexicaChunkSelector;
};

export type ReplexicaProxyProps<P extends {}> = P & {
  __ReplexixcaComponent: string | React.ComponentType<P>;
  __ReplexicaAttributes: Record<keyof P, ReplexicaChunkSelector>;
};