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
  ) { }

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

  /**
   * 
   * THIS METHOD IS FOR INTERNAL USE ONLY.
   * 
   * Set the loaders for the I18n instance.
   * 
   * @param locales Locales and their loaders.
   * @returns Current I18n instance.
   * 
   * @deprecated 
   */
  public setLoaders(locales: Record<string, () => Promise<any>>) {
    this._locales = locales;
    return this;
  }

  /**
   * Load the I18n instance from the current React Server Components context.
   * 
   * @returns I18n instance.
   */
  public async fromRscContext() {
    const locale = await loadLocaleFromCookie();
    const i18n = await this._load(locale);
    return i18n;
  }

  /**
   * Load the I18n instance from the current route props.
   * 
   * @param props Route props containing the locale parameter.
   * @returns 
   */
  public async fromRouteProps(props: { params: { locale: string } }) {
    const i18n = await this._load(props.params.locale);
    return i18n;
  }

  /**
   * Load the I18n instance from the current static context.
   * 
   * @param ctx Static context.
   * @returns I18n instance.
   */
  public async fromStaticContext(ctx: GetStaticPropsContext) {
    const i18n = await this._load(ctx.locale);
    return i18n;
  }

  /**
   * Load the I18n instance from the current server-side context.
   * 
   * @param ctx Server-side context.
   * @returns I18n instance.
   */
  public async fromServerSideContext(ctx: GetServerSidePropsContext) {
    const locale = parseLocaleCookie(ctx.req.headers.cookie);
    const i18n = await this._load(locale);
    return i18n;
  }

  /**
   * Load the I18n instance from the raw locale string.
   * 
   * @param locale Locale string.
   * @returns I18n instance.
   */
  public async fromRawString(locale: string | undefined | null) {
    return await this._load(locale);
  }
}

/**
 * I18n loader.
 */
const i18nInstance = I18n.create();

export {
  i18nInstance as I18n,
};