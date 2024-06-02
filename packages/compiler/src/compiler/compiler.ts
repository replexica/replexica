import * as t from "@babel/types";
import { traverse } from '@babel/core';
import { generateCodeFromBabelAst, parseCodeIntoBabelAst } from "../utils/babel";
import { generateFileId } from "../utils/id";
import { GeneratorResult } from "@babel/generator";
import { hasDirective } from "../utils/ast";
import { ReplexicaFileData, ReplexicaCompilerData } from "./types";
import { ReplexicaScopeExtractor } from "./scope";

export class ReplexicaCompiler {
  public static fromCode(code: string, relativeFilePath: string, rsc: boolean) {
    const ast = parseCodeIntoBabelAst(code);
    const isServer = !rsc ? false : !hasDirective(ast, 'use client');

    return new ReplexicaCompiler(relativeFilePath, code, ast, isServer);
  }

  private constructor(
    public readonly relativeFilePath: string,
    private readonly code: string,
    public readonly ast: t.File,
    private readonly isServer: boolean,
  ) {
    this.fileId = generateFileId(relativeFilePath, 0);
  }

  private readonly fileId: string;

  private _extractors: Set<ReplexicaScopeExtractor> = new Set();
  private _data: ReplexicaFileData = {};

  public withScope(extractor: ReplexicaScopeExtractor): this {
    this._extractors.add(extractor);
    return this;
  }

  public injectIntl(supportedLocales: string[]): this {
    const _compiler = this;
    traverse(this.ast, {
      enter(path) {
        try {
          for (const extractor of _compiler._extractors) {
            const scopes = extractor.fromNode(path);
            for (const scope of scopes) {
              const hints = scope.extractHints();
              const data = scope.injectIntl(
                _compiler.fileId, 
                _compiler.isServer,
                supportedLocales,
              );
              _compiler._data[scope.id] = { hints, data };
            }
          }
        } catch (thrownObject) {
          if (thrownObject === 'skip') {
            path.skip();
          } else {
            throw thrownObject;
          }
        }
      }
    });
    return this;
  }

  public get data(): ReplexicaCompilerData {
    return {
      [this.fileId]: {
        context: { isClient: !this.isServer },
        data: this._data,
      },
    };
  }

  public generate(): GeneratorResult {
    return generateCodeFromBabelAst(this.code, this.ast);
  }
}
