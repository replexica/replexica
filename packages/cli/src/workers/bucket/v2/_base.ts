import _ from 'lodash';

// loaders
export interface BucketLoader<I, O> {
  load: (input: I, locale: string) => Promise<O>;
  save: (payload: O, locale: string) => Promise<I>;
}
export type CreateBucketLoaderFactoryOptions<I, O> = {
  load: (input: I, locale: string) => Promise<O>;
  save: (payload: O, locale: string, input: I, originalPayload: O) => Promise<I>;
};
export const createLoader = <I, O>(options: CreateBucketLoaderFactoryOptions<I, O>): BucketLoader<I, O> => {
  let _input: I | null = null;
  let _originalPayload: O | null = null;
  return {
    async load(input: I, locale: string) {
      _input = input;
      _originalPayload = await options.load(input, locale);
      return _originalPayload;
    },
    async save(payload, locale) {
      if (!_input) {
        throw new Error('No input to save to');
      }
      if (!_originalPayload) {
        throw new Error('No original payload to compare with');
      }

      await options.save(payload, locale, _input, _originalPayload);
      
      return _input;
    },
  };
}
export const composeLoaders = <I, O>(
  ...loaders: BucketLoader<any, any>[]
): BucketLoader<I, O> => {
  return {
    async load(input: I, locale: string) {
      let payload = input;
      for (let i = 0; i < loaders.length; i++) {
        payload = await loaders[i].load(payload, locale);
      }
      return payload as any;
    },
    async save(payload: O, locale: string) {
      let result = payload;
      for (let i = loaders.length - 1; i >= 0; i--) {
        result = await loaders[i].save(result, locale);
      }
      return result as any;
    },
  };
}
