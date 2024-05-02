import path from "path";
import fs from "fs";
import { IBucketProcessor, BucketTranslatorFn, BucketPayload } from "./core.js";

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
    // Currently the split is done by fileId, but as files can
    // get quite large, we might want to split by a certain number
    // of files' scopes instead.
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
    const metaObj = JSON.parse(rawMeta);
    const meta = metaObj?.meta || {};

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