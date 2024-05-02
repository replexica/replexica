import path from 'path';
import fs from 'fs';

export function createBucketProcessor(bucketType: string, bucketPath: string, translator: BucketTranslatorFn) {
  switch (bucketType) {
    default: throw new Error(`Unknown bucket type: ${bucketType}`);
    case 'replexica': return new ReplexicaBucketProcessor(bucketPath, translator);
  }
}

export type BucketPayload = {
  data: Record<string, any>;
  meta: any;
};

export type BucketTranslatorFn = {
  (sourceLocale: string, targetLocale: string, data: BucketPayload['data'], meta: BucketPayload['meta']): Promise<BucketPayload['data']>;
}

export interface IBucketProcessor {
  load(locale: string): Promise<BucketPayload>;
  translate(payload: BucketPayload, sourceLocale: string, targetLocale: string): Promise<BucketPayload['data']>;
  save(locale: string, data: BucketPayload['data']): Promise<void>;
}

export class ReplexicaBucketProcessor implements IBucketProcessor {
  constructor(
    private bucketPath: string,
    private translator: BucketTranslatorFn,
  ) {
    if (bucketPath !== '') {
      throw new Error(`Unknown bucket path: ${bucketPath}. Replexica bucket path must be an empty string: ''.`);
    }
  }

  async load(locale: string): Promise<BucketPayload> {
    const [
      meta,
      data,
    ] = await Promise.all([
      this._loadMeta(),
      this._loadData(locale),
    ]);

    return { data, meta };
  }

  async translate(payload: BucketPayload, sourceLocale: string, targetLocale: string): Promise<BucketPayload> {
    const resultData: any = {};
    for (const [fileId, fileData] of Object.entries(payload.data)) {
      const partialLocaleData = { [fileId]: fileData };
      const partialResult = await this.translator(
        sourceLocale,
        targetLocale,
        partialLocaleData,
        payload.meta,
      );
      resultData[fileId] = partialResult.data[fileId];
    }

    return {
      data: resultData,
      meta: payload.meta,
    };
  }

  async save(locale: string, payload: BucketPayload): Promise<void> {
    await Promise.all([
      this._saveFullData(locale, payload),
      this._saveClientData(locale, payload),
    ]);
  }

  private async _loadMeta(): Promise<BucketPayload['meta']> {
    const bucketDir = path.resolve(process.cwd(), 'node_modules', '@replexica/translations');
    const metaFilePath = path.resolve(bucketDir, '.replexica.json');

    const exists = await fs.existsSync(metaFilePath);
    if (!exists) { return null; }

    const rawMeta = await fs.readFileSync(metaFilePath, 'utf8');
    const meta = JSON.parse(rawMeta);

    return meta;
  }

  private async _loadData(locale: string): Promise<BucketPayload['data']> {
    const bucketDir = path.resolve(process.cwd(), 'node_modules', '@replexica/translations');
    const dataFilePath = path.resolve(bucketDir, `${locale}.json`);

    const exists = await fs.existsSync(dataFilePath);
    if (!exists) { return {}; }

    const rawData = await fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(rawData);

    return data;
  }

  private async _saveFullData(locale: string, payload: BucketPayload): Promise<void> {
    const bucketDir = path.resolve(process.cwd(), 'node_modules', '@replexica/translations');
    const dataFilePath = path.resolve(bucketDir, `${locale}.json`);

    const content = JSON.stringify(payload.data, null, 2);
    await fs.writeFileSync(dataFilePath, content);
  }

  private async _saveClientData(locale: string, payload: BucketPayload): Promise<void> {
    const bucketDir = path.resolve(process.cwd(), 'node_modules', '@replexica/translations');
    const dataFilePath = path.resolve(bucketDir, `${locale}.client.json`);

    const newData = {
      ...payload.data,
    };

    for (const [fileId, fileData] of Object.entries(payload.meta.files || {})) {
      const isClient = (fileData as any).isClient;

      if (!isClient) {
        delete newData[fileId];
      }
    }

    const content = JSON.stringify(newData, null, 2);
    await fs.writeFileSync(dataFilePath, content);
  }
}
