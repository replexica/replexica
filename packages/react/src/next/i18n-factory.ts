'use server';

import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import { I18nInstance } from "../shared";
import { loadLocaleFromCookie, parseLocaleCookie } from "./utils";

class I18n {
  public static create() {
    return new I18n();
  }

  private constructor(
    private _locales: Record<string, () => Promise<any>> = {},
  ) {}

  private async _load<C>(locale: string | undefined | null): Promise<I18nInstance> {
    const supportedLocales = Object.keys(this._locales);
    if (supportedLocales.length === 0) {
      throw new Error('No locale dictionaries provided.');
    }

    const defaultLocale = supportedLocales[0];
    const currentLocale = locale || defaultLocale;
    const data = await this._locales[currentLocale]?.()
      .then((mod) => mod.default) || {};

    return {
      supportedLocales,
      defaultLocale,
      currentLocale,
      data,
    };
  }

  public setLoaders(locales: Record<string, () => Promise<any>>) {
    this._locales = locales;
    return this;
  }

  public withLoaders(locales: Record<string, () => Promise<any>>) {
    return new I18n(locales);
  }

  public async fromRscContext() {
    const locale = await loadLocaleFromCookie();
    const i18n = await this._load(locale);
    return i18n;
  }

  public async fromRouteProps(props: { params: { locale: string } }) {
    const i18n = await this._load(props.params.locale);
    return i18n;
  }

  public async fromStaticContext(ctx: GetStaticPropsContext) {
    const i18n = await this._load(ctx.locale);
    return i18n;
  }

  public async fromServerSideContext(ctx: GetServerSidePropsContext) {
    const locale = parseLocaleCookie(ctx.req.headers.cookie);
    const i18n = await this._load(locale);
    return i18n;
  }
}

const i18nInstance = I18n.create();

export {
  i18nInstance as I18n,
};