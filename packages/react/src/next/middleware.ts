'use server';

import { NextFetchEvent, NextResponse, type NextRequest } from "next/server";
import { createLocaleCookieString, createLocaleExtractor, createLocalePicker } from "./utils";
import { LocalizedURL } from "../shared/localized-url";
import { CreateI18nResult } from "../shared";

export type NextI18nMiddlewareParams = {
  explicitDefaultLocale?: boolean;
};

const defaultParams: NextI18nMiddlewareParams = {
  explicitDefaultLocale: false,
};

export const createI18nMiddleware = (i18n: CreateI18nResult, params = defaultParams) =>
  (originalMiddleware = async (_req: NextRequest, _event: NextFetchEvent) => NextResponse.next()) =>
    async (req: NextRequest, event: NextFetchEvent) => {
      const isHtmlRequest = req.headers.get('accept')?.includes('text/html');
      if (!isHtmlRequest) { return NextResponse.next(); }

      const extractor = createLocaleExtractor(req, i18n.params.supportedLocales);
      const explicitLocale = extractor.fromPath();
      const savedLocale = extractor.fromCookie();
      const browserLocale = extractor.fromBrowser();

      const picker = createLocalePicker(i18n.params.supportedLocales, i18n.params.defaultLocale);

      const finalLocale = picker.pick(
        explicitLocale,
        savedLocale,
        browserLocale,
      );

      const correctUrl = new LocalizedURL(req.url, undefined, i18n.params.supportedLocales);

      if (finalLocale === i18n.params.defaultLocale && !params.explicitDefaultLocale) {
        correctUrl.locale = null;
      } else {
        correctUrl.locale = finalLocale;
      }

      const needsCookieSetting = savedLocale !== finalLocale;
      const needsUrlUpdate = req.url !== correctUrl.toString();

      if (needsCookieSetting || needsUrlUpdate) {
        const cookieValue = createLocaleCookieString(finalLocale);
        return NextResponse.redirect(correctUrl.toString(), {
          status: 307,
          headers: { 'Set-Cookie': cookieValue },
        });
      } else {
        return originalMiddleware(req, event);
      }
    };
