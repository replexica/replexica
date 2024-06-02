import { NodePath, traverse } from '@babel/core';
import * as t from '@babel/types';
import { CodeImporter } from '../code-importer';

export type CodeWorkerParams = {
  supportedLocales: string[];
  filePath: string;
};

export type CodeWorkerContext = {
  importer: CodeImporter;
  params: CodeWorkerParams;
};

export interface ICodeWorker {
  walk(ast: t.File, ctx: CodeWorkerContext): Promise<void>;
}

export abstract class CodeWorker<T extends t.Node> implements ICodeWorker {
  public shouldRun(nodePath: NodePath<t.Node>, ctx: CodeWorkerContext) {
    return true;
  }

  public async walk(ast: t.File, ctx: CodeWorkerContext) {
    const self = this;
    traverse(ast, {
      enter(path) {
        const shouldRun = self.shouldRun(path, ctx);
        if (shouldRun) {
          self.run(path as any, ctx);
        }
      },
    });
  }

  public abstract run(path: NodePath<T>, ctx: CodeWorkerContext): Promise<void>;
}