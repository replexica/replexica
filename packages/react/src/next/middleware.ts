import { NextFetchEvent, NextResponse, type NextRequest } from "next/server";
import { I18nConfig } from "@replexica/spec";
import {
  createLocaleCookieString,
  createLocaleExtractor,
  createLocalePicker,
} from "./utils";
import { LocalizedURL } from "../shared/localized-url";

export type NextI18nMiddlewareParams = {
  // explicitDefaultLocale?: boolean;
};

const defaultParams: NextI18nMiddlewareParams = {
  // explicitDefaultLocale: false,
};

export const createI18nMiddleware =
  (i18nConfig: I18nConfig, params = defaultParams) =>
  (
    originalMiddleware = async (_req: NextRequest, _event: NextFetchEvent) =>
      NextResponse.next(),
  ) =>
  async (req: NextRequest, event: NextFetchEvent) => {
    const isHtmlRequest = req.headers.get("accept")?.includes("text/html");
    if (!isHtmlRequest) {
      return NextResponse.next();
    }

    const defaultLocale = i18nConfig.locale.source;
    const supportedLocales: string[] = Array.from(
      new Set([i18nConfig.locale.source, ...i18nConfig.locale.targets]),
    ).filter(Boolean);

    const extractor = createLocaleExtractor(req, supportedLocales);
    const potentialLocale = extractor.fromPath();
    const savedLocale = extractor.fromCookie();
    const browserLocale = extractor.fromBrowser();

    const picker = createLocalePicker(supportedLocales, defaultLocale);

    const finalLocale = picker.pick(
      potentialLocale,
      savedLocale,
      browserLocale,
    );

    const correctUrl = new LocalizedURL(req.url, undefined, supportedLocales);
    correctUrl.locale = finalLocale;

    const needsCookieSetting = savedLocale !== finalLocale;
    const needsUrlUpdate = req.url !== correctUrl.toString();

    if (needsCookieSetting || needsUrlUpdate) {
      const cookieValue = createLocaleCookieString(finalLocale);
      return NextResponse.redirect(correctUrl.toString(), {
        status: 307,
        headers: { "Set-Cookie": cookieValue },
      });
    } else {
      return originalMiddleware(req, event);
    }
  };
