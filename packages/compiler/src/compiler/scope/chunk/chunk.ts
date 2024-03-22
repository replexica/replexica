import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { trimSafely } from '../../../utils/text';
import { generateChunkId } from '../../../utils/id';

export class ReplexicaChunk {
  public static fromStringLiteral(path: NodePath<t.StringLiteral>) {
    const text = trimSafely(path.node.value);
    const id = generateChunkId(text, 0);
    return new ReplexicaChunk(path, text, id, false);
  }

  public static fromJsxText(path: NodePath<t.JSXText>) {
    let text = path.node.value;
    text = trimSafely(text);
    const id = generateChunkId(text, 0);
    return new ReplexicaChunk(path, text, id, false);
  }

  public static fromJsxExpressionContainer(path: NodePath<t.JSXExpressionContainer>) {
    if (!path.isJSXExpressionContainer()) { throw new Error('Expected a JSXExpressionContainer'); }

    if (path.node.expression.type === 'StringLiteral') {
      const text = trimSafely(path.node.expression.value);
      const id = generateChunkId(text, 0);
      return new ReplexicaChunk(path, text, id, false);
    } else if (path.node.expression.type === 'Identifier') {
      return ReplexicaChunk.fromVariable(path.get('expression') as NodePath<t.Identifier>);
    } else if (path.node.expression.type === 'CallExpression') {
      return ReplexicaChunk.fromFunctionCall(path.get('expression') as NodePath<t.CallExpression>);
    } else {
      const text = `{code:${path.node.expression.type}}`;
      const id = generateChunkId(text, 0);
      return new ReplexicaChunk(path, text, id, true);
    }
  }

  private static fromVariable(path: NodePath<t.Identifier>) {
    const text = `{variable:${path.node.name}}`;
    const id = generateChunkId(text, 0);
    return new ReplexicaChunk(path, text, id, true);
  }

  private static fromFunctionCall(path: NodePath<t.CallExpression>) {
    if (!path.isCallExpression()) { throw new Error('Expected a CallExpression'); }

    const functionName = path.node.callee.type === 'Identifier' ? path.node.callee.name : 'unknown';
    const text = `{function:${functionName}}`;
    const id = generateChunkId(text, 0);
    return new ReplexicaChunk(path, text, id, true);
  }

  private constructor(
    public readonly path: NodePath<t.Node>,
    public readonly text: string,
    public readonly id: string,
    public readonly isPlaceholder: boolean,
  ) {
  }
}
