import { I18nScope } from "../iom";

export default function createLocaleServer(iomStorage: Record<string, I18nScope>) {
  return {
    loadDictionary(locale: string) {
      if (locale !== 'en') { return {}; }

      const dictionary: Record<string, string> = {};

      for (const [fileId, scope] of Object.entries(iomStorage)) {
        const fileDictionary = _extractDictionary(fileId, scope);
        Object.assign(dictionary, fileDictionary);
      }

      return dictionary;
    },
  };

  function _extractDictionary(fileId: string, scope: I18nScope) {
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
      const childDictionary = _extractDictionary(fileId, childScope);
      Object.assign(dictionary, childDictionary);
    }

    return dictionary;
  }
}