import { ILoader } from "./_types";
import { createLoader } from "./_utils";

const {
  DATO_API_TOKEN = '',
} = process.env;

export default function createDatoLoader(projectId: string): ILoader<void, Record<string, any>> {
  return createLoader({
    // Must get the data from the DatoCMS API and return it as a JSON object
    pull: async (locale) => {
      // TODO
      return {};
    },
    // Must accept a JSON object and upload it to DatoCMS
    push: async (locale, data, originalInput) => {
      // TODO
    },
  });
}
