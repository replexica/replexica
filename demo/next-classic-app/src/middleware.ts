import { NextRequest, NextResponse } from "next/server";
import i18nJson from './../i18n.json';
 
const defaultLocale = i18nJson.locale.source;
const locales = [i18nJson.locale.source, ...i18nJson.locale.targets];

import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

function getLocale(request: any) {
  const headers = request.headers;
  let languages = new Negotiator({ headers }).languages()
  console.log({languages})
  
  // If languages is empty or contains only '*', use the default locale
  if (languages.length === 0 || (languages.length === 1 && languages[0] === '*')) {
    return defaultLocale;
  }
  
  return match(languages, locales, defaultLocale)
}
 
export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
 
  if (pathnameLocale) return NextResponse.next({
    headers: {
      'X-Locale': pathnameLocale,
    },
  });
 
  // Redirect if there is no locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  // e.g. incoming request is /products
  // The new URL is now /en-US/products

  return NextResponse.redirect(request.nextUrl, {
    headers: {
      'X-Locale': locale,
    },
  });
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
}
