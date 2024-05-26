'use client';

import "@/styles/globals.css";
import { I18nProvider } from "@replexica/react/client";
import type { AppProps } from "next/app";

export default function App(appProps: AppProps) {
  return (
    <I18nProvider
      params={{
        currentLocale: appProps.router.locale!,
        defaultLocale: appProps.router.defaultLocale!,
        supportedLocales: appProps.router.locales!,
      }}
      data={appProps.pageProps.i18n?.data || {}}
    >
      <appProps.Component {...appProps.pageProps} />;
    </I18nProvider>
  );
}
