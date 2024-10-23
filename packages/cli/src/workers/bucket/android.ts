import { parseStringPromise, Builder } from 'xml2js';
import { BucketLoader } from './_base';
import { ReplexicaCLIError } from '../../utils/errors';

interface AndroidResource {
  $: {
    name: string;
    [key: string]: string;
  };
  _?: string;
  item?: Array<{ $?: { quantity?: string }, _: string } | string>;
}

interface AndroidResources {
  resources: {
    string?: AndroidResource[];
    'string-array'?: AndroidResource[];
    plurals?: AndroidResource[];
    bool?: AndroidResource[];
    integer?: AndroidResource[];
  };
}

export const androidLoader = (): BucketLoader<string, Record<string, any>> => ({
  async load(text: string) {
    try {
      const result: Record<string, any> = {};
      const parsed: AndroidResources = await parseStringPromise(text, { explicitArray: true });
      
      if (!parsed || !parsed.resources) {
        console.warn('No resources found in the Android resource file');
        return result;
      }

      const processResource = (resourceType: string) => {
        const resources = parsed.resources[resourceType as keyof AndroidResources['resources']];
        if (!resources) return;

        resources.forEach((item: AndroidResource) => {
          if (resourceType === 'string') {
            result[item.$.name] = item._ || '';
          } else if (resourceType === 'string-array') {
            result[item.$.name] = (item.item || []).map((subItem: any) => {
              if (typeof subItem === 'string') return subItem;
              return subItem._ || '';
            }).filter(Boolean);  // Remove any empty strings
          } else if (resourceType === 'plurals') {
            const pluralObj: Record<string, string> = {};
            if (Array.isArray(item.item)) {
              item.item.forEach((subItem: any) => {
                if (subItem.$ && subItem.$.quantity) {
                  pluralObj[subItem.$.quantity] = subItem._ || '';
                }
              });
            }
            result[item.$.name] = pluralObj;
          } else if (resourceType === 'bool') {
            result[item.$.name] = item._ === 'true';
          } else if (resourceType === 'integer') {
            result[item.$.name] = parseInt(item._ || '0', 10);
          }
        });
      };

      ['string', 'string-array', 'plurals', 'bool', 'integer'].forEach(processResource);

      return result;
    } catch (error) {
      console.error('Error parsing Android resource file:', error);
      throw new ReplexicaCLIError({
        message: 'Failed to parse Android resource file',
        docUrl: "androidResouceError"
      });
    }
  },

  async save(payload: Record<string, any>) {
    const builder = new Builder();
    const xmlObj: AndroidResources = { resources: {} };

    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'string') {
        if (!xmlObj.resources.string) xmlObj.resources.string = [];
        xmlObj.resources.string.push({ $: { name: key }, _: value });
      } else if (Array.isArray(value)) {
        if (!xmlObj.resources['string-array']) xmlObj.resources['string-array'] = [];
        xmlObj.resources['string-array'].push({
          $: { name: key },
          item: value.map(item => ({ _: item }))
        });
      } else if (typeof value === 'object') {
        if (!xmlObj.resources.plurals) xmlObj.resources.plurals = [];
        xmlObj.resources.plurals.push({
          $: { name: key },
          item: Object.entries(value).map(([quantity, text]) => ({
            $: { quantity },
            _: text as string
          }))
        });
      } else if (typeof value === 'boolean') {
        if (!xmlObj.resources.bool) xmlObj.resources.bool = [];
        xmlObj.resources.bool.push({ $: { name: key }, _: value.toString() });
      } else if (typeof value === 'number') {
        if (!xmlObj.resources.integer) xmlObj.resources.integer = [];
        xmlObj.resources.integer.push({ $: { name: key }, _: value.toString() });
      }
    }

    return builder.buildObject(xmlObj);
  }
});
