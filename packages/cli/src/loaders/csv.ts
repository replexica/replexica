import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import _ from "lodash";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createCsvLoader(): ILoader<
  string,
  Record<string, string>
> {
  return createLoader({
    async pull(locale, _input) {
      const input = parse(_input, {
        columns: true,
      });

      const result: Record<string, string> = {};

      // Convert CSV rows to key-value pairs for the specified locale
      _.forEach(input, (row) => {
        const key = row.id;
        if (key && row[locale]) {
          result[key] = row[locale];
        }
      });

      return result;
    },
    async push(locale, data, originalInput) {
      const input = parse(originalInput || "", { columns: true }) as Record<
        string,
        any
      >[];
      const columns = Object.keys(input[0] || { id: "" });

      // Update existing rows and collect new keys
      const updatedRows = input.map((row) => ({
        ...row,
        [locale]: data[row.id] || row[locale] || "",
      }));
      const existingKeys = new Set(input.map((row) => row.id));

      // Add new keys
      Object.entries(data).forEach(([key, value]) => {
        if (!existingKeys.has(key)) {
          updatedRows.push({
            id: key,
            ...Object.fromEntries(
              columns.map((column) => [column, column === locale ? value : ""]),
            ),
          });
        }
      });

      return stringify(updatedRows, { header: true });
    },
  });
}
