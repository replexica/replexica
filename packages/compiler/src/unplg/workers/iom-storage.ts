import { I18nScope } from "../iom";

export default function createIomStorage() {
  const iomStorage: Record<string, I18nScope> = {};

  return {
    storage: iomStorage,
    pushScope(fileId: string, scope: I18nScope) {
      iomStorage[fileId] = scope;
    },
  };
}

