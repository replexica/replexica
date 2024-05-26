export type I18nBaseChunkProps = I18nChunkSelector & {
  data: any;
};

export function I18nBaseChunk(props: I18nBaseChunkProps) {
  return resolveChunkValue(props.data, {
    fileId: props.fileId,
    scopeId: props.scopeId,
    chunkId: props.chunkId,
  });
}

export type I18nChunkSelector = {
  fileId: string;
  scopeId: string;
  chunkId: string;
};

export function resolveChunkValue(data: any, selector: I18nChunkSelector) {
  const { fileId, scopeId, chunkId } = selector;
  const text = data?.[fileId]?.[scopeId]?.[chunkId];
  const fallback = `${fileId}.${scopeId}.${chunkId}`;
  return text || fallback;
}
