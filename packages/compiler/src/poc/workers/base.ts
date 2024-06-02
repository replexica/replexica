import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { CodeImporter } from '../services/importer';
import { generateCodeFromBabelAst, parseCodeIntoBabelAst, resolveNodePath } from '../../utils/babel';

export type CodeWorkerParams = {
  supportedLocales: string[];
  filePath: string;
};

export type CodeWorkerPayload = {
  code: string;
  ast: t.File;
};

export type CodeWorkerContext = {
  params: CodeWorkerParams;
  payload: CodeWorkerPayload;
  importer: CodeImporter;
};

export class CodeWorker<T extends t.Node = t.Node> {
  public static fromCode(code: string, params: CodeWorkerParams) {
    const ast = parseCodeIntoBabelAst(code);

    const programPath = resolveNodePath(ast, (path) => t.isProgram(path.node));
    if (!programPath) { throw new Error('Program not found'); }

    const ctx = createContext(code, ast, params);
    return new CodeWorker(ctx);
  }

  private workers: CodeWorker<t.Node>[] = [];

  public constructor(
    protected ctx: CodeWorkerContext,
  ) { }

  public register(workerFactory: new (ctx: CodeWorkerContext) => CodeWorker<T>) {
    const worker = new workerFactory(this.ctx);
    this.workers.push(worker);
    return this;
  };

  public generate() {
    const fileNodePath = resolveNodePath(this.ctx.payload.ast, (path) => t.isFile(path.node));
    if (!fileNodePath) { throw new Error('File not found'); }

    this.runAll(fileNodePath);

    const result = generateCodeFromBabelAst(this.ctx.payload.code, this.ctx.payload.ast);
    return result;
  }

  protected shouldRun(nodePath: NodePath<t.Node>) {
    return true;
  }

  protected shouldSkipChildren(nodePath: NodePath<t.Node>) {
    return true;
  }

  protected run(nodePath: NodePath<t.Node>): void {
    // Do nothing by default
  }

  private runAll(nodePath: NodePath<t.Node>) {
    this.run(nodePath);
    this.runChildWorkers(nodePath);
  }

  private runChildWorkers(nodePath: NodePath<t.Node>) {
    const self = this;
    nodePath.traverse({
      enter(path) {
        self.workers.forEach((worker) => {
          const shouldRun = worker.shouldRun(path);
          if (shouldRun) {
            worker.runAll(path);
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

function createContext(code: string, ast: t.File, params: CodeWorkerParams): CodeWorkerContext {
  return {
    params,
    payload: { code, ast },
    importer: new CodeImporter(ast),
  };
}