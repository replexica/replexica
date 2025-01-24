import { I18nInstance } from "./types";

export type I18nBaseFragmentProps = I18nIdParams & {
  data: any;
};

export function I18nBaseFragment(props: I18nBaseFragmentProps) {
  const value = resolveI18nValue(props.data, {
    fileId: props.fileId,
    scopeId: props.scopeId,
    chunkId: props.chunkId,
  });

  return ` ${value} `;
}

export type I18nIdParams = {
  fileId: string;
  scopeId: string;
  chunkId: string;
};

export function resolveI18nValue(data: I18nInstance["data"], selector: I18nIdParams) {
  const { fileId, scopeId, chunkId } = selector;
  const key = [fileId, scopeId, chunkId].join("#");

  const text = data?.[key];
  const fallback = key;

  return text || fallback;
}
