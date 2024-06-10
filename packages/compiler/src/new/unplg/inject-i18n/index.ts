import * as t from "@babel/types";
import createLoaderInjector from "./loader";
import createScopeInjector from "./scope";

export type I18nInjectorParams = {
  supportedLocales: string[];
};

export default function createI18nInjector(ast: t.File, fileId: string, params: I18nInjectorParams) {
  return {
    injectLoaders: createLoaderInjector(ast, params),
    injectScopes: createScopeInjector(ast, fileId),
  };
}
