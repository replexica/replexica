'use client';

import "@/styles/globals.css";
import { I18nProvider } from "@replexica/react";
import type { AppProps } from "next/app";

export default function App(appProps: AppProps) {
  return (
    <I18nProvider i18n={appProps.pageProps.i18n}>
      <appProps.Component {...appProps.pageProps} />
    </I18nProvider>
  );
}
