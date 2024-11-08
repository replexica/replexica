import webvtt from 'node-webvtt';
import { ILoader } from "./_types";
import { createLoader } from './_utils';

export default function createVttLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      return webvtt.parse(input)?.cues || {};
    },
    async push(locale, payload) {
      return webvtt.compile(payload);
    }
  });
}
