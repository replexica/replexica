import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { IReplexicaScope } from "./types";
import { ReplexicaChunk } from './chunk';
import { generateScopeId } from '../../utils/id';
import { findJsxParentForTheAttribute, getDefaultImportName, getImportName, getJsxAttributeName, getJsxElementName, getStringAttributeValue, injectDefaultImport, injectImport, parseMemberExpressionFromJsxMemberExpression } from '../../utils/ast';
import { ReplexicaScopeData, ReplexicaScopeHint } from '../types';
import { ReplexicaBaseScope } from './base';

// TODO: @/i18n should be a relative import, in case
// @ isn't mapped to the project root

export class ReplexicaAttributeScope extends ReplexicaBaseScope implements IReplexicaScope {
  public static fromNode(path: NodePath<t.Node>): IReplexicaScope[] {
    const result: IReplexicaScope[] = [];
    if (!path.isJSXElement()) { return result; }

    const supportedAttributeNames = ['title', 'alt', 'placeholder'];
    const openingElement = path.get('openingElement');
    const attributesPaths = openingElement.get('attributes');
    for (const attributePath of attributesPaths) {
      if (!attributePath.isJSXAttribute()) { continue; }

      const attributeName = attributePath.get('name');
      if (!attributeName.isJSXIdentifier()) { continue; }

      const attributeNameValue = attributeName.node.name;
      if (!supportedAttributeNames.includes(attributeNameValue)) { continue; }

      result.push(new ReplexicaAttributeScope(attributePath));
    }

    return result;
  }

  public constructor(
    private readonly path: NodePath<t.JSXAttribute>,  
  ) {
    super();

    const valuePath = this.path.get("value") as NodePath<t.Node>;
    if (valuePath.isStringLiteral()) {
      this._chunk = ReplexicaChunk.fromStringLiteral(valuePath);
    } else if (valuePath.isJSXExpressionContainer()) {
      const expressionPath = valuePath.get("expression") as NodePath<t.Node>;
      if (expressionPath.isStringLiteral()) {
        this._chunk = ReplexicaChunk.fromJsxExpressionContainer(valuePath);
      }
    }

    const chunkIds = this._chunk ? [this._chunk.id] : [];
    const result = generateScopeId(chunkIds, 0);
    this._id = result;
  }

  private _chunk: ReplexicaChunk | null = null;
  private _id: string;

  public get id(): string {
    return this._id;
  }

  public injectIntl(fileId: string, isServer: boolean): ReplexicaScopeData {
    const result: ReplexicaScopeData = {};
    if (!this._chunk) { return result; }

    const programNode = this.path.findParent((p) => p.isProgram()) as NodePath<t.Program> | null;
    if (!programNode) { throw new Error(`Couldn't find file node`); }

    const jsxElement = findJsxParentForTheAttribute(this.path);
    if (!jsxElement) {
      throw new Error(`Couldn't find JSX element for attribute ${this.path.get("name").toString()}`);
    }

    const packageName = isServer ? '@replexica/react/next' : '@replexica/react/client';
    const localHelperName = 'I18nProxy';

    let helperName = getImportName(programNode, packageName, localHelperName);
    if (!helperName) {
      helperName = injectImport(programNode, packageName, localHelperName);
    }

    const isProxyAlreadyApplied = t.isJSXIdentifier(jsxElement.node.openingElement.name) && jsxElement.node.openingElement.name.name === helperName;
    if (!isProxyAlreadyApplied) {
      // 1. add $$Component attribute to the element and set it to the original component name / identifier / member expression
      if (t.isJSXIdentifier(jsxElement.node.openingElement.name)) {
        // if it's an identifier, it's a native element or a component
        if (/^[a-z]/.test(jsxElement.node.openingElement.name.name)) {
          // if it's lowercased identifier, it's a native element
          jsxElement.node.openingElement.attributes.push(
            t.jSXAttribute(
              t.jSXIdentifier('$$Component'),
              t.stringLiteral(jsxElement.node.openingElement.name.name),  
            ),
          );
        } else {
          // if it's uppercased identifier, it's a component
          jsxElement.node.openingElement.attributes.push(
            t.jSXAttribute(
              t.jSXIdentifier('$$Component'),
              t.jSXExpressionContainer(t.identifier(jsxElement.node.openingElement.name.name)),
            ),
          );
        }
      } else if (t.isJSXMemberExpression(jsxElement.node.openingElement.name)) {
        const memberExpression = parseMemberExpressionFromJsxMemberExpression(jsxElement.node.openingElement.name);
        jsxElement.node.openingElement.attributes.push(
          t.jSXAttribute(
            t.jSXIdentifier('$$Component'),
            t.jSXExpressionContainer(memberExpression),
          ),
        );
      } else {
        throw new Error(`Unsupported JSXElement name type.`);
      }
      // 2. replace the element name with the name of the proxy component
      jsxElement.node.openingElement.name = t.jSXIdentifier(helperName);
      if (jsxElement.node.closingElement) {
        jsxElement.node.closingElement.name = t.jSXIdentifier(helperName);
      }
    }

    // add the current attribute to the proxy component's $$Attributes attribute
    // like so: <ProxyComponent $$Attributes={{ [attributeName]: { fileId, scopeId, chunkId } }} />
    // create $$Attributes attribute entry only if it doesn't exist yet
    let systemReplexicaAttribute = jsxElement.node.openingElement.attributes.find((attr) => {
      return t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === '$$Attributes';
    }) as t.JSXAttribute | undefined;
    if (!systemReplexicaAttribute) {
      systemReplexicaAttribute = t.jSXAttribute(
        t.jSXIdentifier('$$Attributes'),
        t.jSXExpressionContainer(t.objectExpression([])),
      );
      jsxElement.node.openingElement.attributes.push(systemReplexicaAttribute);
    }

    // create the current attribute entry
    const attributeName = this.path.get("name").toString();

    const selectorProperty = t.objectProperty(
      t.stringLiteral(attributeName),
      t.objectExpression([
        t.objectProperty(t.stringLiteral('fileId'), t.stringLiteral(fileId)),
        t.objectProperty(t.stringLiteral('scopeId'), t.stringLiteral(this.id)),
        t.objectProperty(t.stringLiteral('chunkId'), t.stringLiteral(this._chunk.id)),
      ]),
    );
    // add the current attribute entry to the $$Attributes attribute
    if (t.isJSXExpressionContainer(systemReplexicaAttribute.value) && t.isObjectExpression(systemReplexicaAttribute.value.expression)) {
      systemReplexicaAttribute.value.expression.properties.push(selectorProperty);
      
      if (isServer) {
        // make sure the following import is available in the file:
        // import i18n from '@/i18n';
        let localeDataLoaderImportName = getDefaultImportName(programNode, '@/i18n');
        if (!localeDataLoaderImportName) {
          localeDataLoaderImportName = injectDefaultImport(programNode, '@/i18n', 'loadI18n');
        }
        
        // add the following props to the injected element:
        // loadLocaleData={localeDataLoaderImportName.loadData}
        jsxElement.node.openingElement.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier('loadI18n'),
            t.jsxExpressionContainer(
              t.identifier(localeDataLoaderImportName),
            ),
          )
        );
      }

      result[this._chunk.id] = this._chunk.text;
    }

    return result;
  }

  public extractHints(): ReplexicaScopeHint[] {
    const jsxElement = findJsxParentForTheAttribute(this.path);
    if (!jsxElement) {
      throw new Error(`Couldn't find JSX element for attribute ${this.path.get("name").toString()}`);
    }

    const attributeName = getJsxAttributeName(this.path);
    const attributeHint: ReplexicaScopeHint = {
      type: 'attribute',
      name: attributeName,
    };

    const baseHints = this._extractBaseHints(jsxElement);

    const result = [...baseHints, attributeHint];
    return result;
  }
}
