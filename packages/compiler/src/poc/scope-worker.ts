import { NodePath } from '@babel/core';
import * as t from '@babel/types';

// Scope fragments

type ScopeFragment = {
  type: 'text' | 'variable' | 'call';
  // nodePath: NodePath<t.Node>;
};

type ScopeFragmentExtractor = (nodePath: NodePath<t.Node>) => ScopeFragment | null;

const extractTextFragment = (nodePath: NodePath<t.Node>): ScopeFragment | null => {
  if (!nodePath.isJSXText()) { return null; }
  
  const jsxTextEl = nodePath.node as t.JSXText;
  const value = jsxTextEl.value.trim();
  if (!value) { return null; }

  return {
    type: 'text',
    // nodePath,
  };
};

const extractVariableFragment = (nodePath: NodePath<t.Node>): ScopeFragment | null => {
  if (!nodePath.isJSXExpressionContainer()) { return null; }
  
  const jsxExprEl = nodePath.node as t.JSXExpressionContainer;
  const expr = jsxExprEl.expression;
  if (!t.isIdentifier(expr)) { return null; }

  return {
    type: 'variable',
    // nodePath,
  };
};

const extractCallFragment = (nodePath: NodePath<t.Node>): ScopeFragment | null => {
  if (!nodePath.isCallExpression()) { return null; }
  
  const callExpr = nodePath.node as t.CallExpression;
  if (!t.isIdentifier(callExpr.callee)) { return null; }

  return {
    type: 'call',
    // nodePath,
  };
}

const extractMetaContentFragment = (nodePath: NodePath<t.Node>): ScopeFragment | null => {
  if (!nodePath.isJSXElement()) { return null; }

  const jsxEl = nodePath.node as t.JSXElement;
  if (!t.isJSXIdentifier(jsxEl.openingElement.name)) { return null; }

  const jsxIdentifier = jsxEl.openingElement.name as t.JSXIdentifier;
  if (jsxIdentifier.name !== 'meta') { return null; }

  const metaContent = jsxEl.openingElement.attributes.find((attr) => {
    if (!t.isJSXAttribute(attr)) { return false; }
    const jsxAttr = attr as t.JSXAttribute;
    if (!t.isJSXIdentifier(jsxAttr.name)) { return false; }
    const jsxIdentifier = jsxAttr.name as t.JSXIdentifier;
    return jsxIdentifier.name === 'content';
  }) as t.JSXAttribute | undefined;
  if (!metaContent) { return null; }

  return {
    type: 'text',
    // nodePath,
  };

}

const composeFragmentExtractors = (...extractors: ScopeFragmentExtractor[]) => {
  return (nodePath: NodePath<t.Node>): ScopeFragment | null => {
    for (const extractor of extractors) {
      const fragment = extractor(nodePath);
      if (fragment) { return fragment; }
    }
    return null;
  };
};

const extractExpressionFragment = composeFragmentExtractors(
  extractVariableFragment,
  extractCallFragment,
);

const extractFragment = composeFragmentExtractors(
  extractMetaContentFragment,
  extractTextFragment,
  extractExpressionFragment,
);

// Scopes

type Scope = {
  type: 'program' | 'dom' | 'dom/meta';
  // nodePath: NodePath<t.Node>;
};

type ScopeExtractor = (rootNodePath: NodePath<t.Node>) => Scope | null;

const extractDomScope = (rootNodePath: NodePath<t.Node>): Scope | null => {
  const isJsxEl = t.isJSXElement(rootNodePath.node);
  if (!isJsxEl) { return null; }

  const jsxEl = rootNodePath.node as t.JSXElement;
  const jsxTextChildren = jsxEl.children.filter((c) => t.isJSXText(c)) as t.JSXText[];
  const nonEmptyJsxTextChildren = jsxTextChildren.filter((c) => c.value.trim());
  if (!nonEmptyJsxTextChildren.length) { return null; }

  const parentJsxEl = rootNodePath.findParent((p) => t.isJSXElement(p.node)) as NodePath<t.JSXElement> | null;
  const jsxTextSiblings = parentJsxEl?.node.children.filter((c) => t.isJSXText(c)) as t.JSXText[] | null;
  const nonEmptyJsxTextSiblings = jsxTextSiblings?.filter((c) => c.value.trim()) || [];
  if (nonEmptyJsxTextSiblings.length) { return null; }

  return {
    type: 'dom',
    // nodePath: rootNodePath,
  };
};

const extractMetaElementScope = (rootNodePath: NodePath<t.Node>): Scope | null => {
  if (!rootNodePath.isJSXElement()) { return null; }

  const jsxEl = rootNodePath.node as t.JSXElement;
  if (!t.isJSXIdentifier(jsxEl.openingElement.name)) { return null; }

  const jsxIdentifier = jsxEl.openingElement.name as t.JSXIdentifier;
  if (jsxIdentifier.name !== 'meta') { return null; }

  return {
    type: 'dom/meta',
    // nodePath: rootNodePath,
  };
}

const extractProgramScope = (rootNodePath: NodePath<t.Node>): Scope | null => {
  if (!rootNodePath.isProgram()) { return null; }

  return {
    type: 'program',
    // nodePath: rootNodePath,
  };
}

const composeScopeExtractors = (...extractors: ScopeExtractor[]) => 
  (rootNodePath: NodePath<t.Node>): Scope | null => {
    for (const extractor of extractors) {
      const scope = extractor(rootNodePath);
      if (scope) { return scope; }
    }
    return null;
  };

const extractScope = composeScopeExtractors(
  extractMetaElementScope,
  extractDomScope,
  extractProgramScope,
);

export function findScopes(rootNodePath: NodePath<t.Node>, depth = 0) {
  const scopes: [Scope, ScopeFragment[]][] = [];

  const scope = extractScope(rootNodePath);
  if (!scope) { return scopes; }
  
  console.log(' '.repeat(depth * 2), rootNodePath.node.type + ' ' + (scope ? ` - ${scope.type}` : ''));
  
  const fragments: ScopeFragment[] = [];
  scopes.push([scope, fragments]);

  rootNodePath.traverse({
    enter(nodePath) {
      const newScopes = findScopes(nodePath, depth + 1);
      if (!newScopes.length) {
        const fragment = extractFragment(nodePath);
        if (fragment) {
          fragments.push(fragment);
        }
      } else {
        scopes.push(...newScopes);
        nodePath.skip();
      }
    }
  });

  return scopes;
}
