'use server';

import { I18nBaseFragment, I18nBaseFragmentProps, I18nBaseProxy, I18nBaseProxyProps, I18nInstance } from "../shared";

export type I18nFragmentProps = Omit<I18nBaseFragmentProps, 'data'> & {
  loadI18n: () => Promise<I18nInstance>;
};

export async function I18nFragment(props: I18nFragmentProps) {
  const i18n = await props.loadI18n();

  return (
    <I18nBaseFragment
      data={i18n.data}
      fileId={props.fileId}
      scopeId={props.scopeId}
      chunkId={props.chunkId}
    />
  );
}

export type I18nProxyProps<P extends {}> =
  & Omit<I18nBaseProxyProps<P>, 'data'>
  & {
    i18n: () => Promise<I18nInstance>;
  };

export async function I18nProxy<P extends {}>(props: I18nProxyProps<P>) {
  const i18n = await props.i18n();

  return (
    <I18nBaseProxy<P>
      data={i18n.data}
      {...props as any}
    />
  );
}

export type I18nProviderProps = {
  locale: string;
  locales: string[];
  data: any;
};
