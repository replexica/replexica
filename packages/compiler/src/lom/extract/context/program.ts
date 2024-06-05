import * as t from '@babel/types';
import { I18nNodeParser } from '../_utils';

export const fromProgram: I18nNodeParser = (path) => {
  const programEl = t.isProgram(path.node) ? path.node : null;
  if (!programEl) { return null; }

  return {
    value: 'Program',
    nodes: [],
  };
};