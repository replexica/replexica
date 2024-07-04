// TODO: Extract into a separate package
export class LocalizedURL extends URL {
  constructor(
    url: string | URL, 
    base?: string | URL, 
    private supportedLocales?: string[],
) {
    super(url, base);
  }

  get locale(): string | null {
    const pathnameChunks = this.pathname.split('/');
    const potentialLocale = pathnameChunks[1];

    const isValidLocale = this._validateLocale(potentialLocale);

    return isValidLocale ? potentialLocale : null;
  }

  set locale(newLocale: string | null) {
    const pathnameChunks = this.pathname.split('/');
    const isNewLocaleValid = !newLocale || this._validateLocale(newLocale);
    if (!isNewLocaleValid) {
      throw new Error(`Cannot change locale on ${this.pathname} to ${newLocale} because it is not a valid locale.`);
    }

    if (this.locale) {
      if (!newLocale) {
        pathnameChunks.splice(1, 1);
      } else {
        pathnameChunks[1] = newLocale;
      }
    } else {
      if (!newLocale) {
        // Do nothing
      } else {
        pathnameChunks.splice(1, 0, newLocale);
      }
    }

    this.pathname = pathnameChunks.filter(Boolean).join('/');
  }

  private _validateLocale(locale: string) {
    const isValidCustomLocale = this.supportedLocales?.includes(locale);
    return isValidCustomLocale;
  }
}
