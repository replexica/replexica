'use client';

import { useMemo } from "react";
import { replexicaContext } from './context';

export type ReplexicaIntlProviderProps = {
  data: any;
  children?: React.ReactNode;
};

export function ReplexicaIntlProvider(props: ReplexicaIntlProviderProps) {
  const value = useMemo(getReplexicaValue, [props.data]);
  return (
    <replexicaContext.Provider value={value}>
      {props.children}
    </replexicaContext.Provider>
  );

  function getReplexicaValue() {
    return {
      data: props.data,
    };
  }
}
