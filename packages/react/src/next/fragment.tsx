'use server';

import { I18nInstance, I18nBaseFragment, I18nBaseFragmentProps  } from "../shared";

export type I18nFragmentProps = Omit<I18nBaseFragmentProps, 'i18n'> & {
  loadI18n: () => Promise<I18nInstance>;
};

export async function I18nFragment(props: I18nFragmentProps) {
  const { loadI18n, ...otherProps } = props;
  const i18n = await loadI18n();

  return <I18nBaseFragment {...otherProps} i18n={i18n} />;
}