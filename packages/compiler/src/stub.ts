import { I18nConfig } from "@replexica/spec";
import { CompilerConfig } from "./config";

export default function (compilerConfig: CompilerConfig, i18nConfig: I18nConfig) {
  return { stub: true };
}
