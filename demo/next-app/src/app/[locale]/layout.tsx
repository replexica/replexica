import "./globals.css";

import React from "react";
import { I18nProvider } from 'replexica/react';
import { I18n } from "replexica/react-next";

export type RootLayoutProps = { params: { locale?: string }, children: any };

export default async function RootLayout(props: RootLayoutProps) {
  const i18n = await I18n.fromRscContext();
  return (
    <I18nProvider i18n={i18n}>
      <html>
        <body>
          {props.children}
        </body>
      </html>
    </I18nProvider>
  );
}
