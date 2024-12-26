import fs from 'fs';
import JSON5 from 'json5';
import createOra from 'ora';
import { composeLoaders } from '../_utils';
import { DastContent, DatoConfig, datoConfigSchema, DatoField, DatoFieldAny, DatoSettings, datoSettingsSchema, DEFAULT_LOCALE } from './_base';
import { buildClient } from '@datocms/cma-client-node';
import { ILoader } from "../_types";
import { createLoader } from '../_utils';
import { DastNode, DatoRecord } from './_base';

export default function createDatoLoader(configFilePath: string) {
  try {
    const configContent = fs.readFileSync(configFilePath, 'utf-8');
    const datoConfig = datoConfigSchema.parse(JSON5.parse(configContent));

    return composeLoaders(
      createDatoCMSApiLoader(datoConfig),
      createDatoCmsStructureLoader(datoConfig),
      createDatoCmsContentLoader(),
    );
  } catch (error: any) {
    throw new Error([
      `Failed to parse DatoCMS config file.`,
      `Error: ${error.message}`,
    ].join('\n\n'));
  }
}

export type DatoCmsApiLoaderParams = {
  project: string;
  model: string;
  fields: string[];
  records: string[];
}

export function createDatoCMSApiLoader(params: DatoCmsApiLoaderParams): ILoader<void, Record<string, DatoRecord>> {
  return createLoader({
    async pull(locale, input) {
      const ora = createOra({ indent: 4 });
      const dato = createDatoClient({
        apiKey: process.env.DATO_API_TOKEN || '',
        projectId: params.project,
        modelId: params.model,
        records: params.records,
      });

      for (const field of params.fields) {
        await dato.enableFieldLocalization(field);
      }

      ora.start(`[${locale}] Fetching records for ${params.model}...`);
      const records = await dato.findRecords();
      ora.succeed(`[${locale}] Processed ${records.length} records for ${params.model}.`);

      const result: Record<string, DatoRecord> = {};
      for (const record of records) {
        result[record.id] = record;
      }
      return result;
    },

    async push(locale, data) {
      const dato = createDatoClient({
        apiKey: process.env.DATO_API_TOKEN || '',
        projectId: params.project,
        modelId: params.model,
        records: params.records,
      });

      for (const record of Object.values(data)) {
        console.log('Updating record', record.id);
        await dato.updateRecord(record.id, record as any);
      }
    }
  });
}

export type DatoCmsStructureLoaderParams = {
  fields: string[];
}

export function createDatoCmsStructureLoader(params: DatoCmsStructureLoaderParams): ILoader<Record<string, DatoRecord>, Record<string, Record<string, DatoFieldAny>>> {
  return createLoader({
    async pull(locale, input) {
      const result: Record<string, Record<string, DatoFieldAny>> = {};

      for (const [recordId, record] of Object.entries(input)) {
        result[recordId] = {};
        for (const field of params.fields) {
          const datoField = parseDatoField(field, record[field]);
          if (!datoField) { continue; }

          result[recordId][field] = datoField;
        }
      }

      return result;
    },

    async push(locale, data, originalInput) {
      const result = { ...originalInput };

      for (const [recordId, record] of Object.entries(data)) {
        for (const [fieldId, field] of Object.entries(record)) {
          result[recordId][fieldId] = field.value;

          for (const [localeId, localizedContent] of Object.entries(field.value)) {
            if (!localizedContent) {
              result[recordId][fieldId][localeId] = result[recordId][fieldId][DEFAULT_LOCALE];
            }
          }
        }
      }

      return result;
    }
  });
}

function createDatoCmsContentLoader(): ILoader<Record<string, Record<string, DatoFieldAny>>, Record<string, string>> {
  return createLoader({
    async pull(locale, input) {
      const result: Record<string, string> = {};

      for (const [recordId, record] of Object.entries(input)) {
        for (const [fieldId, field] of Object.entries(record)) {
          if (field.type === 'string') {
            result[`${recordId}/${fieldId}`] = field.value[locale];
          } else if (field.type === 'dast' && field.value[locale]?.document) {
            traverseDast(field.value[locale].document, (node, path) => {
              if (node.type === 'span' && node.value) {
                result[`${recordId}/${fieldId}/${path}`] = node.value;
              }
            });
          }
        }
      }

      return result;
    },
    async push(locale, data, originalInput) {
      const result = { ...originalInput };

      for (const [recordId, record] of Object.entries(result)) {
        for (const [fieldId, _field] of Object.entries(record)) {
          const field = _field as DatoFieldAny;
          if (field.type === 'string') {
            result[recordId][fieldId] = {
              ...field,
              value: {
                ...field.value,
                [locale]: data[`${recordId}/${fieldId}`],
              },
            };
          } else if (field.type === 'dast' && field.value[locale]?.document) {
            traverseDast(field.value[locale].document, (node, path) => {
              if (node.type === 'span' && node.value) {
                node.value = data[`${recordId}/${fieldId}/${path}`];
              }
            });
          }
        }
      }

      return result;
    }
  });
}

function parseDatoField(key: string, payload: any): DatoField<'string', string> | DatoField<'dast', DastContent> | null {
  if (!payload) { return null; }

  if (typeof payload === 'object' && DEFAULT_LOCALE in payload && typeof payload[DEFAULT_LOCALE] === 'string') {
    return {
      type: 'string',
      localizationEnabled: true,
      key,
      value: payload,
    };
  } else if (typeof payload === 'object' && DEFAULT_LOCALE in payload && typeof payload[DEFAULT_LOCALE] === 'object' && payload[DEFAULT_LOCALE].schema === 'dast') {
    return {
      type: 'dast',
      localizationEnabled: true,
      key,
      value: payload,
    };
  } else if (typeof payload === 'object' && payload.schema === 'dast' && payload.document) {
    return {
      type: 'dast',
      localizationEnabled: false,
      key,
      value: {
        [DEFAULT_LOCALE]: payload,
      },
    };
  } else if (typeof payload === 'string') {
    return {
      type: 'string',
      localizationEnabled: false,
      key,
      value: {
        [DEFAULT_LOCALE]: payload,
      },
    };
  } else {
    throw new Error(`Invalid DatoCMS field value. Received: ${JSON.stringify(payload)}`);
  }
}

function traverseDast(
  node: DastNode,
  callback: (node: DastNode, path: string) => void,
  path: string = ''
) {
  callback(node, path);
  if (node.children) {
    node.children.forEach(
      (child, index) => traverseDast(
        child,
        callback,
        [path, index]
          .filter(Boolean)
          .join('/'),
      ),
    );
  }
}

type DatoClientParams = {
  apiKey: string;
  projectId: string;
  modelId: string;
  records: string[];
};

function createDatoClient(params: DatoClientParams) {
  if (!params.apiKey) {
    throw new Error('Missing required environment variable: DATO_API_TOKEN. Please set this variable and try again.');
  }
  const dato = buildClient({ apiToken: params.apiKey });

  return {
    async findRecords() {
      try {
        return dato
          .items
          .list({
            filter: {
              projectId: params.projectId,
              type: params.modelId,
              ids: !params.records.length ? undefined : params.records.join(','),
            },
          })
          .catch((error: any) => Promise.reject(error?.response?.body?.data?.[0] || error));
      } catch (_error: any) {
        if (_error?.attributes?.code === 'INVALID_AUTHORIZATION_HEADER') {
          throw new Error([
            `Invalid DatoCMS API key. Please check your DATO_API_TOKEN environment variable and try again.`,
            `Error: ${JSON.stringify(_error, null, 2)}`,
          ].join('\n\n'));
        }
        throw new Error([
          `Failed to pull records from DatoCMS.`,
          `Project ID: ${params.projectId}`,
          `Model ID: ${params.modelId}`,
          `Error: ${JSON.stringify(_error, null, 2)}`,
        ].join('\n\n'));
      }
    },
    async updateRecord(id: string, payload: any) {
      try {
        const response = await dato
          .items
          .update(id, payload)
          .catch((error: any) => Promise.reject(error?.response?.body?.data?.[0] || error));
        return response;
      } catch (_error: any) {
        if (_error?.attributes?.details?.message) {
          throw new Error([
            `${_error.attributes.details.message}`,
            `Payload: ${JSON.stringify(payload, null, 2)}`,
            `Error: ${JSON.stringify(_error, null, 2)}`,
          ].join('\n\n'));
        }

        throw new Error([
          `Failed to update record in DatoCMS.`,
          `Record ID: ${id}`,
          `Payload: ${JSON.stringify(payload, null, 2)}`,
          `Error: ${JSON.stringify(_error, null, 2)}`,
        ].join('\n\n'));
      }
    },
    async enableFieldLocalization(fieldId: string) {
      try {
        await dato
          .fields
          .update(`${params.modelId}::${fieldId}`, { localized: true })
          .catch((error: any) => Promise.reject(error?.response?.body?.data?.[0] || error));
      } catch (_error: any) {
        if (_error?.attributes?.details?.message) {
          throw new Error([
            `${_error.attributes.details.message}`,
            `Error: ${JSON.stringify(_error, null, 2)}`,
          ].join('\n\n'));
        }

        throw new Error([
          `Failed to enable field localization in DatoCMS.`,
          `Field ID: ${fieldId}`,
          `Error: ${JSON.stringify(_error, null, 2)}`,
        ].join('\n\n'));
      }
    }
  };
}
