import path from "path";
import _, { has } from "lodash";
import fs from "fs";
import JSON5 from "json5";
import createOra from "ora";
import { composeLoaders } from "../_utils";
import { DastDocumentNode, datoConfigSchema, DatoRecordPayload, DatoValue } from "./_base";
import { buildClient } from "@datocms/cma-client-node";
import { ILoader } from "../_types";
import { createLoader } from "../_utils";

export default function createDatoLoader(configFilePath: string) {
  try {
    const configContent = fs.readFileSync(configFilePath, "utf-8");
    const datoConfig = datoConfigSchema.parse(JSON5.parse(configContent));

    return composeLoaders(createDatoApiLoader(datoConfig), createDatoCleanupLoader(datoConfig), createDatoStructureLoader(datoConfig));
  } catch (error: any) {
    throw new Error([`Failed to parse DatoCMS config file.`, `Error: ${error.message}`].join("\n\n"));
  }
}

export type DatoApiLoaderParams = {
  project: string;
  model: string;
  fields: string[];
  records: string[];
};

export function createDatoApiLoader(params: DatoApiLoaderParams): ILoader<void, Record<string, DatoRecordPayload>> {
  return createLoader({
    async pull(locale) {
      const ora = createOra({ indent: 4, prefixText: `[${locale}] ` });
      const dato = createDatoClient({
        apiKey: process.env.DATO_API_TOKEN || "",
        projectId: params.project,
        modelId: params.model,
        records: params.records,
        fields: params.fields,
      });

      ora.start(`Syncing with DatoCMS...`);
      const zeroestRecord = await dato.findRecords(1).then((records) => records[0]);
      if (!zeroestRecord) {
        throw new Error(`No records found for ${params.model}.`);
      }
      ora.succeed(`DatoCMS sync completed.`);

      const unconfiguredFields = params.fields.filter((field) => !zeroestRecord[field]?.hasOwnProperty("en"));

      if (unconfiguredFields.length) {
        ora.start(`Enabling localization for fields: ${unconfiguredFields.join(", ")}...`);
        for (const field of unconfiguredFields) {
          await dato.enableFieldLocalization(field);
        }
        ora.succeed(`Localization enabled for fields: ${unconfiguredFields.join(", ")}`);
      }

      const records = await dato.findRecords();
      const result: Record<string, DatoRecordPayload> = {};
      for (const record of records) {
        result[record.id] = record as DatoRecordPayload;
      }

      return result;
    },
    async push(locale, data) {
      const ora = createOra({ indent: 4, prefixText: `[${locale}] ` });
      const dato = createDatoClient({
        apiKey: process.env.DATO_API_TOKEN || "",
        projectId: params.project,
        modelId: params.model,
        records: params.records,
        fields: params.fields,
      });

      for (const record of Object.values(data)) {
        ora.start(`Updating record ${record.id}...`);
        await dato.updateRecord(record.id as any as string, record as any);
        ora.succeed(`Updated record ${record.id}.`);
      }
    },
  });
}

export type DatoCleanupLoaderParams = {
  fields: string[];
};

export function createDatoCleanupLoader(
  params: DatoCleanupLoaderParams,
): ILoader<Record<string, DatoRecordPayload>, Record<string, Record<string, DatoValue>>> {
  return createLoader({
    async pull(locale, input) {
      const result: Record<
        // Record ID
        string,
        // Record fields
        Record<
          // Field ID
          string,
          // Field value
          DatoValue
        >
      > = {};

      for (const [recordId, record] of Object.entries(input)) {
        result[recordId] = {};
        for (const [fieldName, fieldValue] of Object.entries(record)) {
          if (!params.fields.includes(fieldName)) {
            continue;
          }

          result[recordId][fieldName] = fieldValue[locale];
        }
      }

      return result;
    },
    async push(locale, data, originalInput = {}) {
      const originalInputCopy: Record<string, DatoRecordPayload> = _.cloneDeep(originalInput) || {};

      console.log(
        JSON.stringify(
          {
            originalInputCopy,
            data,
          },
          null,
          2,
        ),
      );

      for (const [recordId, originalRecord] of Object.entries(originalInputCopy)) {
        const localizableOriginalRecord = _.pickBy(originalRecord, (value, fieldId) => params.fields.includes(fieldId));
        for (const [fieldId, originalFieldValueMap] of Object.entries(localizableOriginalRecord)) {
          const originalValue = originalInputCopy[recordId][fieldId][locale];
          const subResult = data[recordId][fieldId];

          console.log({ originalValue, subResult });

          if (_.isObject(subResult) && "type" in subResult && subResult.type === "item") {
            subResult.id = _.get(originalValue, "id");
          } else if (_.isArray(subResult)) {
            _.forEach(subResult, (item, index) => {
              if (_.isObject(item) && "type" in item && item.type === "item") {
                item.id = _.get(originalValue, [index, "id"]);
              }
            });
          }

          _.merge(originalInputCopy, {
            [recordId]: {
              [fieldId]: {
                [locale]: subResult,
              },
            },
          });
        }
      }

      console.log(
        JSON.stringify(
          {
            final: originalInputCopy,
          },
          null,
          2,
        ),
      );

      if (1) {
        process.exit(0);
      }

      return originalInputCopy;
    },
  });
}

export type DatoStructureLoaderParams = {};

export function createDatoStructureLoader(
  params: DatoStructureLoaderParams,
): ILoader<Record<string, Record<string, DatoValue>>, Record<string, string>> {
  return createLoader({
    async pull(locale, input) {
      const result: Record<string, string> = {};

      for (const [recordId, record] of Object.entries(input)) {
        traverseDatoValue(record, (fieldId, localizableValue) => {
          const valueId = `${recordId}/${fieldId}`;
          if (localizableValue) {
            result[valueId] = localizableValue as any;
          }
        });
      }

      return result;
    },
    async push(locale, data, originalInput = {}) {
      const result = _.cloneDeep(originalInput) || {};

      console.log(
        JSON.stringify(
          {
            originalInput,
            data,
          },
          null,
          2,
        ),
      );

      if (1) {
        process.exit(0);
      }

      for (const [recordId, record] of Object.entries(result)) {
        traverseDatoValue(record, (fieldId, localizableValue, setValue) => {
          const valueId = `${recordId}/${fieldId}`;
          const localizedValue = data[valueId];
          if (localizedValue) {
            setValue(localizedValue);
          }
        });
      }

      return result;
    },
  });

  function traverseDatoValue(
    record: Record<string, DatoValue>,
    callback: (fieldId: string, value: any, setValue: (newValue: any) => void) => void,
    path: string[] = [],
  ) {
    for (const [key, value] of Object.entries(record)) {
      const fieldId = [...path, key].join("/");
      const setValue = (newValue: any) => {
        record[key] = newValue;
      };

      if (!_.isArray(value)) {
        if (_.isString(value)) {
          callback(fieldId, value, setValue);
        } else if (_.isBoolean(value)) {
          callback(fieldId, value, setValue);
        } else if (_.isNumber(value)) {
          callback(fieldId, value, setValue);
        } else if (_.isNull(value)) {
          callback(fieldId, value, setValue);
        } else if (_.isObject(value)) {
          if ("schema" in value && value.schema === "dast") {
            const subResult: Record<string, DatoValue> = {};
            traverseDastNode(value.document, (fieldId, node) => {
              if (!node.value) {
                return;
              }
              subResult[fieldId] = node.value;
            });
            callback(fieldId, subResult, setValue);
          } else if ("type" in value && value.type === "item") {
            return traverseDatoValue(value.attributes, callback, [...path, key]);
          }
        }
      } else if (_.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          traverseDatoValue(value[i].attributes, callback, [...path, key, i.toString()]);
        }
      } else {
        throw new Error("Unreachable code.");
      }
    }
  }
}

function traverseDastNode(node: DastDocumentNode, callback: (fieldId: string, node: DastDocumentNode) => void, path: string[] = []) {
  callback([...path, node.type].join("/"), node);
  if (node.children?.length) {
    for (let i = 0; i < node.children.length; i++) {
      traverseDastNode(node.children[i], callback, [...path, i.toString()]);
    }
  }
}

type DatoClientParams = {
  apiKey: string;
  projectId: string;
  modelId: string;
  records: string[];
  fields: string[];
};

function createDatoClient(params: DatoClientParams) {
  if (!params.apiKey) {
    throw new Error("Missing required environment variable: DATO_API_TOKEN. Please set this variable and try again.");
  }
  const dato = buildClient({ apiToken: params.apiKey });

  return {
    async findRecords(limit: number = 100) {
      try {
        return dato.items
          .list({
            nested: true,
            version: "current",
            limit,
            filter: {
              projectId: params.projectId,
              type: params.modelId,
              only_valid: "true",
              ids: !params.records.length ? undefined : params.records.join(","),
            },
          })
          .catch((error: any) => Promise.reject(error?.response?.body?.data?.[0] || error));
      } catch (_error: any) {
        if (_error?.attributes?.code === "INVALID_AUTHORIZATION_HEADER") {
          throw new Error(
            [
              `Invalid DatoCMS API key. Please check your DATO_API_TOKEN environment variable and try again.`,
              `Error: ${JSON.stringify(_error, null, 2)}`,
            ].join("\n\n"),
          );
        }
        throw new Error(
          [
            `Failed to pull records from DatoCMS.`,
            `Project ID: ${params.projectId}`,
            `Model ID: ${params.modelId}`,
            `Error: ${JSON.stringify(_error, null, 2)}`,
          ].join("\n\n"),
        );
      }
    },
    async updateRecord(id: string, payload: any) {
      try {
        const response = await dato.items.update(id, payload).catch((error: any) => Promise.reject(error?.response?.body?.data?.[0] || error));
        return response;
      } catch (_error: any) {
        if (_error?.attributes?.details?.message) {
          throw new Error(
            [
              `${_error.attributes.details.message}`,
              `Payload: ${JSON.stringify(payload, null, 2)}`,
              `Error: ${JSON.stringify(_error, null, 2)}`,
            ].join("\n\n"),
          );
        }

        throw new Error(
          [
            `Failed to update record in DatoCMS.`,
            `Record ID: ${id}`,
            `Payload: ${JSON.stringify(payload, null, 2)}`,
            `Error: ${JSON.stringify(_error, null, 2)}`,
          ].join("\n\n"),
        );
      }
    },
    async enableFieldLocalization(fieldId: string) {
      try {
        await dato.fields
          .update(`${params.modelId}::${fieldId}`, { localized: true })
          .catch((error: any) => Promise.reject(error?.response?.body?.data?.[0] || error));
      } catch (_error: any) {
        if (_error?.attributes?.code === "NOT_FOUND") {
          throw new Error([`Field "${fieldId}" not found in model "${params.modelId}".`, `Error: ${JSON.stringify(_error, null, 2)}`].join("\n\n"));
        }

        if (_error?.attributes?.details?.message) {
          throw new Error([`${_error.attributes.details.message}`, `Error: ${JSON.stringify(_error, null, 2)}`].join("\n\n"));
        }

        throw new Error(
          [`Failed to enable field localization in DatoCMS.`, `Field ID: ${fieldId}`, `Error: ${JSON.stringify(_error, null, 2)}`].join("\n\n"),
        );
      }
    },
  };
}
