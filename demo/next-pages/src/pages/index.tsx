'use client';

import { GetStaticPropsContext } from 'next';
import i18n from '../../i18n.mjs';

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      i18n: {
        data: await i18n.loadLocale(context.locale!),
      },
    }
  };
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        Get started fast by editing the source code and saving your changes.
      </p>
      <p className="text-4xl font-bold text-center">
        Welcome to Replexica!
      </p>
    </main>
  );
}
