import { composeParsers } from "../_core";
import { fromNonEmptyJsxText } from "./jsx-text";

export default composeParsers(
  'fragment',
  fromNonEmptyJsxText,
);
