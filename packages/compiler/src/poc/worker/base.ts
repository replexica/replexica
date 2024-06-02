import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { CodeImporter } from '../services/importer';
import _ from 'lodash';

export type CodeWorkerParams = {
  supportedLocales: string[];
  filePath: string;
};

export type CodeWorkerInput = {
  ast: t.File;
  code: string;
};

export type CodeWorkerContext = {
  params: CodeWorkerParams;
  input: CodeWorkerInput;
  importer: CodeImporter;
};

export type CodeWorkerArgs<T extends t.Node> = {
  path: NodePath<T>;
  ctx: CodeWorkerContext;
  phase: CodeWorkerPhase;
};

export type CodeWorkerPhase = 'pre' | 'post';

export type CodeWorkerDefinition<T extends t.Node, C> = {
  phase?: true | ((args: Omit<CodeWorkerArgs<T>, 'phase'>, config: C) => CodeWorkerPhase);
  shouldRun?: (args: Omit<CodeWorkerArgs<T>, 'phase'>, config: C) => boolean;
  run?: CodeWorker<T, C>;
};

export type CodeWorker<T extends t.Node, C> = {
  (args: CodeWorkerArgs<T>, config: C): void;
};

const defaultWorkerDef: CodeWorkerDefinition<t.Node, any> = {
  phase: () => 'pre',
  shouldRun: () => true,
  run: () => { },
};

export const createWorker = <T extends t.Node = t.Node, C = void>(workerDefinition: CodeWorkerDefinition<T, C>) => {
  const def = _.merge({}, defaultWorkerDef, workerDefinition);
  return (config: C) =>
    (args: CodeWorkerArgs<T>) => {
      const shouldRun = !!def.shouldRun?.(args, config);
      if (!shouldRun) { return; }

      const currentPhase = args.phase;
      const definedPhase = def.phase === true ? currentPhase : def.phase?.(args, config);
      const correctPhase = definedPhase === currentPhase;

      if (!correctPhase) { return; }


      def.run?.(args, config);
    }
};

export const composeWorkers = (...workers: CodeWorker<any, any>[]): CodeWorker<t.Node, void> =>
  (...args) => workers.forEach(worker => worker(...args));

export const createContext = (input: CodeWorkerInput, params: CodeWorkerParams): CodeWorkerContext => {
  const importer = new CodeImporter(input.ast);
  return {
    params,
    input,
    importer,
  };
};
