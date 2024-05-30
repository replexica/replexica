'use server';

import { loadLocaleFromCookie } from "./utils";
import { I18nInstance } from "../shared";

export type I18nFactoryParams<C> = {
  resolver: (ctx: C) => Promise<string | null>;
  locales: Record<string, () => Promise<any>>,
};

function createI18nLoader<C>(params: I18nFactoryParams<C>) {
  return async function load(ctx: C): Promise<I18nInstance> {
    const supportedLocales = Object.keys(params.locales);
    if (supportedLocales.length === 0) {
      throw new Error('No locale dictionaries provided.');
    }

    const defaultLocale = supportedLocales[0];
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

export async function loadI18nFromParam(
  locale: string | undefined,
  locales: Record<string, () => Promise<any>> = {},
) {
  const loader = createI18nLoader({
    resolver: async (ctx: string | null) => ctx,
    locales,
  });

  const i18n = await loader(locale || null);
  return i18n;
}

export async function loadI18nFromCookie(
  locales: Record<string, () => Promise<any>> = {},
) {
  const loader = createI18nLoader<void>({
    resolver: () => loadLocaleFromCookie(),
    locales,
  });

  const i18n = await loader();
  return i18n;
}