'use server';

import { cookies } from 'next/headers';

export async function loadLocaleFromCookie() {
  const cookieMgr = cookies();
  return cookieMgr.get('locale')?.value || 'en';
}
