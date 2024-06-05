import { describe, expect, it } from 'vitest';
import { parse } from '@babel/parser';
import { traverse } from '@babel/core';
import _ from 'lodash';
import { I18nNode, createI18nNode } from './tree';
import fs from 'fs';
import path from 'path';

const code = `
  /* @i18n landing page */

  <>
    <div data-i18n="landing page template component">
      <header>
        <h1>My app</h1> {/* -1- */}
        <p>This is a demo app</p> {/* -2- */}
      </header>
      <main>
        <p>Click <a href="/about">here</a> to learn more</p> {/* -3- */}
        <aside>
          <div>
            <p>Some text</p> {/* -4- */}
          </div>
          <div>
            <p>Some other text</p> {/* -5- */}
          </div>
        </aside>
      </main>
      <footer>
        <p>&copy; 2030</p> {/* -6- */}
      </footer>
    </div>
  </>
`;

describe('poc/tree', () => {
  it('should work', () => {
    const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });

    console.log('--- Tree ---');
    let result: I18nNode | null = null;
    traverse(ast, {
      Program(nodePath) {
        nodePath.stop();
        result = createI18nNode(nodePath);
      }
    });

    const treeJsonPath = path.resolve(__dirname, 'tree.json');
    fs.writeFileSync(treeJsonPath, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));

    expect(ast).toBeDefined();
  });
});
