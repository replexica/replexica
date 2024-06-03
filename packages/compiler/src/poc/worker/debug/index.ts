import * as t from '@babel/types';
import { composeWorkers, createWorker } from "../base";
import writeCode from "./write-code";

export default createWorker<t.Program>({
  shouldRun: ({ nodePath: path }) => path.isProgram(),
  next: composeWorkers(
    writeCode(),
  ),
});