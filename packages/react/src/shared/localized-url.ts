import iso_639_1 from 'iso-639-1';

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
    if (!newLocale) {
      pathnameChunks.splice(1, 1);
    } else {
      const isValidLocale = this._validateLocale(newLocale);
      if (!isValidLocale) {
        throw new Error(`Cannot change locale on ${this.pathname} to ${newLocale} because it is not a valid locale.`);
      }
      pathnameChunks[1] = newLocale;
    }
    this.pathname = pathnameChunks.join('/');
  }

  private _validateLocale(locale: string) {
    const isValidIsoLocale = iso_639_1.validate(locale);
    const isValidCustomLocale = this.supportedLocales?.includes(locale);
    return isValidIsoLocale || isValidCustomLocale;
  }
}