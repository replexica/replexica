'use client';

import { Html, Head, Main, NextScript, DocumentProps } from "next/document";

export default function Document(docProps: DocumentProps) {
  return (
    <Html lang={docProps.locale}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
