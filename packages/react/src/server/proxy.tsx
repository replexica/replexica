'use server';

import { ReplexicaBaseProxy, ReplexicaBaseProxyProps } from "../shared";
import { ReplexicaServerProps } from "./types";

export type ReplexicaServerProxyProps<P extends {}> =
  & Omit<ReplexicaBaseProxyProps<P>, 'data'> 
  & ReplexicaServerProps;

export async function ReplexicaServerProxy<P extends {}>(props: ReplexicaServerProxyProps<P>) {
  const { loadLocale, loadLocaleData, ...baseProps } = props;

  const locale = await loadLocale();
  const localeData = await loadLocaleData(locale);

  return (
    <ReplexicaBaseProxy<P>
      data={localeData as any}
      {...baseProps as any}
    />  
  );
}
