import { composeWorkers, createWorker } from "../base";
import writeCode from "./write-code";

export default createWorker({
  phase: true,
  shouldRun: ({ path }) => path.isProgram(),
  run: composeWorkers(
    writeCode({ phase: 'pre' }),
    writeCode({ phase: 'post' }),
  ),
});