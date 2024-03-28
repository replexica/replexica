export function getReplexicaClient() {
  const { REPLEXICA_API_KEY, REPLEXICA_HOST } = process.env;
  if (!REPLEXICA_API_KEY) {
    throw new Error('REPLEXICA_API_KEY is required');
  }

  return new Replexica({
    apiKey: REPLEXICA_API_KEY,
    host: REPLEXICA_HOST,
  });
}

export class Replexica {
  constructor(
    private params: ReplexicaInitParams,
  ) {}

  async extractLocalizableText(fileContent: string, relativePath: string): Promise<ExtractResult> {
    const response = await this.exec('/extract', {
      relativePath,
      content: fileContent,
    });
    const data = response;
    return data;
  }

  async localizeJson(params: LocalizeParams<Record<string, string>>): Promise<LocalizeResult<Record<string, string>>> {
    const response = await this.exec('/localize/json', params);
    const data = response;
    return data;
  }

  private async exec(path: string, payload: any) {
    const host = this.params.host || 'https://engine.replexica.com';
    const url = new URL(path, host);
      const response = await fetch(url.href, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.params.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const data = await response.json();
      return data;
  }
}

export type ReplexicaInitParams = {
  apiKey: string;
  host?: string;
};

export type LocalizeParams<T> = {
  groupId: string;

  triggerType: string;
  triggerName: string;

  sourceLocale: string;
  targetLocale: string;
  data: T;
};

export type LocalizeResult<T> = {
  sourceLocale: string;
  targetLocale: string;
  data: T;
}

export type ExtractResult = {
  dictionary: Record<string, string>;
  content: string;
};
