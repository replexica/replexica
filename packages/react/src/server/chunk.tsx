'use server';

import { ReplexicaBaseChunk, ReplexicaBaseChunkProps } from "../shared";
import { ReplexicaServerProps } from "./types";

export type ReplexicaServerChunkProps = 
  & Omit<ReplexicaBaseChunkProps, 'data'> 
  & ReplexicaServerProps;

export async function ReplexicaServerChunk(props: ReplexicaServerChunkProps) {
  const locale = await props.loadLocale();
  const data = await props.loadLocaleData(locale);

  return (
    <ReplexicaBaseChunk
      data={data}
      fileId={props.fileId}
      scopeId={props.scopeId}
      chunkId={props.chunkId}
    />
  );
}
