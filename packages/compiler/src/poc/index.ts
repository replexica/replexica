import * as t from '@babel/types';
import worker from './worker';
import { CodeWorker, CodeWorkerContext } from './worker/base';
import { NodePath, traverse } from '@babel/core';
import { CodeConverter } from '../new/unplg/services/converter';
import { findScopes } from './scope-worker';

export default (params: Omit<CodeWorkerContext, 'ast'>) => {
  const converter = CodeConverter.fromCode(params.code);
  const { ast } = converter.generateAst();
  const ctx: CodeWorkerContext = { ...params, ast };
  const transformAst = worker();

  traverse(ast, {
    Program(nodePath) {
      const scopes = findScopes(nodePath);
      console.log({ scopes });
    },
  });

  // const debug = true;
  // const timeStart = process.hrtime();
  // console.log('--------------');
  // traverse(ast, {
  //   enter(nodePath) {
  //     transformAst({ debug, nodePath, ctx, phase: 'pre' });
  //   },
  //   exit(nodePath) {
  //     transformAst({ debug, nodePath, ctx, phase: 'post' });
  //   },
  // });
  // console.log('--------------');
  // const timeStop = process.hrtime(timeStart);
  // const nanoSecondsElapsed = timeStop[0] * 1e9 + timeStop[1];
  // console.log(`Time elapsed: ${nanoSecondsElapsed.toLocaleString()}ns`);

  const result = converter.generateUpdatedCode(ast);
  return result;
};
