import path from 'path';
import fs from 'fs';

import { I18nScope } from "./iom";

export class FakeI18nServer {
  pushQueue: Promise<any>[] = [];
  pullQueue: Promise<any>[] = [];

  iomChunks: Record<string, I18nScope> = {};

  async pushIomChunk(entryId: string, fileLabel: string, payload: I18nScope) {
    // wait for 1 second to simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.iomChunks[entryId] = payload;

    const fileName = path.resolve(process.cwd(), 'node_modules/@replexica/.cache', `.json`);
    fs.writeFileSync(
      fileName,
      JSON.stringify(this.iomChunks, null, 2),
    )
  }

  async pullLocaleData(locale: string) {
    return this._executeWithQueue(
      this.pushQueue,
      this.pullQueue,
      async () => {
        // wait for 2 seconds to simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const result: Record<string, string> = {};
        for (const [entryId, scope] of Object.entries(this.iomChunks)) {
          const dictionary = _extractDictionary(entryId, scope);
          Object.assign(result, dictionary);
        }

        return result;
      },
    )
  }

  private async _executeWithQueue(
    blockingQueue: Promise<any>[],
    currentQueue: Promise<any>[],
    callback: () => Promise<any>
  ) {
    await Promise.all(blockingQueue);

    const promise = callback();
    currentQueue.push(promise);

    const result = await promise;

    const index = currentQueue.indexOf(promise);
    currentQueue.splice(index, 1);

    return result;
  }
}

function _extractDictionary(entryId: string, scope: I18nScope) {
  const dictionary: Record<string, string> = {};

  for (const fragment of scope.fragments) {
    const key = [
      entryId,
      scope.data.id,
      fragment.data.id,
    ].join('#');

    dictionary[key] = fragment.data.value;
  }

  for (const childScope of scope.scopes) {
    const childDictionary = _extractDictionary(entryId, childScope);
    Object.assign(dictionary, childDictionary);
  }

  return dictionary;
}
