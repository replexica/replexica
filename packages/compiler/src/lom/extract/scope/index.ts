import { composeParsers } from "../_utils";
import { fromJsxElement } from "./parsers";

export default composeParsers(
  'scope',
  fromJsxElement,
);
