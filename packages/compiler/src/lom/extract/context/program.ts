import * as t from '@babel/types';
import { I18nNodeParser } from '../_core';

export const fromProgram: I18nNodeParser = (path, id) => {
  const programEl = t.isProgram(path.node) ? path.node : null;
  if (!programEl) { return null; }

  return {
    id,
    value: '',
    nodes: [],
  };
};