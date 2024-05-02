import { IBucketProcessor } from "./core.js";
import { BaseBucketProcessor } from "./base.js";
import _ from 'lodash';
import objectHash from 'object-hash';

export class MarkdownBucketProcessor extends BaseBucketProcessor implements IBucketProcessor {
  protected override _validateBucketPath(bucketPath: string): void {
    if (!bucketPath.includes('[lang]')) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must include the [lang] placeholder.`);
    }
    if (!bucketPath.endsWith('.md')) {
      throw new Error(`Invalid bucket path: ${bucketPath}. The path must have a .md file extension.`);
    }
  }

  protected override _resolveDataFilePath(locale: string): string {
    return this.bucketPath.replace('[lang]', locale);
  }

  protected override async _deserializeData(content: string): Promise<Record<string, any>> {
    const result = _.chain(content)
      .split('\n\n')
      .map((content, index) => [objectHash({ content, index }), content])
      .fromPairs()
      .value();
    
    return result;
  }

  protected override async _serializeDataContent(data: Record<string, any>): Promise<string> {
    return _.values(data).join('\n\n');
  }
}
