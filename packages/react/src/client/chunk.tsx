'use client';

import { useContext } from "react";
import { replexicaContext } from "./context";
import { ReplexicaChunkGetterArgs, ReplexicaChunkProps } from "../types";

export function ReplexicaClientChunk(props: ReplexicaChunkProps) {
  const r = useContext(replexicaContext)!;

  const result = getReplexicaChunkContent({
    data: r.data,
    selector: props,
  });

  return result;
}

export function getReplexicaChunkContent(args: ReplexicaChunkGetterArgs) {
  const fileData = args.data?.[args.selector.fileId];
  const scopeData = fileData?.[args.selector.scopeId];
  const chunkData = scopeData?.[args.selector.chunkId];

  const fallback = `chunk#${args.selector.fileId}:${args.selector.scopeId}.${args.selector.chunkId}`;

  const result = chunkData || fallback;

  return result;
}