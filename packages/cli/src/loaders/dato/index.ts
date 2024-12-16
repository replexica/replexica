import { composeLoaders } from '../_utils';
import createDatoCMSApiLoader from './api';
import createDatoCMSStructureLoader from './structure';

export default function createDatoLoader(config: { fields: string[] }) {
  return composeLoaders(
    createDatoCMSApiLoader(config),
    createDatoCMSStructureLoader(config)
  );
}
