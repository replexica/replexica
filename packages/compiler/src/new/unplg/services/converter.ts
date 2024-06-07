import * as t from '@babel/types';
import { parse } from '@babel/parser';
import generate from '@babel/generator';

export class CodeConverter {
  public static fromCode(code: string) {
    return new CodeConverter(code);
  }

  private constructor(
    private readonly originalCode: string,
  ) { }

  public generateAst() {
    const ast = parse(this.originalCode, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    return { ast };
  }

  public generateUpdatedCode(ast: t.File) {
    return generate(ast, {}, this.originalCode);
  }
}
