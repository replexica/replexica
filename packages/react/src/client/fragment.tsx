'use client';

import { I18nBaseFragmentProps, I18nBaseFragment } from "../shared";
import { useI18n } from "./context";

export type I18nFragmentProps = Omit<I18nBaseFragmentProps, 'data'>;

export function I18nFragment(props: I18nFragmentProps) {
  const i18n = useI18n();

  return (
    <I18nBaseFragment
      data={i18n.data}
      fileId={props.fileId}
      scopeId={props.scopeId}
      chunkId={props.chunkId}
    />
  );
}
