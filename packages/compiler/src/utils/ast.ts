import * as t from "@babel/types";
import { traverse, NodePath } from "@babel/core";
import { trimSafely } from "./text";

export function attributeExists(path: NodePath<t.JSXElement>, name: string) {
  const openingElement = path.get("openingElement");
  return openingElement.node.attributes.some((attr) => {
    if (!t.isJSXAttribute(attr)) { return false; }
    const result = t.isJSXIdentifier(attr.name) && attr.name.name === name;
    return result;
  });
}

export function findImmediateJsxParent(path: NodePath<t.Node>): NodePath<t.JSXElement | t.JSXFragment> | null {
  const parentPath = path.parentPath;
  if (parentPath?.isJSXElement()) {
    return parentPath;
  } else if (parentPath?.isJSXFragment()) {
    return parentPath;
  } else {
    return null;
  }
}

export function hasJsxTextChildren(jsxElement: NodePath<t.JSXElement | t.JSXFragment>): boolean {
  return jsxElement.node.children.some(child => t.isJSXText(child) && trimSafely(child.value).trim().length > 0);
}

export function getJsxParentLine(path: NodePath<t.JSXElement | t.JSXFragment>, parentLine: NodePath<t.JSXElement | t.JSXFragment>[] = [path]): NodePath<t.JSXElement | t.JSXFragment>[] {
  const jsxElementParent = findImmediateJsxParent(path);
  if (!jsxElementParent) { return parentLine; }

  return getJsxParentLine(jsxElementParent, [...parentLine, jsxElementParent]);
}

export function hasDirective(ast: t.File, directive: string): boolean {
  let found = false;
  traverse(ast, {
    Program(path) {
      path.node.directives.forEach((directiveNode) => {
        if (t.isDirective(directiveNode) && directiveNode.value.value === directive) {
          found = true;
        }
      });
    },
  });
  return found;
}

export function getImportName(programNode: NodePath<t.Program>, libName: string, localName: string): string | null {
  let found = false;

  programNode.traverse({
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (source !== libName) { return; }

      const specifier = path.node.specifiers.find((specifier) =>
        t.isImportSpecifier(specifier) &&
        t.isIdentifier(specifier.local) &&
        specifier.local.name === localName
      );

      if (specifier) {
        found = true;
      }
    },
  });

  return found ? localName : null;
}

export function injectImport(programNode: NodePath<t.Program>, libName: string, localName: string): string {
  let libImportName = `_${localName}`;

  const helperName = getImportName(programNode, libName, libImportName);
  if (helperName) { return helperName; }

  let uniqueId = 0;
  while (programNode.scope.hasBinding(libImportName)) {
    libImportName = `${libImportName}${++uniqueId}`;
  }

  const importStatement = t.importDeclaration(
    [t.importSpecifier(t.identifier(libImportName), t.identifier(localName))],
    t.stringLiteral(libName),
  );
  programNode.node.body.unshift(importStatement);

  return libImportName;
}

export function findJsxParentForTheAttribute(path: NodePath<t.JSXAttribute>): NodePath<t.JSXElement> | null {
  const openingElement = path.parentPath.isJSXOpeningElement() ? path.parentPath : null;
  if (!openingElement) { return null; }

  const jsxElement = openingElement.parentPath.isJSXElement() ? openingElement.parentPath : null;
  return jsxElement;
}

export function parseMemberExpressionFromJsxMemberExpression(
  jsxMemberExpression: t.JSXMemberExpression,
): t.MemberExpression {
  if (t.isJSXIdentifier(jsxMemberExpression.object)) {
    return t.memberExpression(
      t.identifier(jsxMemberExpression.object.name),
      t.identifier(jsxMemberExpression.property.name),
    );
  } else if (t.isJSXMemberExpression(jsxMemberExpression.object)) {
    return t.memberExpression(
      parseMemberExpressionFromJsxMemberExpression(jsxMemberExpression.object),
      t.identifier(jsxMemberExpression.property.name),
    );
  } else {
    throw new Error(`Unsupported JSXMemberExpression object type.`);
  }
}

export function getStringAttributeValue(path: NodePath<t.JSXElement>, attributeName: string): string | null {
  const attribute = path.node.openingElement.attributes.find((attr) => {
    return t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === attributeName;
  }) as t.JSXAttribute | undefined;

  if (!attribute) { return null; }
  if (!attribute.value) { return null; }
  if (!t.isStringLiteral(attribute.value)) { return null; }

  return attribute.value.value;
}

export function getJsxElementName(path: NodePath<t.JSXElement | t.JSXFragment>): string {
  if (t.isJSXFragment(path.node)) {
    return "Fragment";
  } else if (t.isJSXIdentifier(path.node.openingElement.name)) {
    return path.node.openingElement.name.name;
  } else if (t.isJSXMemberExpression(path.node.openingElement.name)) {
    return path.node.openingElement.name.property.name;
  } else {
    throw new Error(`Unsupported JSXElement name type: ${path.node.openingElement.name.type}`);
  }
}

export function getJsxAttributeName(path: NodePath<t.JSXAttribute>): string {
  if (t.isJSXIdentifier(path.node.name)) {
    return path.node.name.name;
  } else {
    throw new Error(`Unsupported JSXAttribute name type: ${path.node.name.type}`);
  }
}