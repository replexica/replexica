import { createElement } from "react";
import { I18nBaseFragmentProps, resolveI18nValue } from "./fragment";

export type I18nBaseProxyProps<P extends {}> = P & {
  data: any;
  $$Component: string | React.ComponentType<P>;
  $$Attributes: Record<keyof P, Omit<I18nBaseFragmentProps, 'data'>>;
};

export function I18nBaseProxy<P extends {}>(props: I18nBaseProxyProps<P>) {
  const { $$Attributes, $$Component, data, ...originalProps } = props;
  let propsPatch: Partial<P> = {};

  for (const [key, value] of Object.entries($$Attributes || {})) {
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
    $$Component,
    modifiedProps,
  );
}
