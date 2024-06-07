import { createCompiler } from "./_utils";
import next from "./next";
import stub from "./stub";

export default createCompiler({
  next,
  stub,
});
