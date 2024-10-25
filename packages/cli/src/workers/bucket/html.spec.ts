import { describe, it, expect } from 'vitest';
import { htmlLoader } from './html';

describe('htmlLoader', () => {
  const loader = htmlLoader();

  it('should extract localizable content from HTML', async () => {
    const html = `
      <html>
        <body>
          <h1>Hello World</h1>
          <img src="test.jpg" alt="Test Image" title="Hover Text">
          <input placeholder="Enter name">
        </body>
      </html>
    `;

    const result = await loader.load(html);

    expect(result).toEqual({ localizableHtmlEntities: [
      {
        selector: 'html > body > h1',
        type: 'text',
        value: 'Hello World'
      },
      {
        selector: 'html > body > img',
        type: 'attribute',
        name: 'alt',
        value: 'Test Image'
      },
      {
        selector: 'html > body > img',
        type: 'attribute',
        name: 'title',
        value: 'Hover Text'
      },
      {
        selector: 'html > body > input',
        type: 'attribute',
        name: 'placeholder',
        value: 'Enter name'
        }
      ]
    });
  });

  it('should handle empty input', async () => {
    const result = await loader.load('');
    expect(result).toEqual({ localizableHtmlEntities: [] });
  });

  it('should skip script and style content', async () => {
    const html = `
      <html>
        <body>
          <script>const text = 'Skip me';</script>
          <style>/* Skip me too */</style>
          <div>Include me</div>
        </body>
      </html>
    `;

    const result = await loader.load(html);

    expect(result).toEqual({ localizableHtmlEntities: [
      {
        selector: 'html > body > div',
        type: 'text',
        value: 'Include me'
        }
      ]
    });
  });

  it('should save translations back to HTML', async () => {
    const originalHtml = '<div>Hello World</div>';
    const localizableHtmlEntities = [{
      selector: 'html > body > div',
      type: 'text',
      value: 'Bonjour le monde'
    } as const];

    const result = await loader.save({ localizableHtmlEntities }, originalHtml);
    expect(result).toContain('Bonjour le monde');
  });

  it('should handle elements with IDs in selectors', async () => {
    const html = `
      <div id="greeting">Hello</div>
    `;

    const result = await loader.load(html);

    expect(result.localizableHtmlEntities[0].selector).toBe('html > body > div#greeting');
    expect(result.localizableHtmlEntities[0].value).toBe('Hello');
  });
});
