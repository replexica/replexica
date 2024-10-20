import { BucketLoader } from './_base';

export const flutterLoader = (
  locale: string
): BucketLoader<Record<string, any>, Record<string, any>> => ({
  async load(input: Record<string, any>) {
    const resultData: Record<string, any> = {};

    for (const [key, value] of Object.entries(input)) {
      if (key === "@@locale") continue; // Skip metadata
      resultData[key] = value;
    }

    return resultData;
  },

  async save(payload: Record<string, any>) {
    const resultData: Record<string, any> = {
      "@@locale": locale
    };

    for (const [key, value] of Object.entries(payload)) {
      resultData[key] = value;
    }

    return resultData;
  }
});
