import { IBucketProcessor } from "./core";
import { YamlBucketProcessor } from './yaml';

export class YamlRootKeyBucketProcessor extends YamlBucketProcessor implements IBucketProcessor {
  protected override async _loadData(locale: string): Promise<Record<string, any>> {
    const data = await super._loadData(locale);
    return data[locale];
  }

  protected override async _saveData(locale: string, data: Record<string, any>): Promise<Record<string, any>> {
    const finalData = { [locale]: data };
    const result = await super._saveData(locale, finalData);
    return result;
  }
}
