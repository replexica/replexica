import { composeWorkers, createWorker } from "../base";
import dictionaryInjector from "./dictionary-injector";

export default createWorker({
  run: composeWorkers(
    dictionaryInjector(),
  ),
});