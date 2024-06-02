import path from 'path';
import fs from 'fs';
import * as t from '@babel/types';
import { CodeWorkerPhase, createWorker } from "../base";
import { generateCodeFromAst } from '../../../utils/babel';

export type WriteCodeWorkerConfig = {
  phase: CodeWorkerPhase;
};

export default createWorker<t.Program, WriteCodeWorkerConfig>({
  phase: (args, config) => config.phase,
  shouldRun: ({ path }) => path.isProgram(),
  run: ({ ctx, phase }) => {
    const currentDir = process.cwd();
    const debugDir = path.join(currentDir, '.debug', 'replexica');
    const relativeFilePath = path.relative(currentDir, ctx.params.filePath);
    const fileExt = path.extname(relativeFilePath);
    const finalPath = path.join(debugDir, relativeFilePath + `.${phase}` + fileExt);

    fs.mkdirSync(path.dirname(finalPath), { recursive: true });

    const result = generateCodeFromAst(ctx.input.ast, ctx.input.code);
    fs.writeFileSync(finalPath, result.code, 'utf-8');
  }
});
