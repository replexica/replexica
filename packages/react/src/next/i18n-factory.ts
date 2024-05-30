'use server';

import { GetStaticPropsContext } from "next";
import { loadLocale } from "./utils";

export type I18nFactoryParams<C> = {
  resolver: (ctx: C) => Promise<string | null>;
  locales: Record<string, () => Promise<any>>,
};

export const localeResolvers = {
  cookie: async function (ctx: void) {
    const locale = await loadLocale();
    return locale;
  },
  staticProps: async function (ctx: GetStaticPropsContext) {
    const locale = ctx.locale || null;
    return locale;
  },
};

export function createI18nLoader<C = string>(params: I18nFactoryParams<C>) {
  return async function load(ctx: C) {
    const supportedLocales = Object.keys(params.locales);
    const defaultLocale = supportedLocales[0]!;
    const currentLocale = await params.resolver(ctx) || defaultLocale;
    const data = await params.locales[currentLocale]?.()
      .then((mod) => mod.default) || {};

    return {
      supportedLocales,
      defaultLocale,
      currentLocale,
      data,
    };
  }
}

export async function loadI18nFromStaticProps(
  ctx: GetStaticPropsContext,
  locales: I18nFactoryParams<GetStaticPropsContext>['locales'],
) {
  return createI18nLoader({
    resolver: localeResolvers.staticProps,
    locales,
  })(ctx);
}

export async function loadI18nFromCookie(
  locales: I18nFactoryParams<void>['locales'],
) {
  return createI18nLoader({
    resolver: localeResolvers.cookie,
    locales,
  })();
}

export async function loadI18nFromString(
  locale: string,
  locales: I18nFactoryParams<string>['locales'],
) {
  return createI18nLoader({
    resolver: async (str) => str,
    locales,
  })(locale);
}