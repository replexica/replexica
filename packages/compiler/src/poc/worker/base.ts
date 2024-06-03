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
  phase: 'pre' | 'post';
  ctx: CodeWorkerContext;
};

export type CodeWorkerPhase = 'pre' | 'post';

export type CodeWorkerDefinition<T extends t.Node, C> = {
  phase?: 'pre' | 'post' | boolean;
  shouldRun?: (args: CodeWorkerArgs<T>, config: C) => boolean;
  run?: (args: CodeWorkerArgs<T>, config: C) => void;
};

export type CodeWorker<T extends t.Node> = {
  (args: CodeWorkerArgs<T>): void;
};

const defaultWorkerDef: CodeWorkerDefinition<t.Node, any> = {
  phase: 'pre',
  shouldRun: () => true,
  run: () => {},
};

export const createWorker = <T extends t.Node = t.Node, C = void>(_definition: CodeWorkerDefinition<T, C>) => {
  const definition = _.defaults(_definition, defaultWorkerDef);
  return (config: C): CodeWorker<T> =>
    (args: CodeWorkerArgs<T>) => {
      const phaseMatches = definition.phase === args.phase || definition.phase === true;
      if (!phaseMatches) { return; }

      const shouldRun = definition.shouldRun?.(args, config);
      if (!shouldRun) { return; }

      definition.run?.(args, config);
    }
};

export const composeWorkers =
  (...workers: CodeWorker<any>[]): CodeWorker<t.Node> =>
    (args) => workers.forEach((worker) => worker(args));