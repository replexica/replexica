import { describe, it, expect } from 'vitest';
import { markdownLoader } from './markdown';

describe('markdownLoader', () => {
  const loader = markdownLoader();

  it('should load markdown with frontmatter', async () => {
    const input = `---
title: Test Title
date: 2023-05-20
---

# Heading 1

This is a paragraph.

## Heading 2

Another paragraph.`;

    const result = await loader.load(input);

    expect(result['fm-attr-title']).toBe('Test Title');
    expect(result['fm-attr-date']).toBe('2023-05-20');
    expect(result['md-section-0']).toBe('# Heading 1');
    expect(result['md-section-1']).toBe('This is a paragraph.');
    expect(result['md-section-2']).toBe('## Heading 2');
    expect(result['md-section-3']).toBe('Another paragraph.');
  });

  it('should load markdown without frontmatter', async () => {
    const input = `# Just a heading

And some content.`;

    const result = await loader.load(input);

    expect(result['md-section-0']).toBe('# Just a heading');
    expect(result['md-section-1']).toBe('And some content.');
    expect(Object.keys(result).filter(key => key.startsWith('fm-attr-'))).toHaveLength(0);
  });

  it('should save markdown with frontmatter', async () => {
    const input = {
      'fm-attr-title': 'Test Title',
      'fm-attr-date': '2023-05-20',
      'md-section-0': '# Heading 1',
      'md-section-1': 'This is a paragraph.',
      'md-section-2': '## Heading 2',
      'md-section-3': 'Another paragraph.',
    };

    const result = await loader.save(input);

    expect(result).toBe(`
---
title: Test Title
date: '2023-05-20'
---

# Heading 1

This is a paragraph.

## Heading 2

Another paragraph.
`.trimStart());
  });

  it('should save markdown without frontmatter', async () => {
    const input = {
      'md-section-0': '# Just a heading',
      'md-section-1': 'And some content.',
    };

    const result = await loader.save(input);

    expect(result).toBe('# Just a heading\n\nAnd some content.\n');
  });

  it('should handle round-trip conversion', async () => {
    const originalInput = `---
title: Round Trip Test
tags:
  - test
  - markdown
---

# Main Heading

This is a test paragraph.

## Sub Heading

- List item 1
- List item 2

![Image](https://example.com/image.jpg)
`;

    const loaded = await loader.load(originalInput);
    const saved = await loader.save(loaded);

    expect(saved).toBe(originalInput);
  });
});
