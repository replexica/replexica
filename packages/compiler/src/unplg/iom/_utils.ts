import * as t from '@babel/types';

export function getJsxOpeningElementName(openingElementName: t.JSXOpeningElement['name']): string {
  if (t.isJSXIdentifier(openingElementName)) {
    return openingElementName.name;
  } else if (t.isJSXNamespacedName(openingElementName)) {
    return `${openingElementName.namespace.name}:${openingElementName.name.name}`;
  } else if (t.isJSXMemberExpression(openingElementName)) {
    const currentFieldName = openingElementName.property.name;
    const parentFieldName = getJsxOpeningElementName(openingElementName.object);
    const fieldName = `${parentFieldName}.${currentFieldName}`;
    return fieldName;
  } else {
    throw new Error(`Unsupported JSX Opening Element Name type`, openingElementName);
  }
}

export function getJsxElementName(element: t.JSXFragment | t.JSXElement): string {
  if (t.isJSXFragment(element)) {
    return 'Fragment';
  } else if (t.isJSXElement(element)) {
    return getJsxOpeningElementName(element.openingElement.name);
  } else {
    throw new Error(`Unsupported JSX element type: ${element}`);
  }
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

// Recursively parse a member expression to get the full name
export function parseMemberExpressionName(
  memberExpression: t.MemberExpression,
): string {
  if (t.isIdentifier(memberExpression.object)) {
    return memberExpression.object.name;
  } else if (t.isMemberExpression(memberExpression.object)) {
    const parent = parseMemberExpressionName(memberExpression.object);
    const current = t.isIdentifier(memberExpression.property) ? memberExpression.property.name : '';
    return `${parent}.${current}`;
  } else {
    throw new Error(`Unsupported MemberExpression object type.`);
  }
}
