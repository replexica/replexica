import { describe, expect, it } from 'vitest';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { NodePath, traverse } from '@babel/core';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { getJsxElementName } from './_ast';

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

/*

1. <title>My app</title> yields:

{
  role: 'scope',
  type: 'jsx/element/title',
  fragments: [{ role: 'fragment', type: 'text', value: 'My app' }]
}

2. <header data-i18n> yields:

{
  role: 'scope',
  type: 'jsx/element/header',
  hint: '',
  explicit: true,
  fragments: [
    { 
      role: 'scope', 
      type: 'jsx/element/h1',
      fragments: [{ role: 'fragment', type: 'text', value: 'My app' }]
   },
    { 
      role: 'scope', 
      type: 'jsx/element/p',
      fragments: [{ role: 'fragment', type: 'text', value: 'This is a demo app' }]
   }
  ]
}

3. <p>Some other text<span>© 2030</span></p> yields:

{
  role: 'scope',
  type: 'jsx/element/p',
  explicit: false,
  hint: '',
  fragments: [
    { role: 'fragment', type: 'text', value: 'Some other text' },
    { role: 'fragment', type: 'text', value: '© 2030' }
  ]
}

4. <p>Click<a href="/more">here</a>to learn more</p> yields:

{
  role: 'scope',
  type: 'jsx/element/p',
  fragments: [
    { role: 'fragment', type: 'text', value: 'Click' },
    { role: 'fragment', type: 'text', value: 'here' },
    { role: 'fragment', type: 'text', value: 'to learn more' }
  ]
}

5/6/7. <span title="Some text for the span" aria-label="Some text for the span (aria)">Some text</span> yields:

{
  role: 'scope',
  type: 'jsx/element/span',
  fragments: [{ role: 'fragment', type: 'text', value: 'Some text' }],
  scopes: [
    {
      role: 'scope',
      type: 'jsx/attribute/title',
      fragments: [{ role: 'fragment', type: 'text', value: 'Some text for the span' }]
    }
  ],
}
*/

type I18nNode<R extends 'scope' | 'fragment'> = {
  role: R;
};

type I18nScope = I18nNode<'scope'> & {
  type: string;
  hint: string;
  explicit: boolean;
  fragments: I18nFragment[];
  scopes: I18nScope[];
  parseFragments?: I18nFragmentsParser;
};

type I18nFragment = I18nNode<'fragment'> & {
  type: string;
  value: string;
};

type I18nScopeParser = {
  (nodePath: NodePath<t.Node>): I18nScope | null;
};

type I18nFragmentsParser = {
  (nodePath: NodePath<t.Node>): I18nFragment[];
}

const commonStringAttributes = [
  'title', // Used to render a tooltip when the user hovers over the element
  'alt', // Used to provide a text alternative for images
  'placeholder', // Used to provide a hint to the user of what can be entered in the input
  'label', // Used to provide a label for form elements
];

const fragmentParsers: Record<string, I18nFragmentsParser> = {
  jsxText: (nodePath) => {
    const result: I18nFragment[] = [];

    nodePath.traverse({
      JSXText(childPath: NodePath<t.JSXText>) {
        const jsxText = childPath.node;
        const value = jsxText.value.trim();
        if (!value) { return null; }
      
        result.push({
          role: 'fragment',
          type: 'text',
          value,
        });
      },
    });

    return result;
  },
  attribute: (nodePath) => {
    console.log(`Parsing JSX attribute fragments: ${nodePath.node.type}`);
    if (!t.isJSXAttribute(nodePath.node)) { return []; }
  
    const jsxAttr = nodePath.node;
  
    const jsxAttrValue = jsxAttr.value;
    // Only string literals are supported for now
    if (!t.isStringLiteral(jsxAttrValue)) { return []; }
  
    const jsxAttrName = jsxAttr.name.name;
    if (!(typeof jsxAttrName === 'string')) { return []; }
    if (!commonStringAttributes.includes(jsxAttrName)) { return []; }
  
    return [{
      role: 'fragment',
      type: 'text',
      value: jsxAttrValue.value,
    }];
  },
};

const scopeParsers: Record<string, I18nScopeParser> = {
  fromProgram: (nodePath) => {
    if (!t.isProgram(nodePath.node)) { return null; }
  
    return {
      role: 'scope',
      type: 'js/program',
      hint: '',
      explicit: false,
      fragments: [],
      scopes: [],
    };
  },
  jsxElement: (nodePath)=> {
    if (!t.isJSXElement(nodePath.node) && !t.isJSXFragment(nodePath.node)) { return null; }
  
    const jsxEl = nodePath.node;
    const jsxTextChildren = jsxEl.children.filter((c) => t.isJSXText(c)) as t.JSXText[];
    const nonEmptyJsxTextChildren = jsxTextChildren.filter((c) => c.value.trim());
    const hasNonEmptyJsxTextChildren = nonEmptyJsxTextChildren.length > 0;
    if (!hasNonEmptyJsxTextChildren) { return null; }
  
    const jsxParentEl = nodePath.findParent((p) => t.isJSXElement(p.node) || t.isJSXFragment(p.node)) as NodePath<t.JSXElement | t.JSXFragment> | null;
    const siblingJsxTextChildren = jsxParentEl?.node.children.filter((c) => t.isJSXText(c)) as t.JSXText[];
    const nonEmptySiblingJsxTextChildren = siblingJsxTextChildren.filter((c) => c.value.trim());
    const hasNonEmptySiblingJsxTextChildren = nonEmptySiblingJsxTextChildren.length > 0;
    if (hasNonEmptySiblingJsxTextChildren) { return null; }
  
    const elementName = getJsxElementName(jsxEl);
  
    return {
      role: 'scope',
      type: `jsx/element/${elementName}`,
      hint: '',
      explicit: false,
      fragments: [],
      scopes: [],
      parseFragments: fragmentParsers.jsxText,
    };
  },
  explictiJsxElement: (nodePath) => {
    if (!t.isJSXElement(nodePath.node)) { return null; }
  
    const i18nAttr = nodePath.node.openingElement.attributes.find((a) => {
      if (!t.isJSXAttribute(a)) { return false; }
      return a.name.name === 'data-i18n';
    }) as t.JSXAttribute | undefined;
    if (!i18nAttr) { return null; }
  
    const jsxEl = nodePath.node;
  
    const elementName = getJsxElementName(jsxEl);
  
    return {
      role: 'scope',
      type: `jsx/element/${elementName}`,
      hint: '',
      explicit: true,
      fragments: [],
      scopes: [],
    };
  },
  jsxAttribute: (nodePath) => {
    if (!t.isJSXAttribute(nodePath.node)) { return null; }
  
    const jsxAttr = nodePath.node;
  
    const jsxAttrValue = jsxAttr.value;
    // Only string literals are supported for now
    if (!t.isStringLiteral(jsxAttrValue)) { return null; }
  
    const jsxAttrName = jsxAttr.name.name;
    if (!(typeof jsxAttrName === 'string')) { return null; }
    if (!commonStringAttributes.includes(jsxAttrName)) { return null; }
    
    return {
      role: 'scope',
      type: `jsx/attribute/${jsxAttrName}`,
      hint: '',
      explicit: false,
      fragments: [],
      scopes: [],
      parseFragments: fragmentParsers.attribute,
    };
  },
};

const composeScopeParsers = (...parsers: I18nScopeParser[]): I18nScopeParser => {
  return (nodePath) => {
    for (const parser of parsers) {
      const result = parser(nodePath);
      if (result) { return result; }
    }

    return null;
  };
};

const tryParseScope = composeScopeParsers(
  ...Object.values(scopeParsers),
);

const extractI18nScope = (nodePath: NodePath<t.Node>): I18nScope | null => {
  const scope = tryParseScope(nodePath);
  if (!scope) { return null; }

  nodePath.skip();

  const fragments = scope.parseFragments?.(nodePath) || [];
  scope.fragments.push(...fragments);

  nodePath.traverse({
    enter(childPath) {
      const childScope = extractI18nScope(childPath);
      if (childScope) {
        scope.scopes.push(childScope);
      }
    }
  });

  return scope;
};

// Run

describe('poc/tree', () => {
  it('should work', () => {
    const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });

    console.log('--- Tree ---');
    let result: I18nScope | null = null;
    traverse(ast, {
      Program(nodePath) {
        nodePath.stop();
        result = extractI18nScope(nodePath);
      }
    });

    const treeJsonPath = path.resolve(__dirname, 'tree.json');
    fs.writeFileSync(treeJsonPath, JSON.stringify(result, null, 2));

    expect(true).toBe(true);
  });
});
