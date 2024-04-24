import { createUnplugin } from "unplugin"
import { ReplexicaAttributeScope, ReplexicaCompiler, ReplexicaContentScope, ReplexicaSkipScope } from "./../compiler";
import { ReplexicaOutputProcessor } from "./../output";
import path from 'path';
import { ReplexicaConfig, parseOptions } from "../options";

export const shouldTransformFile = (absoluteFilePath: string) => /\.(t|j)sx$/.test(absoluteFilePath); // jsx, tsx

export const transformFile = (code: string, absoluteFilePath: string, _options: Partial<ReplexicaConfig>) => {
  const options = parseOptions(_options);
  try {
    const relativeFilePath = path.relative(process.cwd(), absoluteFilePath);

    const compiler = ReplexicaCompiler.fromCode(code, relativeFilePath, options.rsc);  
    const outputProcessor = ReplexicaOutputProcessor.create(relativeFilePath, options);
    
      if (options.debug) {
        outputProcessor.saveAst(compiler.ast, 'pre');
      }
    
      compiler
      .withScope(ReplexicaSkipScope)
      .withScope(ReplexicaAttributeScope)
      .withScope(ReplexicaContentScope)
      .injectIntl();

    const result = compiler.generate();

    outputProcessor.saveBuildData(compiler.data);
    outputProcessor.saveFullSourceLocaleData(compiler.data);
    outputProcessor.saveClientSourceLocaleData(compiler.data);
    outputProcessor.saveStubLocaleData();

    if (options.debug) {
      outputProcessor.saveAst(compiler.ast, 'post');
      outputProcessor.saveOutput(result.code);
    }

    return {
      code: result.code,
      map: result.map,
    };
  } catch (error: any) {
    throw new ReplexicaError(error.message);
  }
};

export const basePlugin = createUnplugin<Partial<ReplexicaConfig>>((_options) => ({
  name: '@replexica/compiler',
  enforce: 'pre',
  transformInclude(id) {
    const result = shouldTransformFile(id);
    return result;
  },
  transform(code, absoluteFilePath) {
    const result = transformFile(code, absoluteFilePath, _options);
    return result;
  },
}));

class ReplexicaError extends Error {

}
