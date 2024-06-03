import path from 'path';
import fs from 'fs';
import * as t from '@babel/types';
import { CodeWorkerPhase, createWorker } from "../base";
import { generateCodeFromAst } from '../../../utils/babel';

export type WriteCodeWorkerConfig = {
  phase: CodeWorkerPhase;
};

export default createWorker<t.Program, WriteCodeWorkerConfig>({
  phase: true,
  shouldRun: ({ nodePath }) => nodePath.isProgram(),
  run: ({ ctx, phase }) => {
    const currentDir = process.cwd();
    const debugDir = path.join(currentDir, '.debug', 'replexica');
    const relativeFilePath = path.relative(currentDir, ctx.filePath);
    const fileExt = path.extname(relativeFilePath);
    const finalPath = path.join(debugDir, relativeFilePath + `.${phase}` + fileExt);

    fs.mkdirSync(path.dirname(finalPath), { recursive: true });

    const result = generateCodeFromAst(ctx.ast, ctx.code);
    fs.writeFileSync(finalPath, result.code, 'utf-8');
  }
});
