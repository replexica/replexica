import { Builder, parseStringPromise } from "xml2js";
import { BucketLoader } from "./_base";

interface AndroidResource {
  $: {
    name: string;
  };
  _?: string;
  item?: Array<{ $?: { quantity?: string }, _: string }>;
}

interface AndroidResources {
  resources: {
    string?: AndroidResource[];
    'string-array'?: AndroidResource[];
    plurals?: AndroidResource[];
  };
}

export const androidLoader = (): BucketLoader<string, Record<string, any>> => ({
  async load(text: string) {
    try {
      const parsedResult = await parseStringPromise(text);
      const resources = parsedResult.resources;
      const result: Record<string, any> = {};

      if (Array.isArray(resources.string)) {
        resources.string.forEach((item: AndroidResource) => {
          result[item.$.name] = item._ || '';
        });
      }

      if (Array.isArray(resources['string-array'])) {
        resources['string-array'].forEach((item: AndroidResource) => {
          result[item.$.name] = item.item?.map(i => i._ || '') || [];
        });
      }

      if (Array.isArray(resources.plurals)) {
        resources.plurals.forEach((item: AndroidResource) => {
          const plurals: Record<string, string> = {};
          item.item?.forEach((i) => {
            if (i.$ && i.$.quantity) {
              plurals[i.$.quantity] = i._ || '';
            }
          });
          result[item.$.name] = plurals;
        });
      }

      return result;
    } catch (error) {
      console.error('Error parsing Android resource file:', error);
      throw new Error('Failed to parse Android resource file');
    }
  },

  async save(payload: Record<string, any>) {
    try {
      const builder = new Builder({ headless: true });
      const resources: AndroidResources = { resources: {} };

      for (const key in payload) {
        if (typeof payload[key] === 'string') {
          if (!resources.resources.string) resources.resources.string = [];
          resources.resources.string.push({ $: { name: key }, _: payload[key] });
        } else if (Array.isArray(payload[key])) {
          if (!resources.resources['string-array']) resources.resources['string-array'] = [];
          resources.resources['string-array'].push({
            $: { name: key },
            item: payload[key].map((value: string) => ({ _: value })),
          });
        } else if (typeof payload[key] === 'object') {
          if (!resources.resources.plurals) resources.resources.plurals = [];
          const pluralItems = [];
          for (const quantity in payload[key]) {
            pluralItems.push({
              $: { quantity },
              _: payload[key][quantity],
            });
          }
          resources.resources.plurals.push({
            $: { name: key },
            item: pluralItems,
          });
        }
      }

      if (resources.resources.string?.length === 0) delete resources.resources.string;
      if (resources.resources['string-array']?.length === 0) delete resources.resources['string-array'];
      if (resources.resources.plurals?.length === 0) delete resources.resources.plurals;

      return builder.buildObject(resources);
    } catch (error) {
      console.error('Error serializing Android resource file:', error);
      throw new Error('Failed to serialize Android resource file');
    }
  },
});
