import { describe, it, expect, vi } from 'vitest';
import { xcodeXcstringsLoader } from './xcode-xcstrings';

describe('xcodeXcstringsLoader', () => {
  const mockLoader = {
    load: vi.fn(),
    save: vi.fn(),
  };

  const testLocale = 'en';

  it('should load and transform simple strings correctly', async () => {
    mockLoader.load.mockResolvedValue({
      strings: {
        greeting: {
          localizations: {
            en: {
              stringUnit: {
                state: 'translated',
                value: 'Hello!',
              },
            },
          },
        },
      },
    });

    const loader = xcodeXcstringsLoader(testLocale, mockLoader);
    const result = await loader.load();

    expect(result).toEqual({
      greeting: 'Hello!',
    });
  });

  it('should load and transform plural strings correctly', async () => {
    mockLoader.load.mockResolvedValue({
      strings: {
        items_count: {
          localizations: {
            en: {
              variations: {
                plural: {
                  zero: { stringUnit: { value: 'No items' } },
                  one: { stringUnit: { value: 'One item' } },
                  other: { stringUnit: { value: '%lld items' } },
                },
              },
            },
          },
        },
      },
    });

    const loader = xcodeXcstringsLoader(testLocale, mockLoader);
    const result = await loader.load();

    expect(result).toEqual({
      items_count: {
        zero: 'No items',
        one: 'One item',
        other: '%lld items',
      },
    });
  });

  it('should save simple strings correctly', async () => {
    mockLoader.load.mockResolvedValue({ strings: {} });

    const loader = xcodeXcstringsLoader(testLocale, mockLoader);
    await loader.save({ greeting: 'Hello!' });

    expect(mockLoader.save).toHaveBeenCalledWith({
      strings: {
        greeting: {
          extractionState: 'manual',
          localizations: {
            en: {
              stringUnit: {
                state: 'translated',
                value: 'Hello!',
              },
            },
          },
        },
      },
    });
  });

  it('should save plural strings correctly', async () => {
    mockLoader.load.mockResolvedValue({ strings: {} });

    const loader = xcodeXcstringsLoader(testLocale, mockLoader);
    await loader.save({
      items_count: {
        zero: 'No items',
        one: 'One item',
        other: '%lld items',
      },
    });

    expect(mockLoader.save).toHaveBeenCalledWith({
      strings: {
        items_count: {
          extractionState: 'manual',
          localizations: {
            en: {
              variations: {
                plural: {
                  zero: { stringUnit: { state: 'translated', value: 'No items' } },
                  one: { stringUnit: { state: 'translated', value: 'One item' } },
                  other: { stringUnit: { state: 'translated', value: '%lld items' } },
                },
              },
            },
          },
        },
      },
    });
  });
});

