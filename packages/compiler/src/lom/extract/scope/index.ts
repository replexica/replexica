import { composeParsers } from "../_core";
import { fromJsxElement } from "./parsers";

export default composeParsers(
  'scope',
  fromJsxElement,
);
