import { CodeFactory } from "./code-factory";
import { CodeWorkerParams } from "./code-worker/base";
import { I18nLoader } from "./code-worker/i18n-loader";

export async function runPocCompiler(
  code: string,
  params: CodeWorkerParams,
) {
  return new CodeFactory()
    .addWorker(I18nLoader)
    .run(code, params);
}
