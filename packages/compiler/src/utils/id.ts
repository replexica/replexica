import createObjectHash from 'object-hash';

export function generateChunkId(text: string, nonce: number): string {
  return createHash({ text, nonce });
}

export function generateScopeId(chunksIds: string[], nonce: number): string {
  return createHash({ chunksIds, nonce });
}

export function generateFileId(relativeFilePath: string, nonce: number): string {
  // to make sure id remains the same for both windows and unix
  // we need to split by both / and \
  // and then join by /
  const normalizedPath = relativeFilePath.split(/[\\/]/).join('/');
  return createHash({ normalizedPath, nonce });
}

// 

function createHash(obj: any) {
  const length = 12;
  const hash = createObjectHash(obj, { algorithm: 'md5' });
  const shortHash = hash.substring(0, length);
  return shortHash;
}
