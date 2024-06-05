import { composeExtractors } from "./_utils";
import extractContext from "./context";
import extractScope from "./scope";
import extractFragment from "./fragment";

export * from './_types';
export default composeExtractors(
  extractContext,
  extractScope,
  extractFragment,
);
