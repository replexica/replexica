import { describe, it, expect } from 'vitest';
import { trimSafely } from './text';

describe('trimSafely', () => {
  it('should coalesce leading/trailing spaces', () => {
    const input = '\n    Hello World    \n';
    const expected = ' Hello World ';
    const actual = trimSafely(input);

    expect(actual).toBe(expected);
  });
  it('should keep leading/trailing NBSPs', () => {
    const input = '   \n    \u00A0    \u00A0   Hello World   \u00A0   \u00A0    \n   ';
    const expected = ' \u00A0 \u00A0 Hello World \u00A0 \u00A0 ';
    const actual = trimSafely(input);

    expect(actual).toBe(expected);
  });
});
