import * as t from "@babel/types";
import { CodeWorkerContext, composeWorkers } from "./base";
import debug from "./debug";
import { traverse } from "@babel/core";
import i18n from "./i18n";

export default (file: t.File, ctx: CodeWorkerContext) => {
  const worker = composeWorkers(
    debug(),
    i18n(),
  );
  traverse(file, {
    enter(path) {
      worker({
        ctx,
        path,
        phase: 'pre',
      });
    },
    exit(path) {
      // if (1 > 0.1) {
      //   throw new Error('This is a test error');
      // }
      worker({
        ctx,
        path,
        phase: 'post',
      });
    },
  });
}
