import * as t from "@babel/types";
import { createScopeParser } from "./_utils";

export const programScopeParser = createScopeParser<t.Program>({
  selector: (nodePath) => t.isProgram(nodePath.node),
  parseFragments: () => [],
  type: 'js/program',
  explicit: false,
});
