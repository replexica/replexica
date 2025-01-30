import webvtt from "node-webvtt";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createVttLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      const vtt = webvtt.parse(input)?.cues;
      if (Object.keys(vtt).length === 0) {
        return {};
      } else {
        return vtt.reduce((result: any, cue: any, index: number) => {
          const key = `${index}#${cue.start}-${cue.end}#${cue.identifier}`;
          result[key] = cue.text;
          return result;
        }, {});
      }
    },
    async push(locale, payload) {
      const output = Object.entries(payload).map(([key, text]) => {
        const [id, timeRange, identifier] = key.split("#");
        const [startTime, endTime] = timeRange.split("-");

        return {
          end: Number(endTime),
          identifier: identifier,
          start: Number(startTime),
          styles: "",
          text: text,
        };
      });

      const input = {
        valid: true,
        strict: true,
        cues: output,
      };

      return webvtt.compile(input);
    },
  });
}
