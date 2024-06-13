import { createElement } from "react";
import { I18nBaseFragmentProps, resolveI18nValue } from "./fragment";

export type I18nBaseProxyProps<P extends {}> = P & {
  data: any;
  $: {
    Component: string | React.ComponentType<P>;
    attributes: Record<keyof P, any>;
  };
  $$Component: string | React.ComponentType<P>;
};

export function I18nBaseProxy<P extends {}>(props: I18nBaseProxyProps<P>) {
  const { $, data, ...originalProps } = props;
  let propsPatch: Partial<P> = {};

  for (const [key, value] of Object.entries($.attributes || {})) {
    const selector = value as Omit<I18nBaseFragmentProps, 'data'>;
    const result = resolveI18nValue(data, selector);

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
