import Z from 'zod';
import { localeCodeSchema } from '@replexica/spec';
import { createId } from "@paralleldrive/cuid2";

const engineParamsSchema = Z.object({
  apiKey: Z.string(),
  apiUrl: Z.string().url().default('https://engine.replexica.com'),
  batchSize: Z.number()
    .int()
    .gt(0)
    .lte(250)
    .default(25),
  idealBatchItemSize: Z
    .number()
    .int()
    .gt(0)
    .lte(2500)
    .default(200),
}).passthrough();

const payloadSchema = Z.record(
  Z.string(),
  Z.any(),
);

const localizationParamsSchema = Z.object({
  sourceLocale: localeCodeSchema,
  targetLocale: localeCodeSchema,
});

const referenceSchema = Z.record(
  localeCodeSchema,
  payloadSchema,
);

/**
 * ReplexicaEngine class for interacting with the Replexica API
 */
export class ReplexicaEngine {
  private config: Z.infer<typeof engineParamsSchema>;

  /**
   * Create a new ReplexicaEngine instance
   * @param config - Configuration options for the Engine
   */
  constructor(
    config: Partial<Z.infer<typeof engineParamsSchema>>,
  ) {
    this.config = engineParamsSchema.parse(config);
  }

  /**
   * Localize content using the Replexica API
   * @param payload - The content to be localized
   * @param params - Localization parameters
   * @param progressCallback - Optional callback function to report progress
   * @returns Localized content
   */
  async _localizeRaw(
    payload: Z.infer<typeof payloadSchema>,
    params: Z.infer<typeof localizationParamsSchema>,
    reference?: Z.infer<typeof referenceSchema>,
    progressCallback?: (progress: number) => void
  ): Promise<Record<string, string>> {
    const finalPayload = payloadSchema.parse(payload);
    const finalParams = localizationParamsSchema.parse(params);

    const chunkedPayload = this.extractPayloadChunks(finalPayload);
    const processedPayloadChunks: Record<string, string>[] = [];

    const workflowId = createId()
    for (let i = 0; i < chunkedPayload.length; i++) {
      const chunk = chunkedPayload[i];
      const percentageCompleted = Math.round(((i + 1) / chunkedPayload.length) * 100);

      if (progressCallback) {
        progressCallback(percentageCompleted);
      }

      const processedPayloadChunk = await this.localizeChunk(
        finalParams.sourceLocale,
        finalParams.targetLocale,
        { data: chunk, reference },
        workflowId,
      );
      processedPayloadChunks.push(processedPayloadChunk);
    }

    return Object.assign({}, ...processedPayloadChunks);
  }

  /**
   * Localize a single chunk of content
   * @param sourceLocale - Source locale
   * @param targetLocale - Target locale
   * @param payload - Payload containing the chunk to be localized
   * @returns Localized chunk
   */
  private async localizeChunk(
    sourceLocale: string,
    targetLocale: string,
    payload: { data: any; reference: any; },
    workflowId: string,
  ): Promise<Record<string, string>> {
    const res = await fetch(`${this.config.apiUrl}/i18n`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        params: { workflowId },
        locale: {
          source: sourceLocale,
          target: targetLocale,
        },
        data: payload.data,
        reference: payload.reference,
      }, null, 2),
    });

    if (!res.ok) {
      if (res.status === 400) {
        throw new Error(`Invalid request: ${res.statusText}`);
      } else {
        const errorText = await res.text();
        throw new Error(errorText);
      }
    }

    const jsonResponse = await res.json();
    return jsonResponse.data || {};
  }

  /**
   * Extract payload chunks based on the ideal chunk size
   * @param payload - The payload to be chunked
   * @returns An array of payload chunks
   */
  private extractPayloadChunks(payload: Record<string, string>): Record<string, string>[] {
    const result: Record<string, string>[] = [];
    let currentChunk: Record<string, string> = {};
    let currentChunkItemCount = 0;

    const payloadEntries = Object.entries(payload);
    for (let i = 0; i < payloadEntries.length; i++) {
      const [key, value] = payloadEntries[i];
      currentChunk[key] = value;
      currentChunkItemCount++;

      const currentChunkSize = this.countWordsInRecord(currentChunk);
      if (currentChunkSize > this.config.idealBatchItemSize ||
        currentChunkItemCount >= this.config.batchSize ||
        i === payloadEntries.length - 1
      ) {
        result.push(currentChunk);
        currentChunk = {};
        currentChunkItemCount = 0;
      }
    }

    return result;
  }

  /**
   * Count words in a record or array
   * @param payload - The payload to count words in
   * @returns The total number of words
   */
  private countWordsInRecord(payload: any | Record<string, any> | Array<any>): number {
    if (Array.isArray(payload)) {
      return payload.reduce((acc, item) => acc + this.countWordsInRecord(item), 0);
    } else if (typeof payload === 'object' && payload !== null) {
      return Object.values(payload).reduce((acc: number, item) => acc + this.countWordsInRecord(item), 0);
    } else if (typeof payload === 'string') {
      return payload.trim().split(/\s+/).filter(Boolean).length;
    } else {
      return 0;
    }
  }

  /**
   * Localize a typical JavaScript object
   * @param obj - The object to be localized
   * @param params - Localization parameters
   * @param progressCallback - Optional callback function to report progress
   * @returns Localized object
   */
  async localizeObject(
    obj: Record<string, any>,
    params: Z.infer<typeof localizationParamsSchema>,
    progressCallback?: (progress: number) => void
  ): Promise<Record<string, any>> {
    return this._localizeRaw(obj, params, undefined, progressCallback);
  }

  /**
   * Localize a text document
   * @param textDocument - The text to be localized
   * @param params - Localization parameters
   * @param progressCallback - Optional callback function to report progress
   * @returns Localized text
   */
  async localizeDocument(
    textDocument: string,
    params: Z.infer<typeof localizationParamsSchema>,
    progressCallback?: (progress: number) => void
  ): Promise<string> {
    const localized = await this._localizeRaw({ text: textDocument }, params, undefined, progressCallback);
    return localized.text || '';
  }

  /**
   * Localize a chat sequence
   * @param chat - The chat sequence to be localized
   * @param params - Localization parameters
   * @param progressCallback - Optional callback function to report progress
   * @returns Localized chat sequence
   */
  async localizeChat(
    chat: Array<{ name: string; text: string }>,
    params: Z.infer<typeof localizationParamsSchema>,
    progressCallback?: (progress: number) => void
  ): Promise<Array<{ name: string; text: string }>> {

    const localized = await this._localizeRaw({ chat }, params, undefined, progressCallback);

    return Object.entries(localized).map(([key, value]) => ({
      name: chat[parseInt(key.split('_')[1])].name,
      text: value,
    }));
  }
}
