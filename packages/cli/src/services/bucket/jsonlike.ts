import _ from "lodash";
import fs from 'fs';
import { BucketPayload, BucketTranslatorFn, IBucketProcessor } from "./core.js";

export abstract class JsonLikeBucketProcessor implements IBucketProcessor {
  constructor(
    private bucketPath: string,
    private translator: BucketTranslatorFn,
  ) {
    if (!bucketPath.includes('[lang]')) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must include the [lang] placeholder.`);
    }
    if (!bucketPath.endsWith('.json')) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must have a .json file extension.`);
    }
  }

  async load(locale: string): Promise<BucketPayload> {
    const filePath = this.bucketPath.replace('[lang]', locale);
    const exists = await fs.existsSync(filePath);
    if (!exists) { return { data: {}, meta: null }; }

    const rawContent = await fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawContent);

    return {
      data,
      meta: null,
    };
  }

  async translate(payload: BucketPayload, sourceLocale: string, targetLocale: string): Promise<Record<string, any>> {
    // The data contains key-value pairs, so let's translate
    // the values in batches of 20 keys max.
    const resultData: Record<string, any> = {};

    const keys = Object.keys(payload.data);
    const batches = _.chunk(keys, 20);
    for (const batch of batches) {
      const partialData = _.pick(payload.data, batch);
      const partialResult = await this.translator(sourceLocale, targetLocale, partialData, payload.meta);
      _.merge(resultData, partialResult);
    }
    
    return resultData;
  }

  async save(locale: string, data: Record<string, any>): Promise<void> {
    const filePath = this.bucketPath.replace('[lang]', locale);
    const content = JSON.stringify(data, null, 2);
    await fs.writeFileSync(filePath, content);
  }
}
