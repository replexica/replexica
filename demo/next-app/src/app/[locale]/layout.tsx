import { Inter } from "next/font/google";
import { I18nProvider } from '@replexica/react';

import "./globals.css";
import { I18n, I18nFragment } from "@replexica/react/next";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout(props: any) {
  const i18n = await I18n.fromRscContext();

  return (
    <I18nProvider i18n={i18n}>
      <html lang={i18n.currentLocale}>
        <title>Next App Demo</title>
        <body className={inter.className}>
          {props.children}
        </body>
      </html>
    </I18nProvider>
  );
}

const oldSimpleEl = <div data-testid="title">Next.js App Router Demo</div>;
const newSimpleEl = (
  <I18nFragment
    id="title"
    component="div"
    loadI18n={() => I18n.fromRscContext()}
    attributes={{
      'data-testid': 'title',
    }}
  />
);

const oldComplexEl = (
  <div>
    <h1>Next.js App Router Demo</h1>
    <p>With i18n support</p>
  </div>
);
const newComplexEl = (
  <div>
    <I18nFragment
      id="title"
      component="h1"
      loadI18n={() => I18n.fromRscContext()}
      attributes={{}}
    />
    <I18nFragment
      id="description"
      component="p"
      loadI18n={() => I18n.fromRscContext()}
      attributes={{}}
    />
  </div>
);

const oldAttributedComplexEl = (
  <div title="Next.js App Router Demo">
    Introducing
    <h1>Next.js App Router Demo</h1>
    <p>With i18n support</p>
  </div>
);
const newAttributedComplexEl = (
  <I18nFragment
    id="root"
    component="div"
    loadI18n={() => I18n.fromRscContext()}
    localizableAttributes={['title']}
    attributes={{
      title: 'title',
    }}
  >
    <I18nFragment
      id="introducing"
      component={null}
      loadI18n={() => I18n.fromRscContext()}
      attributes={{}}
    />
    <I18nFragment
      id="title"
      component="h1"
      loadI18n={() => I18n.fromRscContext()}
      attributes={{}}
    />
    <I18nFragment
      id="description"
      component="p"
      loadI18n={() => I18n.fromRscContext()}
      attributes={{}}
    />
  </I18nFragment>
);