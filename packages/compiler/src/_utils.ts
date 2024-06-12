import { CompilerConfig, I18nConfig, loadI18nConfig } from "./config";

export type SubcompilerFactory<R> = {
  (compilerConfig: CompilerConfig, i18nConfig: I18nConfig): R;
}

export type SubcompilerMap<T extends Record<string, SubcompilerFactory<any>>> = {
  [name in keyof T]: (compilerConfig: CompilerConfig) => ReturnType<T[name]>;
};

export function createCompiler<T extends Record<string, SubcompilerFactory<any>>>(subcompilers: T) {
  const i18nConfig = loadI18nConfig();
  const result: SubcompilerMap<T> = {} as any;

  const subcompilerNames = Object.keys(subcompilers) as (keyof T)[];
  for (const subcompilerName of subcompilerNames) {
    const createSubcompiler = subcompilers[subcompilerName];
    result[subcompilerName] = (compilerConfig: CompilerConfig) =>
        createSubcompiler(compilerConfig, i18nConfig);
  }

  return result;
}
