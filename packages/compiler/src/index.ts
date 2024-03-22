import { createUnplugin } from "unplugin"
import { ReplexicaAttributeScope, ReplexicaCompiler, ReplexicaContentScope, ReplexicaSkipScope } from "./compiler";
import { ReplexicaOutputProcessor } from "./output";
import path from 'path';
import { createNextPlugin } from "./plugins";
import { ReplexicaConfig } from "./types";

const unplugin = createUnplugin<ReplexicaConfig>((options) => ({
  name: '@replexica/compiler',
  enforce: 'pre',
  transformInclude(id) {
    // .tsx and .jsx files
    return /\.(t|j)sx$/.test(id);
  },
  transform(code, absoluteFilePath) {
    try {
      const relativeFilePath = path.relative(process.cwd(), absoluteFilePath);
      
      const relativeFileDir = path.relative(process.cwd(), path.dirname(absoluteFilePath));

      const compiler = ReplexicaCompiler
        .fromCode(code, relativeFilePath)
        .withScope(ReplexicaSkipScope)
        .withScope(ReplexicaAttributeScope)
        .withScope(ReplexicaContentScope)
        .injectIntl();
  
      const result = compiler.generate();
  
      const outputProcessor = ReplexicaOutputProcessor.create(relativeFilePath, options);
      outputProcessor.saveData(compiler.data);
      outputProcessor.saveFullSourceLocaleData(compiler.data);
      outputProcessor.saveClientSourceLocaleData(compiler.data);
  
      if (options.debug) {
        outputProcessor.saveAst(compiler.ast);
        outputProcessor.saveOutput(result.code);
      }
  
      return {
        code: result.code,
        map: result.map,
      };
    } catch (error: any) {
      throw new ReplexicaError(error.message);
    }
  },
}));

class ReplexicaError extends Error {

}
export * from './types';
export default {
  next: createNextPlugin(unplugin),
};
