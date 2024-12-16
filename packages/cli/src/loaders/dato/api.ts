import { buildClient } from '@datocms/cma-client-node';
import { ILoader } from "../_types";
import { createLoader } from '../_utils';

interface DatoConfig {
  fields: string[];
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
  const {
    DATO_API_TOKEN = '',
    DATO_MODEL_ID = '',
    DATO_PROJECT_ID = '',
  } = process.env;

  if (!DATO_API_TOKEN) throw new Error('DATO_API_TOKEN environment variable is required');
  if (!DATO_MODEL_ID) throw new Error('DATO_MODEL_ID environment variable is required');
  if (!DATO_PROJECT_ID) throw new Error('DATO_PROJECT_ID environment variable is required');

  const client = buildClient({ apiToken: DATO_API_TOKEN });

  return createLoader({
    async pull(locale) {
      const records = await client.items.list({
        filter: {
          type: DATO_MODEL_ID,
          projectId: DATO_PROJECT_ID
        }
      });

      return records.reduce((acc, record) => {
        acc[record.id] = record;
        return acc;
      }, {} as Record<string, DatoRecord>);
    },

    async push(locale, data) {
      for (const record of Object.values(data)) {
        await client.items.update(record.id, record as any);
      }
    }
  });
}
