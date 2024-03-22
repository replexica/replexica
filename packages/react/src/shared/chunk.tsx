export type ReplexicaBaseChunkProps = ReplexicaChunkSelector & {
  data: any;
};

export function ReplexicaBaseChunk(props: ReplexicaBaseChunkProps) {
  return resolveChunkValue(props.data, {
    fileId: props.fileId,
    scopeId: props.scopeId,
    chunkId: props.chunkId,
  });
}

export type ReplexicaChunkSelector = {
  fileId: string;
  scopeId: string;
  chunkId: string;
};

export function resolveChunkValue(data: any, selector: ReplexicaChunkSelector) {
  const { fileId, scopeId, chunkId } = selector;
  const text = data?.[fileId]?.[scopeId]?.[chunkId];
  const fallback = `${fileId}.${scopeId}.${chunkId}`;
  return text || fallback;
}
