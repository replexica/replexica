import path from 'path';
import fs from 'fs';
import * as t from '@babel/types';
import { CodeWorkerContext, CodeWorkerPhase, createWorker } from "../base";
import { generateCodeFromAst } from '../../../utils/babel';

export default createWorker<t.Program>({
  shouldRun: ({ nodePath }) => nodePath.isProgram(),
  pre: ({ ctx, phase }) => writeFile(ctx, phase),
  post: ({ ctx, phase }) => writeFile(ctx, phase),
});

function writeFile(ctx: CodeWorkerContext, phase: CodeWorkerPhase) {
  const currentDir = process.cwd();
  const debugDir = path.join(currentDir, '.debug', 'replexica');
  const relativeFilePath = path.relative(currentDir, ctx.filePath);
  const fileExt = path.extname(relativeFilePath);
  const finalPath = path.join(debugDir, relativeFilePath + `.${phase}` + fileExt);

  fs.mkdirSync(path.dirname(finalPath), { recursive: true });

  const result = generateCodeFromAst(ctx.ast, ctx.code);
  fs.writeFileSync(finalPath, result.code, 'utf-8');
}