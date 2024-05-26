import { Inter } from "next/font/google";
import i18n from '@/i18n';

import { I18nProvider } from '@replexica/react/client';

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await i18n.init();

  return (
    <I18nProvider params={i18n.params} data={i18n.data}>
      <html lang={i18n.params.currentLocale}>
        <title>Create Next App</title>
        <body className={inter.className}>{children}</body>
      </html>
    </I18nProvider>
  );
}