import { parse } from '@babel/parser';
import generate from '@babel/generator';

export const code = `
  function add(a, b) {
    return a + b;
  }
`;

export function compile(code: string) {
  const ast = parse(code);
  return generate(ast).code;
}