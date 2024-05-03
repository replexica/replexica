import { IBucketProcessor } from "./core.js";
import { BaseBucketProcessor } from "./base.js";

export class JsonBucketProcessor extends BaseBucketProcessor implements IBucketProcessor {
  protected override _validateBucketPath(bucketPath: string): void {
    if (!bucketPath.includes('[locale]')) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must include the [locale] placeholder.`);
    }
    if (!bucketPath.endsWith('.json')) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must have a .json file extension.`);
    }
  }

  protected override _resolveDataFilePath(locale: string): string {
    return this.bucketPath.replace('[locale]', locale);
  }

  protected override async _deserializeData(content: string): Promise<Record<string, any>> {
    return JSON.parse(content);
  }

  protected override async _serializeDataContent(data: Record<string, any>): Promise<string> {
    return JSON.stringify(data, null, 2);
  }
}
