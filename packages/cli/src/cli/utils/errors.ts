export const docLinks = {
  i18nNotFound: "https://docs.replexica.com/quickstart#initialization",
  bucketNotFound: "https://docs.replexica.com/config#buckets",
  authError: "https://docs.replexica.com/auth",
  localeTargetNotFound: "https://docs.replexica.com/config#locale",
  lockFiletNotFound: "https://docs.replexica.com/config#i18n-lock",
  failedReplexicaEngine: "https://docs.replexica.com/",
  placeHolderFailed: "https://docs.replexica.com/formats/json",
  translationFailed: "https://docs.replexica.com/setup/cli#core-command-i18n",
  connectionFailed: "https://docs.replexica.com/",
  invalidType: "https://docs.replexica.com/setup/cli#configuration-commands",
  invalidPathPattern: "https://docs.replexica.com/config#buckets",
  androidResouceError: "https://docs.replexica.com/formats/android",
  invalidBucketType: "https://docs.replexica.com/config#buckets",
  invalidStringDict: "https://docs.replexica.com/formats/xcode-stringsdict",
};

type DocLinkKeys = keyof typeof docLinks;

export class ReplexicaCLIError extends Error {
  public readonly docUrl: string;

  constructor({ message, docUrl }: { message: string; docUrl: DocLinkKeys }) {
    super(message);
    this.docUrl = docLinks[docUrl];
    this.message = `${this.message}\n visit: ${this.docUrl}`;
  }
}
