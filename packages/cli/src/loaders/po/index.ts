import { ILoader } from "../_types";
import { createLoader } from "../_utils";
import * as gettextParser from "gettext-parser";
import _ from "lodash";
import { GetTextTranslation, TranslationValue } from "./_types";

export default function createPoLoader(): ILoader<string, Record<string, TranslationValue>> {
  return createLoader({
    async pull(locale, input) {
      const po = gettextParser.po.parse(input);
      const translations = _.get(po, "translations['']", {});

      return _(translations)
        .omit("") // Skip header entry
        .mapValues((value: any) => {
          // Handle plural forms
          if (value.msgid_plural) {
            return {
              singularValue: _.get(value, "msgstr[0]", ""),
              pluralValue: _.get(value, "msgstr[1]", ""),
            };
          }

          // Handle context-specific translations
          if (value.msgctxt) {
            return {
              context: value.msgctxt,
              value: _.get(value, "msgstr[0]", ""),
            };
          }

          // Default case: simple translation
          return _.get(value, "msgstr[0]", "");
        })
        .value();
    },

    async push(locale, payload, originalInput) {
      const originalPo = gettextParser.po.parse(originalInput || "");
      const translations: { [key: string]: { [key: string]: any } } = {
        "": _.get(originalPo, ["translations", ""], {}),
      };

      _.forEach(payload, (value: TranslationValue, key) => {
        const existingTranslation = _.get(originalPo, ["translations", "", key], {}) as GetTextTranslation;

        // Handle different types of translations
        if (_.isObject(value) && "singularValue" in value) {
          translations[""][key] = {
            ...existingTranslation,
            msgid: key,
            msgid_plural: existingTranslation.msgid_plural || key, // Preserve or set plural msgid
            msgstr: [value.singularValue, value.pluralValue],
          };
        } else if (_.isObject(value) && "context" in value) {
          translations[""][key] = {
            ...existingTranslation,
            msgid: key,
            msgctxt: value.context,
            msgstr: [value.value],
          };
        } else {
          translations[""][key] = {
            ...existingTranslation,
            msgid: key,
            msgstr: [value as string],
          };
        }
      });

      return gettextParser.po
        .compile({
          ...originalPo,
          translations,
        })
        .toString();
    },
  });
}
