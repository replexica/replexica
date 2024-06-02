import * as t from '@babel/types';
import { parse } from '@babel/parser';
import generate from '@babel/generator';

export class CodeConverter {
  constructor(
    private readonly originalCode: string,
  ) { }

  public generateAstFromCode(code: string) {
    return parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  }

  public generateCodeFromAst(ast: t.File) {
    return generate(ast, {}, this.originalCode);
  }
}