import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createPassThroughLoader(
  state: any,
): ILoader<void, string> {
  return createLoader({
    pull: async () => state.data,
    push: async (locale, data) => {
      state.data = data;
    },
  });
}
