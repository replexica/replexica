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

export abstract class CodeWorker<T extends t.Node = t.Node> {
  private workers: CodeWorker<t.Node>[] = [];

  public constructor(
    protected ctx: CodeWorkerContext,
  ) { }

  public register(workerFactory: new (ctx: CodeWorkerContext) => CodeWorker<T>) {
    const worker = new workerFactory(this.ctx);
    this.workers.push(worker);
    return this;
  };

  protected shouldRun(nodePath: NodePath<t.Node>) {
    return true;
  }

  protected shouldSkipChildren(nodePath: NodePath<t.Node>) {
    return true;
  }

  protected process(rootPath: NodePath<T>): void {
    const self = this;
    rootPath.traverse({
      enter(path) {
        self.workers.forEach((worker) => {
          const shouldRun = worker.shouldRun(path);
          if (shouldRun) {
            worker.process(path);
          }

          const shouldSkipChildren = worker.shouldSkipChildren(path);
          if (shouldSkipChildren) {
            path.skip();
          }
        });
      },
    });
  }
}
