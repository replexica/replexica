'use client';

import { I18nBaseProxyProps, I18nBaseProxy, I18nBaseProxyDollarProp } from "../shared";
import { useI18n } from "./context";

export type I18nProxyDollarProp = Omit<I18nBaseProxyDollarProp, 'i18n'>;

export type I18nProxyProps<P extends {}> = Omit<I18nBaseProxyProps<P, I18nBaseProxyDollarProp>, '$'> & {
  $: I18nProxyDollarProp;
};

export async function I18nProxy<P extends {}>(props: I18nProxyProps<P>) {
  const { $, ...originalProps } = props;
  
  const i18n = useI18n();
  const baseDollarProp: I18nBaseProxyDollarProp = {
    ...$,
    i18n,
  };

  return (
    <I18nBaseProxy
      {...originalProps}
      $={baseDollarProp}
    />  
  );
}
