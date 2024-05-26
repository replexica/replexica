import { createElement } from "react";
import { I18nBaseChunkProps, resolveChunkValue } from "./chunk";

export type I18nBaseProxyProps<P extends {}> = P & {
  data: any;
  $$Component: string | React.ComponentType<P>;
  $$Attributes: Record<keyof P, Omit<I18nBaseChunkProps, 'data'>>;
};

export function I18nBaseProxy<P extends {}>(props: I18nBaseProxyProps<P>) {
  const { $$Attributes, $$Component, data, ...originalProps } = props;
  let propsPatch: Partial<P> = {};

  for (const [key, value] of Object.entries($$Attributes || {})) {
    const selector = value as Omit<I18nBaseChunkProps, 'data'>;
    const result = resolveChunkValue(data, selector);

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
