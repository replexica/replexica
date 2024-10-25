import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import _ from 'lodash';
import { BucketLoader } from './_base';

export const csvLoader = (
  locale: string,
  loader: BucketLoader<void, string>
): BucketLoader<void, Record<string, any>> => ({
  async load() {
    const inputText = await loader.load();
    const input = parse(inputText, {
      columns: true,
    });
    const result: Record<string, any> = {};

    // Convert CSV rows to key-value pairs for the specified locale
    for (const row of input) {
      const key = row.id;
      if (key && row[locale]) {
        result[key] = row[locale];
      }
    }

    console.log({ input, result });

    return result;
  },

  async save(payload) {
    const inputText = await loader.load();
    const input = parse(inputText, {
      columns: true,
    });
    
    // Update or add translations for the specified locale
    const updatedRows = input.map((row: Record<string, any>) => ({
      ...row,
      [locale]: payload[row.id] || row[locale] || ''
    }));

    // Add any new keys that didn't exist before
    const existingKeys = new Set(input.map((row: Record<string, any>) => row.id));
    for (const [key, value] of Object.entries(payload)) {
      if (!existingKeys.has(key)) {
        const newRow: Record<string, string> = { id: key };
        // Initialize empty strings for all columns
        for (const column of Object.keys(input[0] || { id: '' })) {
          newRow[column] = column === locale ? value : '';
        }
        updatedRows.push(newRow);
      }
    }

    const result = stringify(updatedRows, {
      header: true
    });

    console.log({result});

    return loader.save(result);
  }
});
