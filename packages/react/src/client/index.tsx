'use client';

import { createContext, useContext } from 'react';
import { CreateI18nResult, I18nBaseChunk, I18nBaseChunkProps } from "../shared";

const I18nContext = createContext<CreateI18nResult>({
  params: {
    currentLocale: 'en',
    defaultLocale: 'en',
    supportedLocales: ['en'],
  },
  data: {},
});

const useI18n = () => useContext(I18nContext);

export type I18nProviderProps = {
  params: CreateI18nResult['params'];
  data: CreateI18nResult['data'];
  children?: React.ReactNode;
};

export function I18nProvider(props: I18nProviderProps) {
  return (
    <I18nContext.Provider
      value={{
        params: props.params,
        data: props.data,
      }}
      children={props.children}
    />
  );
}

export type I18nChunkProps = Omit<I18nBaseChunkProps, 'data'>;

export function I18nChunk(props: I18nChunkProps) {
  const i18n = useI18n();

  return (
    <I18nBaseChunk
      data={i18n.data}
      fileId={props.fileId}
      scopeId={props.scopeId}
      chunkId={props.chunkId}
    />
  );
}

import { I18nBaseProxy, I18nBaseProxyProps } from "../shared";

export type I18nProxyProps<P extends {}> =
  & Omit<I18nBaseProxyProps<P>, 'data'>;

export async function I18nProxy<P extends {}>(props: I18nProxyProps<P>) {
  const i18n = useI18n();

  return (
    <I18nBaseProxy<P>
      data={i18n.data}
      {...props as any}
    />  
  );
}
