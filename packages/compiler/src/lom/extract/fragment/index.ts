import { composeParsers } from "../_utils";
import { fromNonEmptyJsxText } from "./jsx-text";

export default composeParsers(
  'fragment',
  fromNonEmptyJsxText,
);
