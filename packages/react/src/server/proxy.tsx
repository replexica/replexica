'use server';

import { createElement } from "react";
import { ReplexicaProxyProps, ReplexicaChunkSelector } from "../types";
import { getReplexicaChunkContent } from './chunk';

export async function ReplexicaServerProxy<P extends {}>(props: ReplexicaProxyProps<P>) {
  // const data = {};

  // let propsPatch: Partial<P> = {};

  // for (const [key, value] of Object.entries(props.attributes || {})) {
  //   const result = await getReplexicaChunkContent({
  //     data,
  //     selector: value as ReplexicaChunkSelector,
  //   });

  //   propsPatch = {
  //     ...propsPatch,
  //     [key]: result,
  //   };
  // }

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