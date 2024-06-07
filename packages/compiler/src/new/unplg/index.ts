import { createUnplugin } from 'unplugin';
import Z from 'zod';
import { localeSchema } from '@replexica/spec';
import { CodeConverter } from './services/converter';
import { parseI18nScopeFromAst } from './parse-i18n-scope';
import { CodeArtifactor } from './services/artifactor';

const unplgConfigSchema = Z.object({
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
  locale: localeSchema,
});

export default createUnplugin<Z.infer<typeof unplgConfigSchema>>((_config) => ({
  name: 'replexica',
  enforce: 'pre',
  transformInclude(id) {
    // ts, tsx, js, jsx
    return /\.(t|j)sx?$/.test(id);
  },
  transform(code, fileId) {
    const config = unplgConfigSchema.parse(_config);
    const codeConverter = CodeConverter.fromCode(code);
    const { ast } = codeConverter.generateAst();
    
    const i18nTree = parseI18nScopeFromAst(ast);
    if (!i18nTree) { throw new Error(`Failed to parse i18n tree from code located at ${fileId}`); }

    const artifactor = CodeArtifactor.create({
      fileId,
      sourceLocale: config.locale.source,
    });
    artifactor.produceLocaleMeta(i18nTree);
    artifactor.produceDefaultLocaleData();

    return {
      code: code,
      map: null,
    };
  },
}));
