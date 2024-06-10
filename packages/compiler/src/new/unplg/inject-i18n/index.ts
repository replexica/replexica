import * as t from "@babel/types";
import createLoaderInjector from "./loader";
import createFragmentInjector from "./fragment";

export type I18nInjectorParams = {
  supportedLocales: string[];
};

export default function createI18nInjector(ast: t.File, params: I18nInjectorParams) {
  return {
    injectLoaders: createLoaderInjector(ast, params),
    injectFragments: createFragmentInjector(ast),
  };
}
