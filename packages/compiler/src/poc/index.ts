import worker from './worker';
import { CodeWorkerContext } from './worker/base';
import { traverse } from '@babel/core';
import { CodeConverter } from './services/converter';

export default (args: Omit<CodeWorkerContext, 'ast'>) => {
  const converter = CodeConverter.fromCode(args.code);
  const { ast } = converter.generateAst();
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

  const result = converter.generateUpdatedCode(ast);
  return result;
};
