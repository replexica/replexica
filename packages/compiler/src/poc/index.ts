import { CodeFactory } from "./code-factory";
import { CodeWorkerParams } from "./workers/base";
import { I18nLoader } from "./workers/i18n-loader";

export async function runPocCompiler(
  code: string,
  params: CodeWorkerParams,
) {
  return new CodeFactory()
    .addWorker(I18nLoader)
    .run(code, params);
}
