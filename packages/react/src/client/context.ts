'use client';

import { createContext, useContext } from "react";
import { I18nInstance } from "../shared";

export const I18nContext = createContext<I18nInstance>({
  currentLocale: 'en',
  defaultLocale: 'en',
  supportedLocales: ['en'],
  data: {} as any,
});

export const useI18n = () => useContext(I18nContext);
