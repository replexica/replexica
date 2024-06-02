import * as t from '@babel/types';
import { CodeImporter } from '../services/importer';
import { generateCodeFromBabelAst, parseCodeIntoBabelAst, resolveNodePath } from '../../utils/babel';
import { I18nLoader } from './i18n-loader';
import { CodeWorker, CodeWorkerParams, CodeWorkerContext } from './base';

export class RootWorker extends CodeWorker {
  public static run(code: string, params: CodeWorkerParams) {
    const ast = parseCodeIntoBabelAst(code);
    const programPath = resolveNodePath(ast, (path) => t.isProgram(path.node));
    if (!programPath) { throw new Error('Program not found'); }

    const ctx: CodeWorkerContext = {
      importer: new CodeImporter(ast),
      params,
    };

    new RootWorker().run(programPath, ctx);

    const result = generateCodeFromBabelAst(code, ast);
    return result;
  }

  private constructor() {
    super(
      new I18nLoader,
    );
  }
}
