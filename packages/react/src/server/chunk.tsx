'use server';

import { ReplexicaChunkGetterArgs, ReplexicaChunkProps } from "../types";
import { cookies } from 'next/headers';

export type ReplexicaServerChunkProps = ReplexicaChunkProps & {
  strategy?: 'cookie';
  importer: (locale: string) => ReplexicaChunkGetterArgs['data'];
};

export async function ReplexicaServerChunk(props: ReplexicaServerChunkProps) {
  const locale = await getCurrentLocale();
  console.log(`[ReplexicaServerChunk] locale: ${locale}`);
  const data = await props.importer(locale);
  console.log(`[ReplexicaServerChunk] data: ${JSON.stringify(data)}`);
  const result = await getReplexicaChunkContent({
    data: data,
    selector: {
      fileId: props.fileId,
      scopeId: props.scopeId,
      chunkId: props.chunkId,
    },
  });

  return result;
}

export async function getReplexicaChunkContent(args: ReplexicaChunkGetterArgs) {
  const { fileId, scopeId, chunkId } = args.selector;
  const text = args.data?.[fileId]?.[scopeId]?.[chunkId];
  const fallback = `chunk1#${fileId}:${scopeId}.${chunkId}`;
  return text || fallback;
}

export async function getCurrentLocale() {
  const cookieMgr = cookies();
  return cookieMgr.get('locale')?.value || 'en';
}