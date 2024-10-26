import { ILoader, ILoaderDefinition } from "./_types";

export function composeLoaders<O>(...loaders: ILoader<any, any>[]): ILoader<void, O> {
  return {
    setLocale(locale: string) {
      for (const loader of loaders) {
        loader.setLocale?.(locale);
      }
      return this;
    },
    pull: async (rawData: any) => {
      let result = rawData;
      for (const loader of loaders) {
        result = await loader.pull(result);
      }
      return result;
    },
    push: async (data: any) => {
      let result = data;
      for (const loader of loaders.reverse()) {
        result = await loader.push(result);
      }
      return result;
    },
    onStart: async () => {
      for (const loader of loaders) {
        await loader.onStart?.();
      }
    },
    onProgress: async (current, total) => {
      for (const loader of loaders) {
        await loader.onProgress?.(current, total);
      }
    },
    onEnd: async () => {
      for (const loader of loaders.reverse()) {
        await loader.onEnd?.();
      }
    },
  };
}

export function createLoader<I, O>(lDefinition: ILoaderDefinition<I, O>): ILoader<I, O> {
  return {
    locale: undefined,
    rawData: undefined,
    setLocale(locale) {
      if (this.locale) { throw new Error('Locale already set'); }
      this.locale = locale;
      return this;
    },
    async pull(rawData) {
      if (!this.locale) { throw new Error('Locale not set'); }
      this.rawData = rawData || null;

      return lDefinition.pull(rawData, this.locale);
    },
    async push(data) {
      if (!this.locale) { throw new Error('Locale not set'); }
      if (this.rawData === undefined) { throw new Error('Cannot push data without pulling first'); }

      return lDefinition.push(data, this.locale, this.rawData);
    },
    async onStart() {
      await lDefinition.onStart?.();
    },
    async onProgress(current, total) {
      await lDefinition.onProgress?.(current, total);
    },
    async onEnd() {
      await lDefinition.onEnd?.();
    },
  } as ILoader<I, O>;
}
