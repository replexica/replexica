import { traverse } from '@babel/core';
import * as t from '@babel/types';

export type CodeImporterItem = {
  declaration: t.ImportDeclaration;
  name: string;
};

export class CodeImporter {
  public constructor(
    private readonly _ast: t.File,
  ) {}

  public upsertNamedImport(module: string, exportName: string): CodeImporterItem {
    let namedImport = this._findNamedImport(this._ast, module, exportName);

    if (!namedImport) {
      namedImport = this._createNamedImport(this._ast, module, exportName);
      this._ast.program.body.unshift(namedImport.declaration);
    }

    return namedImport;
  }

  public upsertDefaultImport(module: string, defaultName: string): CodeImporterItem {
    let defaultImport = this._findDefaultImport(this._ast, module);

    if (!defaultImport) {
      defaultImport = this._createDefaultImport(this._ast, module, defaultName);
      this._ast.program.body.unshift(defaultImport.declaration);
    }

    return defaultImport;
  }

  // 

  private _findImport(
    ast: t.File,
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

  private _findNamedImport(ast: t.File, moduleName: string, exportName: string): CodeImporterItem | null {
    return this._findImport(
      ast,
      moduleName,
      (specifier) =>
        t.isImportSpecifier(specifier)
        && t.isIdentifier(specifier.imported)
        && specifier.imported.name === exportName,
    );
  }

  private _findDefaultImport(ast: t.File, moduleName: string): CodeImporterItem | null {
    return this._findImport(
      ast,
      moduleName,
      t.isImportDefaultSpecifier,
    );
  }

  private _createImport(ast: t.File, moduleName: string, defaultName: string, isDefault: boolean): CodeImporterItem {
    const newIdentifierName = this._chooseUnusedIdentifierName(ast, defaultName);
    const specifier = isDefault ?
      t.importDefaultSpecifier(t.identifier(newIdentifierName)) :
      t.importSpecifier(t.identifier(newIdentifierName), t.identifier(defaultName));
    const importDeclaration = t.importDeclaration([specifier], t.stringLiteral(moduleName));

    return {
      declaration: importDeclaration,
      name: newIdentifierName,
    };
  }

  private _createNamedImport(ast: t.File, moduleName: string, exportName: string): CodeImporterItem {
    return this._createImport(ast, moduleName, exportName, false);
  }

  private _createDefaultImport(ast: t.File, moduleName: string, defaultName: string): CodeImporterItem {
    return this._createImport(ast, moduleName, defaultName, true);
  }

  private _chooseUnusedIdentifierName(ast: t.File, name: string): string {
    let result = name;
    let index = 0;
    while (this._isIdentifierNameUsed(ast, result)) {
      result = `${name}${index}`;
      index++;
    }
    return result;
  }

  private _isIdentifierNameUsed(ast: t.File, name: string): boolean {
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
