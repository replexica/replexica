import { buildClient } from '@datocms/cma-client-node';
import fs from 'fs';
import { ILoader } from "../_types";
import { createLoader } from '../_utils';

interface DatoConfig {
  apiKey: string;
  projectId: string;
  modelId: string;
}

interface DastNode {
  type: string;
  value?: string;
  marks?: Array<{ type: string }>;
  children?: DastNode[];
  [key: string]: any;
}

interface DastContent {
  schema: 'dast';
  document: {
    type: 'root';
    children: DastNode[];
  };
}

interface DatoRecord {
  id: string;
  type: string;
  [field: string]: any | DastContent;
}

export default function createDatoCMSApiLoader(config: DatoConfig): ILoader<void, Record<string, DatoRecord>> {
  return createLoader({
    async pull(locale) {
      const dato = createDatoClient(config.apiKey);

      try {
        const records = await dato.items.list({
          filter: {
            projectId: config.projectId,
            type: config.modelId,
          },
        })
        .catch((error: any) => Promise.reject(error?.response?.body?.data?.[0] || error));

        return records.reduce((acc, record) => {
          acc[record.id] = record;
          return acc;
        }, {} as Record<string, DatoRecord>);
      } catch (_error: any) {
        if (_error?.attributes?.code === 'INVALID_AUTHORIZATION_HEADER') {
          throw new Error('Invalid DatoCMS API key. Please check your DATO_API_TOKEN environment variable and try again.');
        }
        throw new Error(`Failed to pull records from DatoCMS: ${_error.message}`);
      }
    },

    async push(locale, data) {
      const dato = createDatoClient(config.apiKey);

      try {
        for (const record of Object.values(data)) {
          await dato.items.update(record.id, record as any)
            .catch((error: any) => Promise.reject(error?.response?.body?.data?.[0] || error));
        }
      } catch (_error: any) {
        // Handle invalid locale error gracefully
        if (_error?.attributes?.code === 'INVALID_FIELD' && 
            _error?.attributes?.details?.code === 'INVALID_LOCALES') {
          const validLocales = _error.attributes.details.valid_locales;
          throw new Error(
            `Cannot update "${locale}" locale as it is not configured in the current DatoCMS project (${config.projectId}). ` +
            `Valid locales are: ${validLocales.join(', ')}`
          );
        }

        // For other API errors with details message, throw that
        if (_error?.attributes?.details?.message) {
          throw new Error(_error.attributes.details.message);
        }

        // Otherwise rethrow original error
        throw _error;
      }
    }
  });
}

function createDatoClient(apiKey: string) {
  if (!apiKey) {
    throw new Error('Missing required environment variable: DATO_API_TOKEN. Please set this variable and try again.');
  }
  return buildClient({ apiToken: apiKey });
}
