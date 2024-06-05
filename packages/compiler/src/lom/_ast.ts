import * as t from '@babel/types';

export const getJsxElementName = (element: t.JSXFragment | t.JSXElement): string => {
  if (t.isJSXFragment(element)) {
    return 'Fragment';
  } else if (t.isJSXIdentifier(element.openingElement.name)) {
    return element.openingElement.name.name;
  } else if (t.isJSXNamespacedName(element.openingElement.name)) {
    return `${element.openingElement.name.namespace.name}:${element.openingElement.name.name.name}`;
  } else {
    throw new Error('Could not parse JSX element name: invalid element type');
  }
}