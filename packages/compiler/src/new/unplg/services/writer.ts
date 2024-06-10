import { traverse } from '@babel/core';
import * as t from '@babel/types';

export type CodeImporterItem = {
  declaration: t.ImportDeclaration;
  name: string;
};

export default function createCodeWriter(ast: t.File) {
  return {
    findNamedImport(moduleName: string, exportName: string): CodeImporterItem | null {
      return _findImport(
        moduleName,
        (specifier) =>
          t.isImportSpecifier(specifier)
          && t.isIdentifier(specifier.imported)
          && specifier.imported.name === exportName,
      );
    },
    findDefaultImport(moduleName: string): CodeImporterItem | null {
      return _findImport(
        moduleName,
        t.isImportDefaultSpecifier,
      );
    },
    upsertNamedImport(module: string, exportName: string): CodeImporterItem {
      let namedImport = this.findNamedImport(module, exportName);

      if (!namedImport) {
        namedImport = _createNamedImport(module, exportName);
        ast.program.body.unshift(namedImport.declaration);
      }

      return namedImport;
    },
    upsertDefaultImport(module: string, defaultName: string): CodeImporterItem {
      let defaultImport = this.findDefaultImport(module);

      if (!defaultImport) {
        defaultImport = _createDefaultImport(module, defaultName);
        ast.program.body.unshift(defaultImport.declaration);
      }

      return defaultImport;
    },
  };

  // helper functions

  function _findImport(
    moduleName: string,
    specifierCheck: (specifier: t.Node) => boolean,
  ): CodeImporterItem | null {
    let result: CodeImporterItem | null = null;

    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === moduleName) {
          const specifier = path.node.specifiers.find(specifierCheck);

          if (specifier) {
            result = {
              declaration: path.node,
              name: specifier.local.name,
            };
            path.stop();
          }
        }
      },
    });

    return result;
  }

  function _createImport(moduleName: string, defaultName: string, isDefault: boolean): CodeImporterItem {
    const newIdentifierName = _chooseUnusedIdentifierName(defaultName);
    const specifier = isDefault ?
      t.importDefaultSpecifier(t.identifier(newIdentifierName)) :
      t.importSpecifier(t.identifier(newIdentifierName), t.identifier(defaultName));
    const importDeclaration = t.importDeclaration([specifier], t.stringLiteral(moduleName));

    return {
      declaration: importDeclaration,
      name: newIdentifierName,
    };
  }

  function _createNamedImport(moduleName: string, exportName: string): CodeImporterItem {
    return _createImport(moduleName, exportName, false);
  }

  function _createDefaultImport(moduleName: string, defaultName: string): CodeImporterItem {
    return _createImport(moduleName, defaultName, true);
  }

  function _chooseUnusedIdentifierName(name: string): string {
    let result = name;
    let index = 0;
    while (_isIdentifierNameUsed(result)) {
      result = `${name}${index}`;
      index++;
    }
    return result;
  }

  function _isIdentifierNameUsed(name: string): boolean {
    let result = false;
    traverse(ast, {
      Identifier(path) {
        if (path.node.name === name) {
          result = true;
          path.stop();
        }
      },
    });
    return result;
  }
}