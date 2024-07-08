import { createId } from "@paralleldrive/cuid2";

export type CreateTranslatorOptions = {
  apiUrl: string;
  apiKey: string;
};

export function createEngine(options: CreateTranslatorOptions) {
  return {
    async localize(sourceLocale: string, targetLocale: string, payload: { data: any; meta: any; }) {
      const workflowId = createId();
      const res = await fetch(`${options.apiUrl}/i18n`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          params: { workflowId },
          locale: {
            source: sourceLocale,
            target: targetLocale,
          },
          meta: payload.meta,
          data: payload.data,
        }, null, 2),
      });

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error(`Invalid request: ${res.statusText}`);
        } else {
          const errorText = await res.text();
          throw new Error(errorText);
        }
      }

      const jsonResponse = await res.json();
      const result = jsonResponse.data || null;
      return result;
    },
  };
}
