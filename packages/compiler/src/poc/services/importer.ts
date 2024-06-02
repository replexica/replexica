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

  public findNamedImport(moduleName: string, exportName: string): CodeImporterItem | null {
    return this._findImport(
      moduleName,
      (specifier) =>
        t.isImportSpecifier(specifier)
        && t.isIdentifier(specifier.imported)
        && specifier.imported.name === exportName,
    );
  }

  public findDefaultImport(moduleName: string): CodeImporterItem | null {
    return this._findImport(
      moduleName,
      t.isImportDefaultSpecifier,
    );
  }

  public upsertNamedImport(module: string, exportName: string): CodeImporterItem {
    let namedImport = this.findNamedImport(module, exportName);

    if (!namedImport) {
      namedImport = this._createNamedImport(module, exportName);
      this._ast.program.body.unshift(namedImport.declaration);
    }

    return namedImport;
  }

  public upsertDefaultImport(module: string, defaultName: string): CodeImporterItem {
    let defaultImport = this.findDefaultImport(module);

    if (!defaultImport) {
      defaultImport = this._createDefaultImport(module, defaultName);
      this._ast.program.body.unshift(defaultImport.declaration);
    }

    return defaultImport;
  }

  // 

  private _findImport(
    moduleName: string,
    specifierCheck: (specifier: t.Node) => boolean,
  ): CodeImporterItem | null {
    let result: CodeImporterItem | null = null;

    traverse(this._ast, {
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

  private _createImport(moduleName: string, defaultName: string, isDefault: boolean): CodeImporterItem {
    const newIdentifierName = this._chooseUnusedIdentifierName(defaultName);
    const specifier = isDefault ?
      t.importDefaultSpecifier(t.identifier(newIdentifierName)) :
      t.importSpecifier(t.identifier(newIdentifierName), t.identifier(defaultName));
    const importDeclaration = t.importDeclaration([specifier], t.stringLiteral(moduleName));

    return {
      declaration: importDeclaration,
      name: newIdentifierName,
    };
  }

  private _createNamedImport(moduleName: string, exportName: string): CodeImporterItem {
    return this._createImport(moduleName, exportName, false);
  }

  private _createDefaultImport(moduleName: string, defaultName: string): CodeImporterItem {
    return this._createImport(moduleName, defaultName, true);
  }

  private _chooseUnusedIdentifierName(name: string): string {
    let result = name;
    let index = 0;
    while (this._isIdentifierNameUsed(result)) {
      result = `${name}${index}`;
      index++;
    }
    return result;
  }

  private _isIdentifierNameUsed(name: string): boolean {
    let result = false;
    traverse(this._ast, {
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
