import { joinWorkers } from "../base";
import dictionary from "./dictionary";
import fragment from "./fragment";
import scope from "./scope";

export default joinWorkers(
  scope(),
  fragment(),
  dictionary(),
);
