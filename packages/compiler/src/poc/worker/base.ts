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
  nodePath: NodePath<T>;
  phase: CodeWorkerPhase;
  ctx: CodeWorkerContext;
};

export type CodeWorkerPhase = 'pre' | 'post';

export type CodeWorkerHandler<T extends t.Node, C, R> = {
  (args: CodeWorkerArgs<T>, config: C): R;
}

export type CodeWorkerDefinition<T extends t.Node, C> = {
  shouldRun?: CodeWorkerHandler<T, C, boolean>;
  pre?: CodeWorkerHandler<T, C, void>;
  post?: CodeWorkerHandler<T, C, void>;
  next?: CodeWorkerHandler<T, C, void>;
};

export type CodeWorker<T extends t.Node> = {
  (args: CodeWorkerArgs<T>): void;
};

const defaultWorkerDef: CodeWorkerDefinition<t.Node, any> = {
  shouldRun: () => true,
  pre: () => {},
  post: () => {},
  next: () => {},
};

export const createWorker = <T extends t.Node = t.Node, C = void>(_definition: CodeWorkerDefinition<T, C>) => {
  const definition = _.defaults(_definition, defaultWorkerDef);
  return (config: C): CodeWorker<T> =>
    (args: CodeWorkerArgs<T>) => {
      const phase = args.phase;
      const shouldRun = definition.shouldRun?.(args, config);
      if (!shouldRun) { return; }

      if (phase === 'pre') {
        definition.pre?.(args, config);
      } else if (phase === 'post') {
        definition.post?.(args, config);
      }

      definition.next?.(args, config);
    }
};

export const composeWorkers =
  (...workers: CodeWorker<any>[]): CodeWorker<t.Node> =>
    (args) => workers.forEach((worker) => worker(args));