import _ from "lodash";
import fs from "fs";
import JSON5 from "json5";
import createOra from "ora";
import { composeLoaders } from "../_utils";
import {
  DastDocument,
  DastDocumentNode,
  DatoBlock,
  datoConfigSchema,
  DatoRecordPayload,
  DatoSimpleValue,
  DatoValue,
} from "./_base";
import { buildClient } from "@datocms/cma-client-node";
import { ILoader } from "../_types";
import { createLoader } from "../_utils";

export default function createDatoLoader(configFilePath: string) {
  try {
    const configContent = fs.readFileSync(configFilePath, "utf-8");
    const datoConfig = datoConfigSchema.parse(JSON5.parse(configContent));

    return composeLoaders(
      createDatoApiLoader(datoConfig),
      createDatoCleanupLoader(datoConfig),
      createDatoStructureLoader(datoConfig),
    );
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
      const result: Record<string, DatoRecordPayload> = _.cloneDeep(originalInput) || {};

      for (const [recordId, record] of Object.entries(result)) {
        for (const [fieldName, fieldValue] of Object.entries(record)) {
          if (!params.fields.includes(fieldName)) {
            continue;
          }

          const originalFieldValue = _.get(originalInput, [recordId, fieldName, locale]);
          const updatedFieldValue = data[recordId][fieldName];

          console.log({
            originalFieldValue,
            updatedFieldValue,
          });

          _.set(result, [recordId, fieldName, locale], updatedFieldValue);

          const _isValidBlock = (value?: DatoValue) =>
            _.isObject(value) && "type" in value && value.type === "item" && !!_.get(value, "id");

          if (_.isArray(updatedFieldValue)) {
            const originalValidBlocks = !_.isArray(originalFieldValue) ? [] : originalFieldValue.filter(_isValidBlock);
            const updatedValidBlocks = updatedFieldValue as DatoBlock[];
            const newBlocks = updatedValidBlocks.filter((block) => !originalValidBlocks.find((b) => b.id === block.id));
            for (let i = 0; i < newBlocks.length; i++) {
              traverseDatoBlock(newBlocks[i], {
                onBlock: (path, block) => {
                  block.id = _.get(originalFieldValue, [...path, i, "id"]);
                },
              });
            }
          } else if (_.isObject(updatedFieldValue)) {
            traverseDatoBlock(updatedFieldValue as DatoBlock, {
              onBlock: (path, block) => {
                block.id = _.get(originalFieldValue, [...path, "id"]);
              },
            });
          }
        }
      }

      console.log("result", JSON.stringify(result, null, 2));

      return result;
    },
  });
}

export type DatoStructureLoaderParams = {};

export function createDatoStructureLoader(
  params: DatoStructureLoaderParams,
): ILoader<Record<string, Record<string, DatoValue>>, Record<string, DatoSimpleValue>> {
  return createLoader({
    async pull(locale, input) {
      const result: Record<string, DatoSimpleValue> = {};

      for (const [recordId, record] of Object.entries(input)) {
        traverseDatoPayload(record, {
          onValue: (fieldPath, value) => {
            const valueId = `${recordId}/${fieldPath.join(".")}`;
            result[valueId] = value;
          },
        });
      }

      return result;
    },
    async push(locale, data, originalInput = {}) {
      const result = _.cloneDeep(originalInput) || {};

      for (const [recordId, record] of Object.entries(result)) {
        traverseDatoPayload(record, {
          onValue: (fieldPath, value, setValue) => {
            const valueId = `${recordId}/${fieldPath.join(".")}`;
            if (data[valueId]) {
              setValue(data[valueId]);
            }
          },
        });
      }

      return result;
    },
  });
}

type TraverseDatoCallbackMap = {
  onValue?: (path: string[], value: DatoSimpleValue, setValue: (value: DatoSimpleValue) => void) => void;
  onBlock?: (path: string[], value: DatoBlock) => void;
};

function traverseDatoPayload(
  payload: Record<string, DatoValue>,
  callbackMap: TraverseDatoCallbackMap,
  path: string[] = [],
) {
  for (const fieldName of Object.keys(payload)) {
    const fieldValue = payload[fieldName];
    traverseDatoValue(payload, fieldValue, callbackMap, [...path, fieldName]);
  }
}

function traverseDatoValue(
  parent: Record<string, DatoValue>,
  value: DatoValue,
  callbackMap: TraverseDatoCallbackMap,
  path: string[] = [],
) {
  if (_.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverseDatoValue(parent, value[i], callbackMap, [...path, i.toString()]);
    }
  } else if (_.isObject(value)) {
    if ("schema" in value && value.schema === "dast") {
      traverseDastDocument(value, callbackMap, [...path]);
    } else if ("type" in value && value.type === "item") {
      traverseDatoBlock(value, callbackMap, [...path]);
    } else {
      throw new Error(["Unsupported dato object value type:", JSON.stringify(value, null, 2)].join("\n\n"));
    }
  } else {
    callbackMap.onValue?.(path, value, (value) => {
      _.set(parent, path[path.length - 1], value);
    });
  }
}

function traverseDastDocument(dast: DastDocument, callbackMap: TraverseDatoCallbackMap, path: string[] = []) {
  traverseDastNode(dast.document, callbackMap, [...path, "document"]);
}

function traverseDatoBlock(block: DatoBlock, callbackMap: TraverseDatoCallbackMap, path: string[] = []) {
  callbackMap.onBlock?.(path, block);
  traverseDatoPayload(block.attributes, callbackMap, [...path, "attributes"]);
}

function traverseDastNode(node: DastDocumentNode, callbackMap: TraverseDatoCallbackMap, path: string[] = []) {
  if (node.value) {
    callbackMap.onValue?.(path, node.value, (value) => {
      _.set(node, "value", value);
    });
  }
  if (node.children?.length) {
    for (let i = 0; i < node.children.length; i++) {
      traverseDastNode(node.children[i], callbackMap, [...path, i.toString()]);
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
        const response = await dato.items
          .update(id, payload)
          .catch((error: any) => Promise.reject(error?.response?.body?.data?.[0] || error));
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
          throw new Error(
            [
              `Field "${fieldId}" not found in model "${params.modelId}".`,
              `Error: ${JSON.stringify(_error, null, 2)}`,
            ].join("\n\n"),
          );
        }

        if (_error?.attributes?.details?.message) {
          throw new Error(
            [`${_error.attributes.details.message}`, `Error: ${JSON.stringify(_error, null, 2)}`].join("\n\n"),
          );
        }

        throw new Error(
          [
            `Failed to enable field localization in DatoCMS.`,
            `Field ID: ${fieldId}`,
            `Error: ${JSON.stringify(_error, null, 2)}`,
          ].join("\n\n"),
        );
      }
    },
  };
}
