import * as t from "@babel/types";
import { I18nScope } from "../_types";

export default function createI18nInjector(ast: t.File) {
  return {
    injectLoaders: () => {

    },
    injectFragments: (i18nTree: I18nScope) => {

    },
  };
}