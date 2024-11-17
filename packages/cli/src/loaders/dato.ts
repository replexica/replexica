import { ILoader } from "./_types";
import { createLoader } from "./_utils";
import { buildClient } from '@datocms/cma-client-node';

export function createDatoApiLoader(projectId: string, postId: string): ILoader<void, Record<string, any>> {
  const { DATO_API_TOKEN = '' } = process.env;
  const client = buildClient({ apiToken: DATO_API_TOKEN });

  return createLoader({
    async pull(locale) {
      return findPost(postId);
    },
    async push(locale, data, originalInput) {
      // TODO
    }
  });

  async function findPost(id: string): Promise<Record<string, any>> {
    // TODO
    return {};
  }

  async function updatePost(id: string, data: any) {
    // TODO
  }
}

export function createDatoLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    // Must get the data from the DatoCMS API and return it as a JSON object
    pull: async (locale, input) => {
      return {};
    },
    // Must accept a JSON object and upload it to DatoCMS
    push: async (locale, data, originalInput) => {
      return {};
    },
  });
}
