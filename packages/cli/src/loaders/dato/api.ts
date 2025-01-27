import _ from "lodash";
import { ILoader } from "../_types";
import { createLoader } from "../_utils";
import createDatoClient, { DatoClient } from "./_utils";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";
import { DatoConfig } from "./_base";
import inquirer from "inquirer";

export type DatoApiLoaderOutput = {
  [modelId: string]: {
    fields: SimpleSchemaTypes.Field[];
    records: SimpleSchemaTypes.Item[];
  };
};

export type DatoApiLoaderCtx = {
  models: {
    [modelId: string]: {
      fields: SimpleSchemaTypes.Field[];
      records: SimpleSchemaTypes.Item[];
    };
  };
};

export default function createDatoApiLoader(
  config: DatoConfig,
  onConfigUpdate: (config: DatoConfig) => void,
): ILoader<void, DatoApiLoaderOutput, DatoApiLoaderCtx> {
  const dato = createDatoClient({
    apiKey: process.env.DATO_API_TOKEN || "",
    projectId: config.project,
  });
  return createLoader({
    init: async () => {
      const result: DatoApiLoaderCtx = {
        models: {},
      };
      const updatedConfig = _.cloneDeep(config);
      console.log(`Initializing DatoCMS loader...`);

      const project = await dato.findProject();
      const modelChoices = await getModelChoices(dato, config);
      const selectedModels = await promptModelSelection(modelChoices);

      for (const modelId of selectedModels) {
        if (!updatedConfig.models[modelId]) {
          updatedConfig.models[modelId] = {
            fields: [],
            records: [],
          };
        }
      }

      for (const modelId of Object.keys(updatedConfig.models)) {
        if (!selectedModels.includes(modelId)) {
          delete updatedConfig.models[modelId];
        }
      }

      for (const modelId of _.keys(updatedConfig.models)) {
        const { modelName, fields } = await getModelFields(dato, modelId);

        if (fields.length > 0) {
          result.models[modelId] = { fields: [], records: [] };

          const fieldInfos = await getFieldDetails(dato, fields);
          const fieldChoices = createFieldChoices(fieldInfos);
          const selectedFields = await promptFieldSelection(modelName, fieldChoices);

          for (const fieldInfo of fieldInfos) {
            const isLocalized = await updateFieldLocalization(dato, fieldInfo, selectedFields.includes(fieldInfo.id));
            if (isLocalized) {
              result.models[modelId].fields.push(fieldInfo);
              updatedConfig.models[modelId].fields = _.uniq([
                ...(updatedConfig.models[modelId].fields || []),
                fieldInfo.api_key,
              ]);
            }
          }

          const records = await dato.findRecordsForModel(modelId);
          const recordChoices = createRecordChoices(records, config.models[modelId]?.records || [], project);
          const selectedRecords = await promptRecordSelection(modelName, recordChoices);

          result.models[modelId].records = records.filter((record) => selectedRecords.includes(record.id));
          updatedConfig.models[modelId].records = selectedRecords;
        }
      }
      console.log(`DatoCMS loader initialized.`);
      onConfigUpdate(updatedConfig);
      return result;
    },
    async pull(locale, input, initCtx) {
      const result: DatoApiLoaderOutput = {};

      for (const modelId of _.keys(initCtx?.models || {})) {
        let records = initCtx?.models[modelId].records || [];
        const recordIds = records.map((record) => record.id);
        records = await dato.findRecords(recordIds);
        console.log(`Fetched ${records.length} records for model ${modelId}`);

        if (records.length > 0) {
          result[modelId] = {
            fields: initCtx?.models?.[modelId]?.fields || [],
            records: records,
          };
        }
      }
      return result;
    },
    async push(locale, data, originalInput) {
      for (const modelId of _.keys(data)) {
        for (let i = 0; i < data[modelId].records.length; i++) {
          const record = data[modelId].records[i];
          console.log(`Updating record ${i + 1}/${data[modelId].records.length} for model ${modelId}...`);
          await dato.updateRecord(record.id, record);
        }
      }
    },
  });
}

export async function getModelFields(dato: any, modelId: string) {
  const modelInfo = await dato.findModel(modelId);
  return {
    modelName: modelInfo.name,
    fields: _.filter(modelInfo.fields, (field) => field.type === "field"),
  };
}

export async function getFieldDetails(dato: DatoClient, fields: SimpleSchemaTypes.Field[]) {
  return Promise.all(fields.map((field) => dato.findField(field.id)));
}

export function createFieldChoices(fieldInfos: SimpleSchemaTypes.Field[]) {
  return fieldInfos.map((field) => ({
    name: field.label,
    value: field.id,
    checked: field.localized,
  }));
}

export async function promptFieldSelection(modelName: string, choices: any[]) {
  const { selectedFields } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedFields",
      message: `Select fields to enable localization for model "${modelName}":`,
      choices,
      pageSize: process.stdout.rows - 4, // Subtract some rows for prompt text and margins
    },
  ]);
  return selectedFields;
}

export async function updateFieldLocalization(
  dato: any,
  fieldInfo: SimpleSchemaTypes.Field,
  shouldBeLocalized: boolean,
) {
  if (shouldBeLocalized !== fieldInfo.localized) {
    console.log(`${shouldBeLocalized ? "Enabling" : "Disabling"} localization for ${fieldInfo.label}...`);
    await dato.updateField(fieldInfo.id, { localized: shouldBeLocalized });
  }
  return shouldBeLocalized;
}

export function createRecordChoices(
  records: SimpleSchemaTypes.Item[],
  selectedIds: string[] = [],
  project: SimpleSchemaTypes.Site,
) {
  return records.map((record) => ({
    name: `${record.id} - https://${project.internal_domain}/editor/item_types/${record.item_type.id}/items/${record.id}`,
    value: record.id,
    checked: selectedIds?.includes(record.id),
  }));
}

export async function promptRecordSelection(modelName: string, choices: any[]) {
  const { selectedRecords } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedRecords",
      message: `Select records to include for model "${modelName}":`,
      choices,
      pageSize: process.stdout.rows - 4, // Subtract some rows for prompt text and margins
    },
  ]);
  return selectedRecords;
}

export async function getModelChoices(dato: DatoClient, config: DatoConfig) {
  const models = await dato.findModels();
  return models.map((model) => ({
    name: `${model.name} (${model.api_key})`,
    value: model.id,
    checked: config.models[model.id] !== undefined,
    pageSize: process.stdout.rows - 4, // Subtract some rows for prompt text and margins
  }));
}

export async function promptModelSelection(choices: any[]) {
  const { selectedModels } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedModels",
      message: "Select models to include:",
      choices,
      pageSize: process.stdout.rows - 4, // Subtract some rows for prompt text and margins
    },
  ]);
  return selectedModels;
}
