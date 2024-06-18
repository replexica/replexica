import { describe, expect, it } from 'vitest';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { extractI18n } from '.';

describe('iom', () => {
  function generateAstFromCode(code: string): t.File {
    return parse(code, { sourceType: 'module', plugins: ['jsx'] });
  }

  it('simple jsx element', () => {
    const code = `<title>My app</title>`;

    const ast = generateAstFromCode(code);
    const scope = extractI18n(ast, 'src/file.tsx');
    const scopeObj = scope?.toJSON();

    expect(scopeObj).toEqual({
      role: 'scope',
      type: 'js/program',
      id: '',
      explicit: false,
      name: '',
      hint: '',
      fragments: [],
      scopes: [{
        role: 'scope',
        type: 'jsx/element',
        id: '0',
        explicit: false,
        name: 'title',
        hint: '',
        fragments: [
          { role: 'fragment', type: 'jsx/text', id: '0', value: 'My app' }
        ],
        scopes: [],
      }],
    });
  });

  it('jsx element with explicit data-i18n attribute', () => {
    const code = `
      <header data-i18n>
        <h1>My app</h1>
        <p>This is a demo app</p>
      </header>
    `;

    const ast = generateAstFromCode(code);
    const scope = extractI18n(ast, 'src/file.tsx');
    const scopeObj = scope?.toJSON();

    expect(scopeObj).toEqual({
      role: 'scope',
      type: 'js/program',
      id: '',
      explicit: false,
      name: '',
      hint: '',
      fragments: [],
      scopes: [{
        role: 'scope',
        type: 'jsx/element',
        id: '0',
        explicit: true,
        name: '',
        hint: '',
        fragments: [],
        scopes: [
          {
            role: 'scope',
            type: 'jsx/element',
            id: '0.0',
            explicit: false,
            name: 'h1',
            hint: '',
            fragments: [
              { role: 'fragment', type: 'jsx/text', id: '0', value: 'My app' }
            ],
            scopes: [],
          },
          {
            role: 'scope',
            type: 'jsx/element',
            id: '0.1',
            explicit: false,
            name: 'p',
            hint: '',
            fragments: [
              { role: 'fragment', type: 'jsx/text', id: '0', value: 'This is a demo app' }
            ],
            scopes: [],
          }
        ],
      }],
    });
  });

  it('jsx element with text and sub-elements', () => {
    const code = `
      <p>
        Some other text
        <span>© 2030</span>
      </p>
    `;

    const ast = generateAstFromCode(code);
    const scope = extractI18n(ast, 'src/file.tsx');
    const scopeObj = scope?.toJSON();

    expect(scopeObj).toEqual({
      role: 'scope',
      type: 'js/program',
      id: '',
      explicit: false,
      name: '',
      hint: '',
      fragments: [],
      scopes: [{
        role: 'scope',
        type: 'jsx/element',
        id: '0',
        explicit: false,
        name: 'p',
        hint: '',
        fragments: [
          { role: 'fragment', type: 'jsx/text', id: '0', value: 'Some other text' },
          { role: 'fragment', type: 'jsx/text', id: '1', value: '© 2030' }
        ],
        scopes: [],
      }],
    });
  });

  it('explicit data-18n doesnt trigger a scope if the element would be a scope anyway', () => {
    const code = `
      <p data-i18n>Something</p>
    `;

    const ast = generateAstFromCode(code);
    const scope = extractI18n(ast, 'src/file.tsx');
    const scopeObj = scope?.toJSON();

    expect(scopeObj).toEqual({
      role: 'scope',
      type: 'js/program',
      id: '',
      explicit: false,
      name: '',
      hint: '',
      fragments: [],
      scopes: [{
        role: 'scope',
        type: 'jsx/element',
        id: '0',
        explicit: false,
        name: 'p',
        hint: '',
        fragments: [
          { role: 'fragment', type: 'jsx/text', id: '0', value: 'Something' }
        ],
        scopes: [],
      }],
    });
  });

  it('nested jsx elements', () => {
    const code = `
      <main>
        <p>
          Click
          <a href="/more">
            here
          </a>
          to learn more
        </p>
        <span>Some text</span>
      </main>
    `;

    const ast = generateAstFromCode(code);
    const scope = extractI18n(ast, 'src/file.tsx');
    const scopeObj = scope?.toJSON();

    expect(scopeObj).toEqual({
      role: 'scope',
      type: 'js/program',
      id: '',
      explicit: false,
      name: '',
      hint: '',
      fragments: [],
      scopes: [
        {
          role: 'scope',
          type: 'jsx/element',
          id: '0',
          explicit: false,
          name: 'p',
          hint: '',
          fragments: [
            { role: 'fragment', type: 'jsx/text', id: '0', value: 'Click' },
            { role: 'fragment', type: 'jsx/text', id: '1', value: 'here' },
            { role: 'fragment', type: 'jsx/text', id: '2', value: 'to learn more' }
          ],
          scopes: [],
        },
        {
          role: 'scope',
          type: 'jsx/element',
          id: '1',
          explicit: false,
          name: 'span',
          hint: '',
          fragments: [
            { role: 'fragment', type: 'jsx/text', id: '0', value: 'Some text' }
          ],
          scopes: [],
        }
      ],
    });
  });

  it('jsx element with an commonly localizable attribute', () => {
    const code = `
      <span title="Some label for the span">Some text</span>
    `;

    const ast = generateAstFromCode(code);
    const scope = extractI18n(ast, 'src/file.tsx');
    const scopeObj = scope?.toJSON();

    expect(scopeObj).toEqual({
      role: 'scope',
      type: 'js/program',
      id: '',
      explicit: false,
      name: '',
      hint: '',
      fragments: [],
      scopes: [
        {
          role: 'scope',
          type: 'jsx/element',
          id: '0',
          explicit: false,
          name: 'span',
          hint: '',
          fragments: [
            { role: 'fragment', type: 'jsx/text', id: '0', value: 'Some text' }
          ],
          scopes: [
            {
              role: 'scope',
              type: 'jsx/attribute',
              id: '0.0',
              explicit: false,
              name: 'title',
              hint: '',
              fragments: [
                { role: 'fragment', type: 'js/text', id: '0', value: 'Some label for the span' }
              ],
              scopes: [],
            }
          ],
        }
      ],
    });
  });

  it('jsx element with a subelement that must be skipped', () => {
    const code = `
      <main>
        <h1 data-i18n={false}>My Brand</h1>
        <p>Some text</p>
        <Text.Label.Prop.here>Some other text</Text.Label.Prop.here>
      </main>
    `;

    const ast = generateAstFromCode(code);
    const scope = extractI18n(ast, 'src/file.tsx');
    const scopeObj = scope?.toJSON();

    expect(scopeObj).toEqual({
      role: 'scope',
      type: 'js/program',
      id: '',
      explicit: false,
      name: '',
      hint: '',
      fragments: [],
      scopes: [
        {
          role: 'scope',
          type: 'jsx/skip',
          id: '0',
          explicit: true,
          name: 'h1',
          hint: '',
          fragments: [],
          scopes: [],
        },
        {
          role: 'scope',
          type: 'jsx/element',
          id: '1',
          explicit: false,
          name: 'p',
          hint: '',
          fragments: [
            { role: 'fragment', type: 'jsx/text', id: '0', value: 'Some text' }
          ],
          scopes: [],
        },
        {
          role: 'scope',
          type: 'jsx/element',
          id: '2',
          explicit: false,
          name: 'Text.Label.Prop.here',
          hint: '',
          fragments: [
            { role: 'fragment', type: 'jsx/text', id: '0', value: 'Some other text' }
          ],
          scopes: [],
        }
      ],
    });
  });

  it('complex nested jsx', () => {
    const code = `
      <>
        <title>My app</title>
        <header data-i18n>
          <h1>My app</h1>
          <p>This is a demo app</p>
        </header>
        <p data-i18n>
          Some other text
          <span>© 2030</span>
        </p>
        <main>
          <p>
            Click
            <a href="/more">
              here
            </a>
            to learn more
          </p>
          <span 
            title="Some text for the span" 
          >
            Some text
          </span>
        </main>
      </>
    `;

    const ast = generateAstFromCode(code);
    const scope = extractI18n(ast, 'src/file.tsx');
    const scopeObj = scope?.toJSON();

    expect(scopeObj).toMatchSnapshot();
  })
});
