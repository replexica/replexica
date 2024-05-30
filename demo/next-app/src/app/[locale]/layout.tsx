import { Inter } from "next/font/google";
import { I18nProvider } from '@replexica/react/client';

import "./globals.css";
import { loadI18nFromCookie } from "@replexica/react/next";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout(props: any) {
  const i18n = await loadI18nFromCookie();

  return (
    <I18nProvider i18n={i18n}>
      <html lang={i18n.currentLocale}>
        <body className={inter.className}>{props.children}</body>
      </html>
    </I18nProvider>
  );
}
