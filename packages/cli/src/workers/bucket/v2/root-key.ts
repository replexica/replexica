import { createLoader } from "./_base";

export const rootKeyLoader = createLoader<Record<string, any>, Record<string, any>>({
  async load(payload) {
    const firstKey = Object.keys(payload)[0];
    const result = payload[firstKey];
    return result;
  },
  async save(payload, input, originalPayload) {
    const firstKey = Object.keys(originalPayload)[0];
    const result = { ...originalPayload, [firstKey]: payload };
    return result;
  },
});