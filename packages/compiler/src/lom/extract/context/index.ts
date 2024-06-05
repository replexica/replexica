import { composeParsers } from "../_utils";
import { fromProgram } from "./program";

export default composeParsers(
  'scope',
  fromProgram,
);
