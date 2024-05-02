import YAML from 'yaml';
import { IBucketProcessor } from "./core.js";
import { BaseBucketProcessor } from "./base.js";

export class YamlBucketProcessor extends BaseBucketProcessor implements IBucketProcessor {
  protected override _validateBucketPath(bucketPath: string): void {
    if (!bucketPath.includes('[locale]')) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must include the [locale] placeholder.`);
    }

    const supportedExtensions = ['.yaml', '.yml'];
    if (!supportedExtensions.some((ext) => bucketPath.endsWith(ext))) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must have a ${supportedExtensions.join(' or ')} file extension.`);
    }
  }

  protected override _resolveDataFilePath(locale: string): string {
    return this.bucketPath.replace('[locale]', locale);
  }

  protected _deserializeData(content: string): Promise<Record<string, any>> {
    return YAML.parse(content);
  }

  protected _serializeDataContent(data: Record<string, any>): Promise<string> {
    return Promise.resolve(YAML.stringify(data));
  }
}
