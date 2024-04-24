import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ReplexicaCompiler } from './compiler';
import { ReplexicaAttributeScope, ReplexicaContentScope, ReplexicaSkipScope } from './scope';

const mocks = vi.hoisted(() => {
  return {
    generateScopeId: vi.fn(),
    generateChunkId: vi.fn(),
    generateFileId: vi.fn(),
  };
});

vi.mock('../utils/id', () => {
  return {
    generateScopeId: mocks.generateScopeId,
    generateChunkId: mocks.generateChunkId,
    generateFileId: mocks.generateFileId,
  };
});

describe('Compiles content', () => {
  beforeEach(() => {
    let fileIdCounter = 0;
    let scopeIdCounter = 0;
    let chunkIdCounter = 0;

    mocks.generateFileId.mockImplementation(() => `fileId_${fileIdCounter++}`);
    mocks.generateScopeId.mockImplementation(() => `scopeId_${scopeIdCounter++}`);
    mocks.generateChunkId.mockImplementation(() => `chunkId_${chunkIdCounter++}`);
  });

  it('one basic span', () => {
    const inputCode = '<span>Hello, world!</span>';
    const compiler = createCompiler(inputCode);

    const outputCode = compiler
      .injectIntl()
      .generate()
      .code;
    const outputData = compiler.data;

    expect(outputCode).toMatchSnapshot();
    expect(outputData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_0: 'Hello, world!',
            },
          },
        },
      },
    });
  });

  it('multiple basic spans', () => {    
    const inputCode = `
<div>
  <span>Hello, world!</span>
  <span>Goodbye, world!</span>
</div>
    `.trim();

    const compiler = createCompiler(inputCode);

    const outputCode = compiler
      .injectIntl()
      .generate()
      .code;
    const outputData = compiler.data;

    expect(outputCode).toMatchSnapshot();
    expect(outputData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_0: 'Hello, world!',
            },
          },
          scopeId_1: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_1: 'Goodbye, world!',
            },
          },
        },
      },
    });
  });

  it('nested basic spans', () => {
    const inputCode = `
<div>
  <span>Hello, world!</span>
  <div>
    <span>Goodbye, world!</span>
  </div>
</div>
    `.trim();

    const compiler = createCompiler(inputCode);

    const outputCode = compiler
      .injectIntl()
      .generate()
      .code;
    const outputData = compiler.data;

    expect(outputCode).toMatchSnapshot();
    expect(outputData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_0: 'Hello, world!',
            },
          },
          scopeId_1: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_1: 'Goodbye, world!',
            },
          },
        },
      },
    });
  });

  it('nested elements mixed with text', () => {
    const inputCode = `
<div>
  <span>Hello, world!</span>
  <div>
    Goodbye, world!
    <br />
    You can say <b>hello</b> again by clicking <a href="#">here</a>.
  </div>
</div>
    `.trim();
    const compiler = createCompiler(inputCode);

    const outputCode = compiler
      .injectIntl()
      .generate()
      .code;
    const actualData = compiler.data;

    expect(outputCode).toMatchSnapshot();
    expect(actualData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_0: 'Hello, world!',
            },
          },
          scopeId_1: {
            hints: [{
              type: 'element',
              name: 'div',
              hint: null,
            }],
            data: {
              chunkId_1: ' Goodbye, world! ',
              chunkId_2: ' You can say ',
              chunkId_3: 'hello',
              chunkId_4: ' again by clicking ',
              chunkId_5: 'here',
              chunkId_6: '. ',
            },
          },
        },
      },
    });
  });

  it('jsx assigned to jsx attribute', () => {
    const inputCode = `
<div>
  <div
    data-test={<span>Hello, world!</span>}
  >
    Goodbye, world!
  </div>
</div>
    `.trim();
    const compiler = createCompiler(inputCode);

    const outputCode = compiler
      .injectIntl()
      .generate()
      .code;
    const actualData = compiler.data;

    expect(outputCode).toMatchSnapshot();
    expect(actualData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'div',
              hint: null,
            }],
            data: {
              chunkId_0: ' Goodbye, world! ',
            },
          },
          scopeId_1: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_1: 'Hello, world!',
            },
          },
        },
      },
    });
  });
});

describe('Skips nodes marked with `data-replexica-skip`', () => {
  beforeEach(() => {
    let fileIdCounter = 0;
    let scopeIdCounter = 0;
    let chunkIdCounter = 0;

    mocks.generateFileId.mockImplementation(() => `fileId_${fileIdCounter++}`);
    mocks.generateScopeId.mockImplementation(() => `scopeId_${scopeIdCounter++}`);
    mocks.generateChunkId.mockImplementation(() => `chunkId_${chunkIdCounter++}`);
  });

  it('skips a single node', () => {
    const inputCode = `
<div>
  <span>Hello, world!</span>
  <div data-replexica-skip>
    Goodbye, world!
  </div>
</div>
    `.trim();
    const compiler = createCompiler(inputCode);

    const outputCode = compiler
      .injectIntl()
      .generate()
      .code;
    const actualData = compiler.data;

    expect(outputCode).toMatchSnapshot();
    expect(actualData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_0: 'Hello, world!',
            },
          },
        },
      },
    });
  });

  it('skips entire subtree', () => {
    const inputCode = `
<div>
  <span>Hello, world!</span>
  <div data-replexica-skip>
    Goodbye, world!
    <br />
    You can say <b>hello</b> again by clicking <a href="#">here</a>.
  </div>
</div>
    `.trim();
    const compiler = createCompiler(inputCode);

    const outputCode = compiler
      .injectIntl()
      .generate()
      .code;
    const actualData = compiler.data;

    expect(outputCode).toMatchSnapshot();
    expect(actualData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_0: 'Hello, world!',
            },
          },
        },
      },
    });
  });
});

describe('Compiles attribute values', () => {
  beforeEach(() => {
    let fileIdCounter = 0;
    let scopeIdCounter = 0;
    let chunkIdCounter = 0;

    mocks.generateFileId.mockImplementation(() => `fileId_${fileIdCounter++}`);
    mocks.generateScopeId.mockImplementation(() => `scopeId_${scopeIdCounter++}`);
    mocks.generateChunkId.mockImplementation(() => `chunkId_${chunkIdCounter++}`);
  });

  it('compiles attribute values', () => {
    const inputCode = `
<div>
  <span title="Hello!">World</span>
</div>
    `;
    const compiler = createCompiler(inputCode);

    const outputCode = compiler
      .injectIntl()
      .generate()
      .code;
    const actualData = compiler.data;

    expect(outputCode).toMatchSnapshot();
    expect(actualData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }],
            data: {
              chunkId_0: 'World',
            },
          },
          scopeId_1: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: null,
            }, {
              type: 'attribute',
              name: 'title',
            }],
            data: {
              chunkId_1: 'Hello!',
            },
          },
        },
      },
    });
  });
});

describe('Adds hints added explicitly with `data-replexica-hint`', () => {
  beforeEach(() => {
    let fileIdCounter = 0;
    let scopeIdCounter = 0;
    let chunkIdCounter = 0;

    mocks.generateFileId.mockImplementation(() => `fileId_${fileIdCounter++}`);
    mocks.generateScopeId.mockImplementation(() => `scopeId_${scopeIdCounter++}`);
    mocks.generateChunkId.mockImplementation(() => `chunkId_${chunkIdCounter++}`);
  });

  it('simple nested span', () => {
    const inputCode = `
<div>
  <span data-replexica-hint="hello world message">Hello, world!</span>
</div>
    `;
    const compiler = createCompiler(inputCode);

    compiler.injectIntl();
    const actualData = compiler.data;

    expect(actualData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: 'hello world message',
            }],
            data: {
              chunkId_0: 'Hello, world!',
            },
          },
        },
      },
    });
  });

  it('nested span with an attribute', () => {
    const inputCode = `
<div>
  <span title="Hello!" data-replexica-hint="hello world message">World</span>
</div>
    `;
    const compiler = createCompiler(inputCode);

    compiler.injectIntl();
    const actualData = compiler.data;

    expect(actualData).toEqual({
      fileId_0: {
        context: { isClient: false },
        data: {
          scopeId_0: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: 'hello world message',
            }],
            data: {
              chunkId_0: 'World',
            },
          },
          scopeId_1: {
            hints: [{
              type: 'element',
              name: 'span',
              hint: 'hello world message',
            }, {
              type: 'attribute',
              name: 'title',
            }],
            data: {
              chunkId_1: 'Hello!',
            },
          },
        },
      },
    });

  });
});

// helpers

function createCompiler(inputCode: string) {
  return ReplexicaCompiler
    .fromCode(inputCode, '/path/to/file.tsx', true)
    .withScope(ReplexicaSkipScope)
    .withScope(ReplexicaContentScope)
    .withScope(ReplexicaAttributeScope)
  ;
}