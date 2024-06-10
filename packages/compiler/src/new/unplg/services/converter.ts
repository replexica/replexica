import * as t from '@babel/types';
import { parse } from '@babel/parser';
import generate from '@babel/generator';

export default function createCodeConverter(originalCode: string) {
  return {
    generateAst() {
      const ast = parse(originalCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });
      return { ast };
    },
    generateUpdatedCode(ast: t.File) {
      return generate(ast, {}, originalCode);
    },
  };
}