import Cookie from "cookie";
import Negotiator from "negotiator";

const LOCALE_COOKIE = "locale";

export function createLocaleExtractor(
  req: Request,
  supportedLocales: string[],
) {
  return {
    fromCookie: () => {
      const cookieHeader = req.headers.get("Cookie") || "";
      const locale = parseLocaleCookie(cookieHeader);
      return locale;
    },
    fromBrowser: () => {
      const headerValue = req.headers.get("accept-language") || "";
      const negotiator = new Negotiator({
        headers: { "accept-language": headerValue },
      });
      const locales = negotiator.languages(supportedLocales).filter(Boolean);
      return locales;
    },
    fromPath: () => {
      const reqUrl = new URL(req.url);
      const pathParts = reqUrl.pathname.split("/");
      const locale = pathParts[1] || null;
      return locale;
    },
  };
}

export function createLocalePicker(
  supportedLocales: string[],
  defaultLocale: string,
) {
  return {
    pick: function (...localeOptions: (null | string | string[])[]) {
      for (const localeOption of localeOptions) {
        if (!localeOption) {
          continue;
        }

        const localeOptionArray = Array.isArray(localeOption)
          ? localeOption
          : [localeOption];
        const firstSupportedLocale = localeOptionArray.find((locale) =>
          supportedLocales.includes(locale),
        );
        if (firstSupportedLocale) {
          return firstSupportedLocale;
        }
      }

      return defaultLocale;
    },
  };
}

export function createLocaleCookieString(locale: string) {
  return `${LOCALE_COOKIE}=${locale}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${10 * 365 * 24 * 60 * 60};`;
}

export function parseLocaleCookie(cookieHeader: string | undefined) {
  const cookie = Cookie.parse(cookieHeader || "");
  return cookie[LOCALE_COOKIE] || null;
}

export const loadLocaleFromCookie = async () => {
  const cookiesModule = await import("next/headers").then((m) => m.cookies);
  const cookieMgr = cookiesModule();
  const localeCookieValue = parseLocaleCookie(cookieMgr.toString());
  return localeCookieValue || null;
};
