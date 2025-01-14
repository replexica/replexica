import { ILoader } from "./_types";
import { createLoader } from "./_utils";
import srtParser from "srt-parser-2";

export default function createSrtLoader(): ILoader<
  string,
  Record<string, any>
> {
  const parser = new srtParser();
  return createLoader({
    async pull(locale, input) {
      const parsed = parser.fromSrt(input) || [];
      const result: Record<string, string> = {};

      parsed.forEach((entry) => {
        const key = `${entry.id}#${entry.startTime}-${entry.endTime}`;
        result[key] = entry.text;
      });

      return result;
    },

    async push(locale, payload) {
      const output = Object.entries(payload).map(([key, text]) => {
        const [id, timeRange] = key.split("#");
        const [startTime, endTime] = timeRange.split("-");

        return {
          id: id,
          startTime: startTime,
          startSeconds: 0,
          endTime: endTime,
          endSeconds: 0,
          text: text,
        };
      });

      const srtContent = parser.toSrt(output).trim().replace(/\r?\n/g, "\n");
      return srtContent;
    },
  });
}
