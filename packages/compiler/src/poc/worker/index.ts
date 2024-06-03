import { joinWorkers } from "./base";
import debug from "./debug";
import i18n from "./i18n";

export default joinWorkers(
  debug(),
  i18n(),
);