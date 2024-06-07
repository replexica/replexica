import { describe, expect, it } from 'vitest';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { I18nScope, parseScopeFromAst } from '.';

describe('parse-i18n-scope', () => {
  function generateAstFromCode(code: string): t.File {
    return parse(code, { sourceType: 'module', plugins: ['jsx'] });
  }

  it('simple jsx element', () => {
    const code = `<title>My app</title>`;

    const ast = generateAstFromCode(code);
    const scope = parseScopeFromAst(ast);

    expect(scope).toEqual({
      role: 'scope',
      type: 'js/program',
      explicit: false,
      hint: '',
      fragments: [],
      scopes: [{
        role: 'scope',
        type: 'jsx/element',
        explicit: false,
        hint: '',
        fragments: [
          { role: 'fragment', type: 'text', value: 'My app' }
        ],
        scopes: [],
      }],
    } satisfies I18nScope);
  });

  it('jsx element with explicit data-i18n attribute', () => {
    const code = `
      <header data-i18n>
        <h1>My app</h1>
        <p>This is a demo app</p>
      </header>
    `;

    const ast = generateAstFromCode(code);
    const scope = parseScopeFromAst(ast);

    expect(scope).toEqual({
      role: 'scope',
      type: 'js/program',
      explicit: false,
      hint: '',
      fragments: [],
      scopes: [{
        role: 'scope',
        type: 'jsx/element',
        explicit: true,
        hint: '',
        fragments: [],
        scopes: [
          {
            role: 'scope',
            type: 'jsx/element',
            explicit: false,
            hint: '',
            fragments: [
              { role: 'fragment', type: 'text', value: 'My app' }
            ],
            scopes: [],
          },
          {
            role: 'scope',
            type: 'jsx/element',
            explicit: false,
            hint: '',
            fragments: [
              { role: 'fragment', type: 'text', value: 'This is a demo app' }
            ],
            scopes: [],
          }
        ],
      }],
    } satisfies I18nScope);
  });

  it('jsx element with text and sub-elements', () => {
    const code = `
      <p>
        Some other text
        <span>© 2030</span>
      </p>
    `;

    const ast = generateAstFromCode(code);
    const scope = parseScopeFromAst(ast);

    expect(scope).toEqual({
      role: 'scope',
      type: 'js/program',
      explicit: false,
      hint: '',
      fragments: [],
      scopes: [{
        role: 'scope',
        type: 'jsx/element',
        explicit: false,
        hint: '',
        fragments: [
          { role: 'fragment', type: 'text', value: 'Some other text' },
          { role: 'fragment', type: 'text', value: '© 2030' }
        ],
        scopes: [],
      }],
    } satisfies I18nScope);
  });

  it('explicit data-18n doesnt trigger a scope if the element would be a scope anyway', () => {
    const code = `
      <p data-i18n>Something</p>
    `;

    const ast = generateAstFromCode(code);
    const scope = parseScopeFromAst(ast);

    expect(scope).toEqual({
      role: 'scope',
      type: 'js/program',
      explicit: false,
      hint: '',
      fragments: [],
      scopes: [{
        role: 'scope',
        type: 'jsx/element',
        explicit: false,
        hint: '',
        fragments: [
          { role: 'fragment', type: 'text', value: 'Something' }
        ],
        scopes: [],
      }],
    } satisfies I18nScope);
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
    const scope = parseScopeFromAst(ast);

    expect(scope).toEqual({
      role: 'scope',
      type: 'js/program',
      explicit: false,
      hint: '',
      fragments: [],
      scopes: [
        {
          role: 'scope',
          type: 'jsx/element',
          explicit: false,
          hint: '',
          fragments: [
            { role: 'fragment', type: 'text', value: 'Click' },
            { role: 'fragment', type: 'text', value: 'here' },
            { role: 'fragment', type: 'text', value: 'to learn more' }
          ],
          scopes: [],
        },
        {
          role: 'scope',
          type: 'jsx/element',
          explicit: false,
          hint: '',
          fragments: [
            { role: 'fragment', type: 'text', value: 'Some text' }
          ],
          scopes: [],
        }
      ],
    } satisfies I18nScope);
  });

  it('jsx element with an commonly localizable attribute', () => {
    const code = `
      <span title="Some text for the span">Some text</span>
    `;

    const ast = generateAstFromCode(code);
    const scope = parseScopeFromAst(ast);

    expect(scope).toEqual({
      role: 'scope',
      type: 'js/program',
      explicit: false,
      hint: '',
      fragments: [],
      scopes: [
        {
          role: 'scope',
          type: 'jsx/element',
          explicit: false,
          hint: '',
          fragments: [
            { role: 'fragment', type: 'text', value: 'Some text' }
          ],
          scopes: [
            {
              role: 'scope',
              type: 'jsx/attribute',
              explicit: false,
              hint: '',
              fragments: [
                { role: 'fragment', type: 'text', value: 'Some text for the span' }
              ],
              scopes: [],
            }
          ],
        }
      ],
    } satisfies I18nScope);
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
    const scope = parseScopeFromAst(ast);

    expect(scope).toMatchSnapshot();
  })
});


/**
 * TODO:
 * 
 * Start with writing the entrypoint code in a declarative way.
 * Finish with adding unit tests for the LOM tree generation.
 * 
 * - Extract I18n Object Model from JSX AST (Scopes and Fragments) (Generate IDs for each scope and fragment)
 * - Loop through IOM scopes and inject React components for each fragment
 * - Generate a JSON file with the IOM tree
 * - Generate a JSON file with default values for each scope
 */