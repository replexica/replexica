import _ from "lodash";
import gettextParser from "gettext-parser";
import { GetTextTranslations } from "gettext-parser";
import { ILoader } from "../_types";
import { composeLoaders, createLoader } from "../_utils";

export type PoTranslationEntry = GetTextTranslations["translations"][""];
export type PoTranslationValue = { singular: string; plural: string | null };

export default function createPoLoader(): ILoader<string, Record<string, PoTranslationValue>> {
  return composeLoaders(createPoDataLoader(), createPoContentLoader());
}

export function createPoDataLoader(): ILoader<string, PoTranslationEntry> {
  return createLoader({
    async pull(locale, input) {
      const parsedPo = gettextParser.po.parse(input);
      const result: PoTranslationEntry = {};
      const sections = input.split("\n\n").filter(Boolean);
      for (const section of sections) {
        const sectionPo = gettextParser.po.parse(section);
        const contextKey = _.keys(sectionPo.translations)[0];
        const entries = sectionPo.translations[contextKey];
        Object.entries(entries).forEach(([msgid, entry]) => {
          if (msgid && entry.msgid) {
            const context = entry.msgctxt || "";
            const fullEntry = parsedPo.translations[context]?.[msgid];
            if (fullEntry) {
              result[msgid] = fullEntry;
            }
          }
        });
      }
      return result;
    },

    async push(locale, data, originalInput) {
      // Parse each section to maintain structure
      const sections = originalInput?.split("\n\n").filter(Boolean) || [];
      const result = sections
        .map((section) => {
          const sectionPo = gettextParser.po.parse(section);
          const contextKey = _.keys(sectionPo.translations)[0];
          const entries = sectionPo.translations[contextKey];
          const msgid = Object.keys(entries).find((key) => entries[key].msgid);
          if (!msgid) return section;
          if (data[msgid]) {
            const updatedPo = _.merge({}, sectionPo, {
              translations: {
                [contextKey]: {
                  [msgid]: {
                    msgstr: data[msgid].msgstr,
                  },
                },
              },
            });
            return gettextParser.po
              .compile(updatedPo)
              .toString()
              .replace([`msgid ""`, `msgstr "Content-Type: text/plain\\n"`].join("\n"), "")
              .trim();
          }
          return section.trim();
        })
        .join("\n\n");
      return result;
    },
  });
}

export function createPoContentLoader(): ILoader<PoTranslationEntry, Record<string, PoTranslationEntry>> {
  return createLoader({
    async pull(locale, input) {
      const result = _.chain(input)
        .entries()
        .filter(([, entry]) => !!entry.msgid)
        .map(([, entry]) => [
          entry.msgid,
          {
            singular: entry.msgstr[0] || entry.msgid,
            plural: (entry.msgstr[1] || entry.msgid_plural || null) as string | null,
          },
        ])
        .fromPairs()
        .value();
      return result;
    },
    async push(locale, data, originalInput) {
      const result = _.chain(originalInput)
        .entries()
        .map(([, entry]) => [
          entry.msgid,
          {
            ...entry,
            msgstr: [data[entry.msgid]?.singular, data[entry.msgid]?.plural || null].filter(Boolean),
          },
        ])
        .fromPairs()
        .value();

      return result;
    },
  });
}
