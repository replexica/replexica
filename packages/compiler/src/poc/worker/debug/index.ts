import * as t from '@babel/types';
import { composeWorkers, createWorker } from "../base";
import writeCode from "./write-code";

export default createWorker<t.Program>({
  phase: true,
  shouldRun: ({ nodePath: path }) => path.isProgram(),
  run: composeWorkers(
    writeCode({ phase: 'pre' }),
    writeCode({ phase: 'post' }),
  ),
});