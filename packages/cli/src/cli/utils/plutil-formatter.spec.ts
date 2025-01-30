import { describe, it, expect } from "vitest";
import { formatPlutilStyle } from "./plutil-formatter";

describe("plutil-formatter", () => {
  it("should format JSON matching Xcode style with existing indentation", () => {
    const existingJson = `{
    "sourceLanguage" : "en",
    "strings" : {
        "something" : {

        }
    }
}`;

    const input = {
      sourceLanguage: "en",
      strings: {
        complex_format: {
          extractionState: "manual",
          localizations: {
            ar: {
              stringUnit: {
                state: "translated",
                value: "المستخدم %1$@ لديه %2$lld نقطة ورصيد $%3$.2f",
              },
            },
          },
        },
        something: {},
      },
      version: "1.0",
    };

    const expected = `{
    "sourceLanguage" : "en",
    "strings" : {
        "complex_format" : {
            "extractionState" : "manual",
            "localizations" : {
                "ar" : {
                    "stringUnit" : {
                        "state" : "translated",
                        "value" : "المستخدم %1$@ لديه %2$lld نقطة ورصيد $%3$.2f"
                    }
                }
            }
        },
        "something" : {

        }
    },
    "version" : "1.0"
}`;
    const result = formatPlutilStyle(input, existingJson);

    expect(result).toBe(expected);
  });

  it("should detect and use 4-space indentation", () => {
    const existingJson = `{
    "foo": {
        "bar": {
        }
    }
}`;

    const input = {
      test: {
        nested: {},
      },
    };

    const expected = `{
    "test" : {
        "nested" : {

        }
    }
}`;

    const result = formatPlutilStyle(input, existingJson);
    expect(result).toBe(expected);
  });

  it("should fallback to 2 spaces when no existing JSON provided", () => {
    const input = {
      foo: {
        bar: {},
      },
    };

    const expected = `{
  "foo" : {
    "bar" : {

    }
  }
}`;

    const result = formatPlutilStyle(input);
    expect(result).toBe(expected);
  });
});
