export const docLinks = {
  i18nNotFound: "https://docs.lingo.dev/quickstart#initialization",
  bucketNotFound: "https://docs.lingo.dev/config#buckets",
  authError: "https://docs.lingo.dev/auth",
  localeTargetNotFound: "https://docs.lingo.dev/config#locale",
  lockFiletNotFound: "https://docs.lingo.dev/config#i18n-lock",
  failedReplexicaEngine: "https://docs.lingo.dev/",
  placeHolderFailed: "https://docs.lingo.dev/formats/json",
  translationFailed: "https://docs.lingo.dev/setup/cli#core-command-i18n",
  connectionFailed: "https://docs.lingo.dev/",
  invalidType: "https://docs.lingo.dev/setup/cli#configuration-commands",
  invalidPathPattern: "https://docs.lingo.dev/config#buckets",
  androidResouceError: "https://docs.lingo.dev/formats/android",
  invalidBucketType: "https://docs.lingo.dev/config#buckets",
  invalidStringDict: "https://docs.lingo.dev/formats/xcode-stringsdict",
};

type DocLinkKeys = keyof typeof docLinks;

export class CLIError extends Error {
  public readonly docUrl: string;

  constructor({ message, docUrl }: { message: string; docUrl: DocLinkKeys }) {
    super(message);
    this.docUrl = docLinks[docUrl];
    this.message = `${this.message}\n visit: ${this.docUrl}`;
  }
}
