import { createElement } from "react";
import { ReplexicaBaseChunkProps, resolveChunkValue } from "./chunk";

export type ReplexicaBaseProxyProps<P extends {}> = P & {
  data: any;
  _ReplexicaComponent: string | React.ComponentType<P>;
  _ReplexicaAttributes: Record<keyof P, Omit<ReplexicaBaseChunkProps, 'data'>>;
};

export function ReplexicaBaseProxy<P extends {}>(props: ReplexicaBaseProxyProps<P>) {
  const { _ReplexicaAttributes, _ReplexicaComponent, data, ...originalProps } = props;
  let propsPatch: Partial<P> = {};

  for (const [key, value] of Object.entries(_ReplexicaAttributes || {})) {
    const selector = value as Omit<ReplexicaBaseChunkProps, 'data'>;
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
    _ReplexicaComponent,
    modifiedProps,
  );
}
