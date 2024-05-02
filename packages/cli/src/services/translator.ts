import { createId } from "@paralleldrive/cuid2";

export type TranslatorFn = {
  (sourceLocale: string, targetLocale: string, data: Record<string, any>, meta: any): Promise<Record<string, any>>;
};

export type CreateTranslatorOptions = {
  apiUrl: string;
  apiKey: string;
  skipCache: boolean;
  cacheOnly: boolean;
};

export function createTranslator(options: CreateTranslatorOptions): TranslatorFn {
  return async (sourceLocale, targetLocale, data, meta) => {
    const workflowId = createId();
    const res = await fetch(`${options.apiUrl}/i18n`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        params: {
          workflowId,
          cacheOnly: options.cacheOnly,
          skipCache: options.skipCache,
        },
        locale: {
          source: sourceLocale,
          target: targetLocale,
        },
        meta,
        data,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const payload = await res.json();

    return payload;
  };
}
