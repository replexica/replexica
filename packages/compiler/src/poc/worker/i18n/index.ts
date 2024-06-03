import { composeWorkers, createWorker } from "../base";
import dictionaryInjector from "./dictionary-injector";
import fragmentExtractor from "./fragment-extractor";
import scopeLabeler from "./scope-labeler";

/*
  Rules:
  1. Component with localizable text, single chunk? -> <I18nElement />
  2. Localizable attributes? -> <I18nElement />
  3. Component with localizable text, in chunks? -> <I18nElement /> + nested <I18nChunk />
*/

export default createWorker({
  next: composeWorkers(
    scopeLabeler(),
    fragmentExtractor(),
    dictionaryInjector(),
  ),
});