import { ReplexicaEngine } from '@replexica/sdk';
import { I18nScope } from "../iom";
import _ from 'lodash';

export default function createLocaleServer(sourceLocale: string, iomStorage: Record<string, I18nScope>) {
  const localizer = createCachedRemoteLocalizer();
  return {
    async loadDictionary(targetLocale: string) {
      const dictionary = _extractDictionaryFromIom(iomStorage);
      return localizer.localize(dictionary, sourceLocale, targetLocale);
    },
  };
}

// cached remote localizer stores the result of the remote localize call in a local object
// and every time a new localizer call is made, it calculates the difference with cache and
// only translates the changed keys, then it merges the result with the cache and returns the final result
const cache = new Map<string, Record<string, string>>();
function createCachedRemoteLocalizer() {
  const remoteLocalizer = createRemoteLocalizer();

  function hashValue(value: string): string {
    // Simple hash function, you might want to use a more robust one
    return Buffer.from(value).toString('base64');
  }

  return {
    async localize(dictionary: Record<string, string>, sourceLocale: string, targetLocale: string) {
      // calculate cache key
      const cacheKey = `${sourceLocale}-${targetLocale}`;
      // get dictionary cache
      const dictionaryCache = cache.get(cacheKey) || {};
      // create a subobject of dictionary using existing values in the dictionary cache
      const cachedDictionary = _.pickBy(dictionary, (value, key) => dictionaryCache[key] === hashValue(value));
      // calculate the difference between the dictionary and the cached dictionary
      const changedDictionary = _.pickBy(dictionary, (value, key) => !cachedDictionary[key]);
      // if there are no changed keys, return the cached dictionary
      if (_.isEmpty(changedDictionary)) {
        return cachedDictionary;
      }
      // translate the changed dictionary
      const translatedChangedDictionary = await remoteLocalizer.localize(changedDictionary, sourceLocale, targetLocale);
      // merge the translated changed dictionary with the cached dictionary
      const finalDictionary = { ...cachedDictionary, ...translatedChangedDictionary };
      // create a new cache subobject from the translated changed dictionary
      const dictionaryCacheUpdate = _.mapValues(translatedChangedDictionary, hashValue);
      // merge the dictionary cache update with the existing dictionary cache
      const newDictionaryCache: Record<string, any> = { ...dictionaryCache, ...dictionaryCacheUpdate };
      // store the new dictionary cache
      cache.set(cacheKey, newDictionaryCache);
      // return the final dictionary
      return finalDictionary;
    },
  };
}

function createRemoteLocalizer() {
  const rplx = new ReplexicaEngine({
    apiKey: process.env.REPLEXICA_API_KEY,
    apiUrl: process.env.REPLEXICA_API_URL,
  });
  return {
    async localize(dictionary: Record<string, string>, sourceLocale: string, targetLocale: string) {
      if (targetLocale === sourceLocale) {
        return dictionary;
      }

      const data = await rplx.localizeObject(dictionary, {
        sourceLocale,
        targetLocale,
      });
      return data;
    },
  };
}

function createFakeLocalizer() {
  return {
    async localize(dictionary: Record<string, string>, sourceLocale: string, targetLocale: string) {
      if (targetLocale === sourceLocale) {
        return dictionary;
      }

      const newDictionary: Record<string, string> = {};
      for (const [key, value] of Object.entries(dictionary)) {
        newDictionary[key] = `[${targetLocale}] ${value}`;
      }
      return newDictionary;
    },
  };
}


function _extractDictionaryFromIom(iomStorage: Record<string, I18nScope>) {
  const dictionary: Record<string, string> = {};

  for (const [fileId, scope] of Object.entries(iomStorage)) {
    const fileDictionary = _extractDictionaryFromIomPart(fileId, scope);
    Object.assign(dictionary, fileDictionary);
  }

  return dictionary;
}

function _extractDictionaryFromIomPart(fileId: string, scope: I18nScope) {
  const dictionary: Record<string, string> = {};

  for (const fragment of scope.fragments) {
    const key = [
      fileId,
      scope.index,
      fragment.index,
    ].join('#');

    dictionary[key] = fragment.data.value;
  }

  for (const childScope of scope.scopes) {
    const childDictionary = _extractDictionaryFromIomPart(fileId, childScope);
    Object.assign(dictionary, childDictionary);
  }

  return dictionary;
}
