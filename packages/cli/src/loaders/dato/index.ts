import fs from 'fs';
import { composeLoaders } from '../_utils';
import createDatoCMSApiLoader from './api';
import createDatoCMSStructureLoader from './structure';
import { DatoConfig, datoConfigSchema, DatoSettings, datoSettingsSchema } from './_types';

export default function createDatoLoader(configFilePath: string) {
  const config = getDatoConfig(configFilePath);
  const settings = getDatoSettings();

  return composeLoaders(
    createDatoCMSApiLoader({
      apiKey: settings.auth.apiKey,
      projectId: config.projectId,
      modelId: Object.keys(config.localizables)[0],
    }),
    createDatoCMSStructureLoader({
      fields: config.localizables[Object.keys(config.localizables)[0]].fields,
    })
  );
}

function getDatoSettings(): DatoSettings {
  return datoSettingsSchema
    .passthrough()
    .parse({
      auth: {
        apiKey: process.env.DATO_API_TOKEN || '',
      }
    });
}

function getDatoConfig(configFilePath: string): DatoConfig {
  try {
    const config = fs.readFileSync(configFilePath, 'utf-8');
    return datoConfigSchema.parse(JSON.parse(config));
  } catch (error: any) {
    throw new Error(`Failed to parse DatoCMS config file: ${error.message}`);
  }
}
