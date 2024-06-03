import { createUnplugin } from "unplugin"
import { ReplexicaConfig, parseOptions } from "../options";
import poc from "../poc";

export const shouldTransformFile = (absoluteFilePath: string) => /\.(t|j)sx$/.test(absoluteFilePath); // jsx, tsx

export const transformFile = (code: string, absoluteFilePath: string, _options: Partial<ReplexicaConfig>) => {
  const options = parseOptions(_options);
  const codeOverride = `
  <>
    <title>Next App Demo</title>
    <meta name="description" content="Next.js App Router Demo" />
    <div>
      Introducing
      <h1>Next.js App Router Demo</h1>
      <p>With <b>i18n</b> support</p>
    </div>
  </>
  `

  const result = poc({
    code: codeOverride,
    filePath: absoluteFilePath,
    supportedLocales: [...new Set([options.locale.source, ...options.locale.targets])],
  });

  if (1 > 0.1) {
    throw new Error('Stop.');
  }

  return result;
  // try {
  //   const relativeFilePath = path.relative(process.cwd(), absoluteFilePath);

  //   const compiler = ReplexicaCompiler.fromCode(code, relativeFilePath, options.rsc);
  //   const outputProcessor = ReplexicaOutputProcessor.create(relativeFilePath, options);

  //   if (options.debug) {
  //     outputProcessor.saveAst(compiler.ast, 'pre');
  //   }

  //   const supportedLocales = [...new Set([options.locale.source, ...options.locale.targets])];
  //   compiler
  //     // .withScope(ReplexicaSkipScope)
  //     // .withScope(ReplexicaAttributeScope)
  //     .withScope(ReplexicaContentScope)
  //     .injectIntl(supportedLocales);

  //   const result = compiler.generate();

  //   outputProcessor.saveBuildData(compiler.data);
  //   outputProcessor.saveFullSourceLocaleData(compiler.data);
  //   outputProcessor.saveStubLocaleData();

  //   if (options.debug) {
  //     outputProcessor.saveAst(compiler.ast, 'post');
  //     outputProcessor.saveOutput(result.code);
  //   }

  //   return {
  //     code: result.code,
  //     map: result.map,
  //   };
  // } catch (error: any) {
  //   throw new ReplexicaError(error.message);
  // }
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

class ReplexicaError extends Error {

}
