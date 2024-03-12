'use client';

import { createElement, useContext } from "react";
import { ReplexicaChunkSelector, ReplexicaProxyProps } from "../types";
import { replexicaContext } from "./context";
import { getReplexicaChunkContent } from "./chunk";

export function ReplexicaClientProxy<P extends {}>(props: ReplexicaProxyProps<P>) {
  // const r = useContext(replexicaContext)!;
  // const data = r.data;

  // const propsPatch: Partial<P> = Object
  //   .entries(props.attributes || {})
  //   .reduce((acc, [key, value]) => {
  //     const result = getReplexicaChunkContent({
  //       data: data,
  //       selector: value as ReplexicaChunkSelector,
  //     });

  //     return {
  //       ...acc,
  //       [key]: result,
  //     };
  //   }, {});

  // const modifiedProps: P = {
  //   ...props.targetProps,
  //   ...propsPatch,
  // };

  // return createElement(
  //   props.target,
  //   modifiedProps,
  // );
  return null;
}
