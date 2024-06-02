import * as t from '@babel/types';
import { generateCodeFromBabelAst, parseCodeIntoBabelAst } from '../utils/babel';
import { CodeImporter } from './services/importer';
import { ICodeWorker, CodeWorkerParams, CodeWorkerContext } from './workers/base';

export class CodeFactory {
  private _workers: Set<ICodeWorker> = new Set();

  public addWorker(workerType: new () => ICodeWorker) {
    this._workers.add(new workerType());
    return this;
  }

  public async run(code: string, params: CodeWorkerParams) {
    const ast = parseCodeIntoBabelAst(code);

    const ctx = this._createContext(ast, params);
    for (const worker of this._workers) {
      await worker.walk(ast, ctx);
    }

    const result = generateCodeFromBabelAst(code, ast);
    return result;
  }

  private _createContext(ast: t.File, params: CodeWorkerParams): CodeWorkerContext {
    return {
      params,
      importer: new CodeImporter(ast),
    };
  }
}
