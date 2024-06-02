import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { CodeImporter } from '../services/importer';

export type CodeWorkerParams = {
  supportedLocales: string[];
  filePath: string;
};

export type CodeWorkerContext = {
  importer: CodeImporter;
  params: CodeWorkerParams;
};

export class CodeWorker<T extends t.Node = t.Node> {
  protected _workers: Set<CodeWorker>;

  protected constructor(
    ...workers: CodeWorker[]
  ) {
    this._workers = new Set(workers);
  }

  public shouldRun(nodePath: NodePath<t.Node>, ctx: CodeWorkerContext) {
    return true;
  }

  public run(path: NodePath<T>, ctx: CodeWorkerContext) {
    const self = this;
    path.traverse({
      enter(path) {
        self._workers.forEach((worker) => {
          const shouldRun = worker.shouldRun(path, ctx);
          if (shouldRun) {
            worker.run(path, ctx);
          }
        });
      },
    });
  }
}


