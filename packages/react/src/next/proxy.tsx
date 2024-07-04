import { I18nBaseProxyProps, I18nBaseProxy, I18nInstance, I18nBaseProxyDollarProp } from "../shared";

export type I18nProxyDollarProp = Omit<I18nBaseProxyDollarProp, 'i18n'> & {
  loadI18n: () => Promise<I18nInstance>;
}

export type I18nProxyProps<P extends {}> = Omit<I18nBaseProxyProps<P, I18nBaseProxyDollarProp>, '$'> & {
  $: I18nProxyDollarProp;
};

export async function I18nProxy<P extends {}>(props: I18nProxyProps<P>) {
  const { $, ...originalProps } = props;
  const { loadI18n, ...partialDollarProp } = $;
  const i18n = await loadI18n();

  const baseDollarProp: I18nBaseProxyDollarProp = {
    ...partialDollarProp,
    i18n,
  };

  return (
    <I18nBaseProxy
      {...originalProps}
      $={baseDollarProp}
    />
  );
}

export type I18nProviderProps = {
  locale: string;
  locales: string[];
  data: any;
};
