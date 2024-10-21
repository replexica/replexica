'use server';

import loadIntl from "@/i18n/server";

export default async function Inner() {
  const intl = await loadIntl();
  return <div>{intl.formatMessage({ id: 'inner.title' })}</div>
}
