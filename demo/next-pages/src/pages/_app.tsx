import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ReplexicaIntlProvider } from '@replexica/react/client';
import { useMemo } from "react"; 

// @ts-ignore
import enDict from '@replexica/translations/en.client.json';

export default function App({ Component, pageProps, router }: AppProps) {
  const dict = useMemo(getDict, [router.locale]);
  return (
    <ReplexicaIntlProvider
      data={dict}
    >
      <Component {...pageProps} />
    </ReplexicaIntlProvider>
  );

  function getDict() {
    switch (router.locale) {
      case 'en':
        return enDict;
      default:
        return {};
    }
  }
}
