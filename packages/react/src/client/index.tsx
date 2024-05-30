'use client';

import { createContext, useContext } from 'react';
import { I18nBaseChunk, I18nBaseChunkProps, I18nInstance } from "../shared";

const I18nContext = createContext<I18nInstance>({
  currentLocale: 'en',
  defaultLocale: 'en',
  supportedLocales: ['en'],
  data: {} as any,
});

const useI18n = () => useContext(I18nContext);

export type I18nProviderProps = {
  i18n: I18nInstance;
  children?: React.ReactNode;
};

export function I18nProvider(props: I18nProviderProps) {
  return (
    <I18nContext.Provider
      value={props.i18n}
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
