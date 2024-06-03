import worker from './worker';
import { generateAstFromCode, generateCodeFromAst } from "../utils/babel";
import { CodeWorkerContext } from './worker/base';
import { traverse } from '@babel/core';

export default (args: Omit<CodeWorkerContext, 'ast'>) => {
  const ast = generateAstFromCode(args.code);
  const ctx: CodeWorkerContext = { ...args, ast };
  const transformAst = worker();

  traverse(ast, {
    enter(nodePath) {
      transformAst({ ctx, nodePath, phase: 'pre' });
    },
    exit(nodePath) {
      transformAst({ ctx, nodePath, phase: 'post' });
    },
  });

  const result = generateCodeFromAst(ctx.ast, ctx.code);
  return result;
};
