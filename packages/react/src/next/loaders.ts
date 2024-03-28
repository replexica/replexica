'use server';

import { cookies } from 'next/headers';

export async function loadLocaleFromCookie() {
  const cookieMgr = cookies();
  return cookieMgr.get('REPLEXICA_LOCALE')?.value || 'en';
}
