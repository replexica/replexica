import { joinWorkers } from "../base";
import writeCode from "./write-code";

export default joinWorkers(
  writeCode(),
);