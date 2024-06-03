import * as t from '@babel/types';
import { createWorker } from '../../base';

const localizableAttributes: Record<string, string[]> = {
  '': ['title'], // Default localizable attributes that any element can have.
  input: ['placeholder'],
  img: ['alt'],
  meta: ['content'],
  option: ['label'],
};


export default createWorker<t.JSXElement>({
  name: 'attribute-fragment-extractor',
  runIf: ({ nodePath }) => {
    const isJsxElem = t.isJSXElement(nodePath.node);
    if (!isJsxElem) { return false; }

    const attributes = nodePath.node.openingElement.attributes.filter((attr) => t.isJSXAttribute(attr)) as t.JSXAttribute[];
    const attributeNames = attributes.map((attr) => t.isJSXIdentifier(attr.name) ? attr.name.name : null).filter(Boolean) as string[];

    const commonLocalizableAttributes = localizableAttributes[''];
    const hasCommonLocalizableAttribute = attributeNames.some((attrName) => commonLocalizableAttributes.includes(attrName));
    
    const tagName = t.isJSXIdentifier(nodePath.node.openingElement.name) ? nodePath.node.openingElement.name.name : null;
    const specificLocalizableAttributes = tagName ? localizableAttributes[tagName] || [] : [];
    const hasSpecificLocalizableAttribute = attributeNames.some((attrName) => specificLocalizableAttributes.includes(attrName));

    const hasLocalizableAttributes = hasCommonLocalizableAttribute || hasSpecificLocalizableAttribute;
    if (!hasLocalizableAttributes) { return false; }

    return true;
  },
  post: ({ nodePath }) => {

  },
});
