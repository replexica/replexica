import { Inter } from "next/font/google";
import { I18nProvider } from '@replexica/react';

import "./globals.css";
import { I18n } from "@replexica/react/next";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout(props: any) {
  const i18n = await I18n.fromRscContext();
  return (
    <I18nProvider i18n={i18n}>
      <html>
        <head>
          <title>Next App Demo</title>
        </head>
        <body className={inter.className}>
          <span
            title="This is a title attribute of a span element."
          />
          <MySpan
            title="This is a title attribute of a custom span element."
          />
          <MySpan.Inner
            title="This is a title attribute of a custom inner span element."
          />
          {props.children}
        </body>
      </html>
    </I18nProvider>
  );
}

function MySpan(props: any) {
  return <span>{props.children}</span>
}

MySpan.Inner = MyInnerSpan;

function MyInnerSpan(props: any) {
  return <span>{props.children}</span>
}