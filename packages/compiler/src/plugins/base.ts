import { createUnplugin } from "unplugin"
import { ReplexicaAttributeScope, ReplexicaCompiler, ReplexicaContentScope, ReplexicaSkipScope } from "./../compiler";
import { ReplexicaOutputProcessor } from "./../output";
import path from 'path';
import { ReplexicaConfig, parseOptions } from "../options";

export const basePlugin = createUnplugin<Partial<ReplexicaConfig>>((_options) => ({
  name: '@replexica/compiler',
  enforce: 'pre',
  transformInclude(id) {
    return /\.(t|j)sx?$/.test(id); // js, ts, jsx, tsx
  },
  transform(code, absoluteFilePath) {
    const options = parseOptions(_options);
    try {
      const relativeFilePath = path.relative(process.cwd(), absoluteFilePath);

      const compiler = ReplexicaCompiler
        .fromCode(code, relativeFilePath, options.rsc)
        .withScope(ReplexicaSkipScope)
        .withScope(ReplexicaAttributeScope)
        .withScope(ReplexicaContentScope)
        .injectIntl();
  
      const result = compiler.generate();
  
      const outputProcessor = ReplexicaOutputProcessor.create(relativeFilePath, options);
      outputProcessor.saveBuildData(compiler.data);
      outputProcessor.saveFullSourceLocaleData(compiler.data);
      outputProcessor.saveClientSourceLocaleData(compiler.data);
      outputProcessor.saveStubLocaleData();
  
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
