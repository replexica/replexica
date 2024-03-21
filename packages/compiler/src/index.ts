import { parse } from '@babel/parser';
import generate from '@babel/generator';

const code = `
  function add(a, b) {
    return a + b;
  }
`;

function compile(code: string) {
  const ast = parse(code);
  return generate(ast).code;
}

export default {
  code,
  compile,
};
