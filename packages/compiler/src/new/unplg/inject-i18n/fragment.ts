import * as t from '@babel/types';
import { I18nFragment, I18nScope } from '../_types';
import createCodeWriter from '../services/writer';
import { NEXTJS_FRAGMENT_IMPORT_MODULE, NEXTJS_FRAGMENT_IMPORT_NAME } from './_const';

export default function createFragmentInjector(ast: t.File) {
  return (i18nTree: I18nScope) => {
    _traverseI18nTree(i18nTree, (fragmentOrScope) => {
      if (fragmentOrScope.role !== 'fragment') { return; }

      const fragment = fragmentOrScope as I18nFragment;
      if (fragment.type === 'jsx/text') {
        const writer = createCodeWriter(ast);
        const importName = writer.upsertNamedImport(NEXTJS_FRAGMENT_IMPORT_MODULE, NEXTJS_FRAGMENT_IMPORT_NAME);

        const id = 'test-id';
        const fragmentComponent = t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier(importName.name),
            [t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral(id))]
          ),
          null,
          [],
          true
        );

        fragment.nodePath.replaceWith(fragmentComponent);
      }
    });
  };

  function _traverseI18nTree(
    tree: I18nScope | I18nFragment,
    visitor: (node: I18nScope | I18nFragment) => void
  ) {
    visitor(tree);
    if (tree.role === 'scope') {
      for (const fragment of tree.fragments) {
        _traverseI18nTree(fragment, visitor);
      }
      for (const scope of tree.scopes) {
        _traverseI18nTree(scope, visitor);
      }
    }
  }
}
