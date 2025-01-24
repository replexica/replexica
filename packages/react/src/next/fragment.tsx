import { I18nBaseFragmentProps, I18nBaseFragment, I18nInstance } from "../shared";

export type I18nFragmentProps = Omit<I18nBaseFragmentProps, "data"> & {
  loadI18n: () => Promise<I18nInstance>;
};

export async function I18nFragment(props: I18nFragmentProps) {
  const i18n = await props.loadI18n();

  return <I18nBaseFragment data={i18n.data} fileId={props.fileId} scopeId={props.scopeId} chunkId={props.chunkId} />;
}
