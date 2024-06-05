import { composeParsers } from "../_core";
import { fromProgram } from "./program";

export default composeParsers(
  'context',
  fromProgram,
);
