import { describe, it, expect } from 'vitest';
import { generateFileId } from './id';

describe('generateFileId', () => {
  it('should generate the same id for both windows and unix relative paths', () => {
    const windowsPath = 'src\\components\\Button.tsx';
    const unixPath = 'src/components/Button.tsx';
    const nonce = 0;

    const windowsId = generateFileId(windowsPath, nonce);
    const unixId = generateFileId(unixPath, nonce);

    expect(windowsId).toBe(unixId);
  });
});