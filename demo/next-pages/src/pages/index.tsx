'use client';

import { GetServerSidePropsContext } from 'next';
import { I18n } from '@replexica/react/next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const i18n = await I18n.fromServerSideContext(context);

  return { props: { i18n } };
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
