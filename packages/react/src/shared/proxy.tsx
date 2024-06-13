import { createElement } from "react";
import { I18nBaseFragmentProps, resolveI18nValue } from "./fragment";
import { I18nInstance } from "./types";

export type I18nBaseProxyDollarProp = {
  i18n: I18nInstance;
  Component: string | React.ComponentType<any>;
  attributes: Record<string, any>;
};

export type I18nBaseProxyProps<P extends {}, D extends I18nBaseProxyDollarProp> = P & {
  $: D;
};

export function I18nBaseProxy<P extends {}, D extends I18nBaseProxyDollarProp>(props: I18nBaseProxyProps<P, D>) {
  const { $, ...originalProps } = props;
  let propsPatch: Partial<P> = {};

  for (const [key, value] of Object.entries($.attributes || {})) {
    const selector = value as Omit<I18nBaseFragmentProps, 'data'>;
    const result = resolveI18nValue($.i18n.data, selector);

    propsPatch = {
      ...propsPatch,
      [key]: result,
    };
  }

  const modifiedProps: P = {
    ...originalProps,
    ...propsPatch,
  } as any;

  return createElement(
    $.Component,
    modifiedProps,
  );
}
