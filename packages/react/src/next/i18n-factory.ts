import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import { I18nInstance } from "../shared";
import { loadLocaleFromCookie, parseLocaleCookie } from "./utils";

/**
 * I18n factory.
 */
function createI18n(locales: Record<string, () => Promise<any>> = {}) {
  return {
    /**
     * Load the I18n instance from the current React Server Components context.
     * 
     * @returns I18n instance.
     */
    async fromRscContext() {
      const locale = await loadLocaleFromCookie();
      const i18n = await _load(locale);
      return i18n;
    },

    /**
     * Load the I18n instance from the current route props.
     * 
     * @param props Route props containing the locale parameter.
     * @returns 
     */
    async fromRouteProps(props: { params: { locale?: string | null } }) {
      const i18n = await _load(props.params.locale);
      return i18n;
    },

    /**
     * Load the I18n instance from the current static context.
     * 
     * @param ctx Static context.
     * @returns I18n instance.
     */
    async fromStaticContext(ctx: GetStaticPropsContext) {
      const i18n = await _load(ctx.locale);
      return i18n;
    },

    /**
     * Load the I18n instance from the current server-side context.
     * 
     * @param ctx Server-side context.
     * @returns I18n instance.
     */
    async fromServerSideContext(ctx: GetServerSidePropsContext) {
      const locale = parseLocaleCookie(ctx.req.headers.cookie);
      const i18n = await _load(locale);
      return i18n;
    },
    /**
     * Load the I18n instance from the raw locale string.
     * 
     * @param locale Locale string.
     * @returns I18n instance.
     */
    async fromRawString(locale: string | undefined | null) {
      return await _load(locale);
    },
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
    withLoaders(newLocales: Record<string, () => Promise<any>>) {
      return createI18n(newLocales);
    },
  };

  async function _load<C>(locale: string | undefined | null): Promise<I18nInstance> {
    const supportedLocales = Object.keys(locales);
    if (supportedLocales.length === 0) {
      throw new Error('No locale dictionaries provided.');
    }

    const defaultLocale = supportedLocales[0];
    const currentLocale = locale || defaultLocale;
    const data = await locales[currentLocale]?.()
      .then((mod) => mod.default) || {};

    return {
      supportedLocales,
      defaultLocale,
      currentLocale,
      data,
    };
  }
}

/**
 * I18n loader.
 */
export const I18n = createI18n();