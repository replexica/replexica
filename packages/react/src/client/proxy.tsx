'use client';

import { useContext } from 'react';
import { ReplexicaBaseProxy, ReplexicaBaseProxyProps } from "../shared";
import { replexicaContext } from './context';

export type ReplexicaClientProxyProps<P extends {}> =
  & Omit<ReplexicaBaseProxyProps<P>, 'data'>;

export async function ReplexicaClientProxy<P extends {}>(props: ReplexicaClientProxyProps<P>) {
  const r = useContext(replexicaContext)!;
  const data = r.data || {};

  return (
    <ReplexicaBaseProxy<P>
      data={data as any}
      {...props as any}
    />  
  );
}
