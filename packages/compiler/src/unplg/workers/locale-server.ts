import { I18nScope } from "../iom";

export default function createLocaleServer(iomStorage: Record<string, I18nScope>) {
  const remoteLocaleServer = createFakeRemoteLocaleServer(iomStorage);
  return {
    async loadDictionary(locale: string) {
      const data = await remoteLocaleServer.loadDictionary(locale);
      return data;
    },
  };
}

function createFakeRemoteLocaleServer(iomStorage: Record<string, I18nScope>) {
  return {
    async loadDictionary(locale: string) {
      // delay for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      const dictionary: Record<string, string> = {};

      for (const [fileId, scope] of Object.entries(iomStorage)) {
        const fileDictionary = _extractDictionary(fileId, scope);
        Object.assign(dictionary, fileDictionary);
      }

      if (locale === 'en') {
        return dictionary;
      } else {
        for (const [key] of Object.entries(dictionary)) {
          dictionary[key] = `[${locale}] ${dictionary[key]}`;
        }
        return dictionary;
      }
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