export type LangDataType = 'json' | 'xcode' | 'yaml' | 'yaml-root-key' | 'markdown';

export type LangDataNode = {
  [key: string]: string | LangDataNode;
};

export interface ILangDataProcessor {
  loadLangJson(path: string, lang: string): Promise<Record<string, string>>;
  saveLangJson(path: string, lang: string, langData: Record<string, string>): Promise<void>;
}

export abstract class BaseLangDataProcessor {
  protected abstract validatePath(path: string, lang: string): Promise<void | never>;

  protected async preflatten(langData: LangDataNode, lang: string): Promise<LangDataNode> {
    return langData;
  }

  protected async flatten(langData: LangDataNode, lang: string): Promise<Record<string, string>> {
    const flat = await import('flat');
    const preparedLangData = await this.preflatten(langData, lang);
    const result = flat.flatten<LangDataNode, Record<string, string>>(preparedLangData, {
      delimiter: '/',
      transformKey: (key) => encodeURIComponent(key),
    });

    return result;
  }

  protected async postunflatten(record: LangDataNode, lang: string): Promise<LangDataNode> {
    return record;
  }

  protected async unflatten(record: Record<string, string>, lang: string): Promise<LangDataNode> {
    const flat = await import('flat');
    const rawResult = flat.unflatten<Record<string, string>, LangDataNode>(record, {
      delimiter: '/',
      transformKey: (key) => decodeURIComponent(key),
    });
    const result = await this.postunflatten(rawResult, lang);

    return result;
  }
}