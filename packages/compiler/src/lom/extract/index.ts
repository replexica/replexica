import { composeExtractors } from "./_core";
import extractContext from "./context";
import extractScope from "./scope";
import extractFragment from "./fragment";

export default composeExtractors(
  extractContext,
  extractScope,
  extractFragment,
);
