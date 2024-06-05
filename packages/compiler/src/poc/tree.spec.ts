import { describe, expect, it } from 'vitest';
import { parse } from '@babel/parser';
import { traverse } from '@babel/core';
import _ from 'lodash';
import { I18nNode, getFlatI18nNodes, getI18nTree } from './tree';

const code = `
  <>
    <header>
      <h1>My app</h1>
      <p>This is a demo app</p>
    </header>
    <main>
      <p>Click <a href="/about">here</a> to learn more</p>
      <aside>
        <div>
          <p>Some text</p>
        </div>
        <div>
          <p>Some other text</p>
        </div>
      </aside>
    </main>
    <footer>
      <p>&copy; 2030</p>
    </footer>
  </>
`;

describe('poc/tree', () => {
  it('should work', () => {
    const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });

    console.log('--- Tree ---');
    let result: I18nNode | null = null;
    traverse(ast, {
      Program(nodePath) {
        result = getI18nTree(nodePath);
      }
    });
    console.log(JSON.stringify(result, null, 2));

    // console.log('--- Nodes ---');
    // const nodes = getFlatI18nNodes(result);
    // console.log(JSON.stringify(nodes, null, 2));

    expect(ast).toBeDefined();
  });
});
