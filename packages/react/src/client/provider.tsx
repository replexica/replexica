"use client";

import { I18nInstance } from "../shared";
import { I18nContext } from "./context";

export type I18nProviderProps = {
  i18n: I18nInstance;
  children?: React.ReactNode;
};

export function I18nProvider(props: I18nProviderProps) {
  return <I18nContext.Provider value={props.i18n} children={props.children} />;
}
