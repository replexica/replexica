import { createElement } from "react";
import { I18nInstance } from "./types";

export type I18nBaseFragmentProps = {
  id: string;
  i18n: I18nInstance;
  component: string | null | React.ComponentType;
  localizableAttributes?: string[];
  attributes: Record<string, any>;
  children?: React.ReactNode;
};

export function I18nBaseFragment(props: I18nBaseFragmentProps) {
  const text = props.i18n.data[props.id];

  return props.component
    ? createElement(props.component, props.attributes, text)
    : text;
}