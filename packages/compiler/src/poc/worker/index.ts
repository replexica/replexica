import { composeWorkers, createWorker } from "./base";
import debug from "./debug";
import i18n from "./i18n";

export default createWorker({
  phase: true,
  run: composeWorkers(
    debug(),
    i18n(),
  ),
});
