import { CodeWorkerParams, CodeWorker } from './workers/base';
import { I18nLoader } from './workers/i18n-loader';

export const runPocCompiler = (code: string, params: CodeWorkerParams) =>
  CodeWorker
    .fromCode(code, params)
    .register(I18nLoader)
    .generate();