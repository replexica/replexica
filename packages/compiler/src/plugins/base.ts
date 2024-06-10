import { createUnplugin } from "unplugin"
import { ReplexicaConfig, parseOptions } from "../options";

export const shouldTransformFile = (absoluteFilePath: string) => /\.(t|j)sx$/.test(absoluteFilePath); // jsx, tsx

export const transformFile = (code: string, absoluteFilePath: string, _options: Partial<ReplexicaConfig>) => {
  return {
    code,
    map: null,
  };
};

export const basePlugin = createUnplugin<Partial<ReplexicaConfig>>((_options) => ({
  name: '@replexica/compiler',
  enforce: 'pre',
  transformInclude(id) {
    const result = shouldTransformFile(id) && id.endsWith('[locale]/layout.tsx');
    return result;
  },
  transform(code, absoluteFilePath) {
    const result = transformFile(code, absoluteFilePath, _options);
    return result;
  },
}));
