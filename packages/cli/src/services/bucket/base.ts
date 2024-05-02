import _ from "lodash";
import fs from 'fs';
import { BucketPayload, BucketTranslatorFn, IBucketProcessor } from "./core.js";

export abstract class BaseBucketProcessor implements IBucketProcessor {
  constructor(
    protected bucketPath: string,
    private translator: BucketTranslatorFn,
  ) {
    this._validateBucketPath(bucketPath);
  }

  async load(locale: string): Promise<BucketPayload> {
    const [
      data,
      meta,
    ] = await Promise.all([
      this._loadData(locale),
      this._loadMeta(),
    ]);

    const rawResult = { data, meta };
    const result = await this._postLoad(rawResult, locale);
    return result;
  }

  async translate(payload: BucketPayload, sourceLocale: string, targetLocale: string): Promise<BucketPayload> {
    // The data contains key-value pairs, so let's translate
    // the values in batches of 20 keys max.
    const resultData: Record<string, any> = {};

    const keys = Object.keys(payload.data);
    const batches = _.chunk(keys, 20);
    for (const batch of batches) {
      const partialData = _.pick(payload.data, batch);
      const partialPayload = { data: partialData, meta: payload.meta };
      const partialResult = await this.translator(sourceLocale, targetLocale, partialPayload);
      _.merge(resultData, partialResult);
    }
    
    const result = { data: resultData, meta: payload.meta };
    return result;
  }

  async save(locale: string, rawPayload: BucketPayload): Promise<BucketPayload> {
    const payload = await this._preSave(rawPayload, locale);

    await this._saveData(locale, payload.data);

    return payload;
  }

  protected async _postLoad(payload: BucketPayload, locale: string): Promise<BucketPayload> {
    return payload;
  }

  protected async _preSave(payload: BucketPayload, locale: string): Promise<BucketPayload> {
    return payload;
  }
  
  protected async _loadData(locale: string): Promise<Record<string, any>> {
    const filePath = this._resolveDataFilePath(locale);
    const exists = await fs.existsSync(filePath);
    if (!exists) { return {}; }

    const rawContent = await fs.readFileSync(filePath, 'utf8');
    const data = await this._deserializeData(rawContent);
    return data;
  }

  protected async _loadMeta(): Promise<Record<string, any> | null> {
    return null;
  }

  protected async _saveData(locale: string, data: Record<string, any>): Promise<Record<string, any>> {
    const filePath = this._resolveDataFilePath(locale);
    const content = await this._serializeDataContent(data);
    await fs.writeFileSync(filePath, content);
    return data;
  }

  protected _validateBucketPath(bucketPath: string): void {
    // noop
  }

  protected abstract _deserializeData(content: string): Promise<Record<string, any>>;

  protected abstract _serializeDataContent(data: Record<string, any>): Promise<string>;

  protected abstract _resolveDataFilePath(locale: string): string;
}
