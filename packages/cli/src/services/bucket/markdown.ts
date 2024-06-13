import { IBucketProcessor } from "./core";
import { BaseBucketProcessor } from "./base";
import _ from 'lodash';

export class MarkdownBucketProcessor extends BaseBucketProcessor implements IBucketProcessor {
  protected override _validateBucketPath(bucketPath: string): void {
    if (!bucketPath.includes('[locale]')) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must include the [locale] placeholder.`);
    }
    if (!bucketPath.endsWith('.md')) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must have a .md file extension.`);
    }
  }

  protected override _resolveDataFilePath(locale: string): string {
    return this.bucketPath.replace('[locale]', locale);
  }

  protected override async _deserializeData(content: string): Promise<Record<string, any>> {
    return { '': content };
  }

  protected override async _serializeDataContent(data: Record<string, any>): Promise<string> {
    return data[''];
  }
}
