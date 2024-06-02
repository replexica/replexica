import { CodeWorkerParams, createContext } from "./worker/base";
import worker from './worker';
import { generateAstFromCode, generateCodeFromAst } from "../utils/babel";

export const runPocCompiler = (code: string, params: CodeWorkerParams) => {
  const ast = generateAstFromCode(code);
  const ctx = createContext({ ast, code }, params);

  worker(ast, ctx);

  const result = generateCodeFromAst(ast, code);
  return result;
};
