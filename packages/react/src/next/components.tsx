'use server';

import { I18nBaseChunk, I18nBaseChunkProps, I18nBaseProxy, I18nBaseProxyProps } from "../shared";
import { createI18n } from "./i18n-factory";

export type I18nChunkProps = Omit<I18nBaseChunkProps, 'data'> & {
  i18n: ReturnType<typeof createI18n>;
};

export async function I18nChunk(props: I18nChunkProps) {
  await props.i18n.init();

  return (
    <I18nBaseChunk
      data={props.i18n.data}
      fileId={props.fileId}
      scopeId={props.scopeId}
      chunkId={props.chunkId}
    />
  );
}

export type I18nProxyProps<P extends {}> =
  & Omit<I18nBaseProxyProps<P>, 'data'>
  & {
    i18n: ReturnType<typeof createI18n>;
  };

export async function I18nProxy<P extends {}>(props: I18nProxyProps<P>) {
  await props.i18n.init();

  return (
    <I18nBaseProxy<P>
      data={props.i18n.data}
      {...props as any}
    />
  );
}

export type I18nProviderProps = {
  locale: string;
  locales: string[];
  data: any;
};
