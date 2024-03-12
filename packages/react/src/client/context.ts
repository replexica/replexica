'use client';

import { createContext } from "react";

export type ReplexicaIntlContext = {
  data: any;
};

export const replexicaContext = createContext<ReplexicaIntlContext | null>(null);
