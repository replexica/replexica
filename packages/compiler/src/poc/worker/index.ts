import { composeWorkers, createWorker } from "./base";
import debug from "./debug";
import i18n from "./i18n";

export default createWorker({
  next: composeWorkers(
    debug(),
    i18n()
  ),
});
