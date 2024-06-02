import { CodeWorkerParams } from './workers/base';
import { I18nLoader } from './workers/i18n-loader';
import { RootWorker } from './workers/root';

export const runPocCompiler = (code: string, params: CodeWorkerParams) =>
  RootWorker
    .fromCode(code, params)
    .register(I18nLoader)
    .run();