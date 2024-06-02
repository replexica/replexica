import * as t from '@babel/types';
import { CodeImporter } from '../services/importer';
import { generateCodeFromBabelAst, parseCodeIntoBabelAst, resolveNodePath } from '../../utils/babel';
import { CodeWorker, CodeWorkerParams, CodeWorkerContext } from './base';

export class RootWorker extends CodeWorker {
  public static fromCode(code: string, params: CodeWorkerParams) {
    const ast = parseCodeIntoBabelAst(code);
    return new RootWorker(code, ast, params);
  }

  private constructor(
    private code: string,
    private ast: t.File,
    private params: CodeWorkerParams,
  ) {
    const ctx = createContext(ast, params);

    super(ctx);
  }

  public run() {
    const programPath = resolveNodePath(this.ast, (path) => t.isProgram(path.node));
    if (!programPath) { throw new Error('Program not found'); }

    this.process(programPath);

    const result = generateCodeFromBabelAst(this.code, this.ast);
    return result;
  }
}

function createContext(ast: t.File, params: CodeWorkerParams): CodeWorkerContext {
  return {
    importer: new CodeImporter(ast),
    params,
  };
}