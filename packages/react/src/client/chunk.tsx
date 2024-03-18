'use client';

import { useContext } from "react";
import { replexicaContext } from "./context";
import { ReplexicaBaseChunk, ReplexicaBaseChunkProps } from "../shared";

export type ReplexicaChunkProps = Omit<ReplexicaBaseChunkProps, 'data'>;

export function ReplexicaClientChunk(props: ReplexicaChunkProps) {
  const r = useContext(replexicaContext);
  const data = r?.data || {};

  return (
    <ReplexicaBaseChunk
      data={data}
      fileId={props.fileId}
      scopeId={props.scopeId}
      chunkId={props.chunkId}
    />
  );
}
