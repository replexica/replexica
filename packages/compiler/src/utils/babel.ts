import * as t from '@babel/types';
import { parse } from '@babel/parser';
import generate from '@babel/generator';

export function parseCodeIntoBabelAst(code: string) {
  return parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
}

export function generateCodeFromBabelAst(code: string, ast: t.File) {
  return generate(ast, {}, code);
}