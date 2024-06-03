import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import _ from 'lodash';

export type CodeWorkerContext = {
  supportedLocales: string[];
  filePath: string;
  code: string;
  ast: t.File;
};

export type CodeWorkerArgs<T extends t.Node> = {
  debug: boolean;
  nodePath: NodePath<T>;
  phase: CodeWorkerPhase;
  ctx: CodeWorkerContext;
};

export type CodeWorkerPhase = 'pre' | 'post';

export type CodeWorkerHandler<T extends t.Node, C, R> = {
  (args: CodeWorkerArgs<T>, config: C): R;
}

export type CodeWorkerDefinition<T extends t.Node, C> = {
  name: string;
  runIf?: CodeWorkerHandler<T, C, boolean>;
  pre?: CodeWorkerHandler<T, C, void>;
  post?: CodeWorkerHandler<T, C, void>;
};

export type CompositeCodeWorkerDefinition<T extends t.Node, C> = {
  name: string;
  workers?: CodeWorkerDefinition<T, C>[];
};

export type CodeWorker<T extends t.Node> = {
  (args: CodeWorkerArgs<T>): void;
};

const defaultWorkerDef: Partial<CodeWorkerDefinition<t.Node, any>> = {
  runIf: () => true,
  pre: () => { },
  post: () => { },
};

export const createWorker = <T extends t.Node = t.Node, C = void>(
  _definition: CodeWorkerDefinition<T, C>,
) => {
  const definition = _.defaults(_definition, defaultWorkerDef);
  return (config: C): CodeWorker<T> => (args) => {
    const debugPrint = createDebugPrinter(definition.name);
    const phase = args.phase;
    const shouldRun = definition.runIf?.(args, config);
    const nodeType = args.nodePath.node.type;
    if (!shouldRun) { return; }
    console.log();
    debugPrint(`(${phase}) - ${nodeType}`);
    if (phase === 'pre') {
      definition.pre?.(args, config);
    } else if (phase === 'post') {
      definition.post?.(args, config);
    }
  }
}

export const joinWorkers =
  (...workers: CodeWorker<any>[]) => (config: void): CodeWorker<t.Node> =>
    (args) => workers.forEach((worker) => worker(args));

const createDebugPrinter = (prefix: string) =>
  (message: string) =>
    console.log(`[${prefix}] ${message}`);
