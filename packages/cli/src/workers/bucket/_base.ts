import _ from 'lodash';

// loaders
export interface BucketLoader<I, O> {
  load: (input: I) => Promise<O>;
  save: (payload: O) => Promise<I>;
}
export const composeLoaders = <I, O>(
  ...loaders: BucketLoader<any, any>[]
): BucketLoader<void, O> => {
  return {
    async load() {
      let payload = undefined;
      for (let i = 0; i < loaders.length; i++) {
        payload = await loaders[i].load(payload);
      }
      return payload as any;
    },
    async save(payload: O) {
      let result = payload;
      for (let i = loaders.length - 1; i >= 0; i--) {
        result = await loaders[i].save(result);
      }
      return result as any;
    },
  };
}
