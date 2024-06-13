import path from "path";
import fs from "fs";
import { IBucketProcessor, BucketPayload } from "./core";
import { BaseBucketProcessor } from "./base";

export class ReplexicaBucketProcessor extends BaseBucketProcessor implements IBucketProcessor {
  protected override _validateBucketPath(bucketPath: string): void {
    if (bucketPath !== '') {
      throw new Error(`Unknown bucket path: ${bucketPath}. Replexica bucket path must be an empty string: ''.`);
    }
  }

  protected _resolveDataFilePath(locale: string): string {
    return path.resolve(process.cwd(), 'node_modules', '@replexica/translations', `${locale}.json`);
  }

  protected _deserializeData(content: string): Promise<Record<string, any>> {
    return Promise.resolve(JSON.parse(content));
  }

  protected _serializeDataContent(data: Record<string, any>): Promise<string> {
    return Promise.resolve(JSON.stringify(data, null, 2));
  }

  protected override async _loadMeta(): Promise<BucketPayload['meta']> {
    const bucketDir = path.resolve(process.cwd(), 'node_modules', '@replexica/translations');
    const metaFilePath = path.resolve(bucketDir, '.replexica.json');

    const exists = await fs.existsSync(metaFilePath);
    if (!exists) { return null; }

    const rawMeta = await fs.readFileSync(metaFilePath, 'utf8');
    const metaObj = JSON.parse(rawMeta);
    const meta = metaObj?.meta || {};

    return meta;
  }

  protected override async _saveData(locale: string, data: Record<string, any>): Promise<Record<string, any>> {
    const savedFullData = await super._saveData(locale, data); // Save full data
    await this._saveClientData(locale, savedFullData); // Save client data
    return savedFullData;
  }

  private async _saveClientData(locale: string, data: Record<string, any>): Promise<Record<string, any>> {
    const fullDataFilePath = this._resolveDataFilePath(locale);
    const clientDataFilePath = fullDataFilePath.replace('.json', '.client.json');

    const meta = await this._loadMeta();
    const newData = { ...data };

    for (const [fileId, fileData] of Object.entries(meta.files || {})) {
      const isClient = (fileData as any).isClient;

      if (!isClient) {
        delete newData[fileId];
      }
    }

    const content = await this._serializeDataContent(newData);
    await fs.writeFileSync(clientDataFilePath, content);

    return newData;
  }
}