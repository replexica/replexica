# Getting Started

As mentioned in the [README](README.md), today Replexica works incredibly well only with Nextjs (App Router).

While we're working hard to make it work with other frameworks, let's see how to get started with Nextjs!

> [!TIP]
> Before applying Replexica to your project, we recommend finishing the tutorial, to learn the basics.

## Installation

First, let's create a brand new Nextjs project (be sure to choose app router when prompted):

```bash
pnpm create next-app replexica-demo
cd replexica-demo
```

Then, let's install Replexica:

```bash
pnpm add replexica @replexica/react @replexica/compiler
```

Lastly, let's login to Replexica API:

```bash
pnpm replexica auth --login
```

## Configuration

Now, let's update the content of the `next.config.mjs` file to enable Replexica compiler:

```js
// next.config.mjs

import replexica from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {};

/** @type {import('@replexica/compiler').ReplexicaConfig} */
const replexicaConfig = {
  locale: {
    source: 'en',
    targets: ['es'],
  },
};

export default replexica.next(
  replexicaConfig,
  nextConfig,
);

```

## Build

If you haven't already, authenticate with the Replexica platform:

```bash
pnpm replexica auth --login
```

Now, let's perform the initial build of our app:

```bash
pnpm run build
```

Next, let's process the translations using the Replexica API:

```bash
pnpm replexica i18n
```

Now, let's build the app again, to inject translations into the build output (Sorry for the double build, we're working on it! 🙏):

```bash
pnpm run build
```

Finally, let's start the app:

```bash
pnpm run start
```

## Test

Now, let's test the app by visiting [http://localhost:3000](http://localhost:3000) in your browser.

You should see the app in English, at first. To quickly check that everything works, run the following code in your browser's console:

```js
document.cookie = "REPLEXICA_LOCALE=es; path=/;";
location.reload();
```

... and you should see the app in Spanish!

To switch back to English, run:

```js
document.cookie = "REPLEXICA_LOCALE=en; path=/;";
location.reload();
```

In the real-world scenario, you would use a language switcher to change the locale. If you need advice on how to implement it fast - send us a message in the [Discord channel](https://discord.gg/GeK6AuSqzw), and we will help!

## Bonus: `use client` components

If you plan on having `'use client'` components *at least somewhere* in your app, you'll need to also wrap your entire component tree in `<ReplexicaProvider />`.

Replace the content of the `src/app/layout.tsx` file with the following:

```tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { ReplexicaIntlProvider } from '@replexica/react/client';
import { loadLocaleFromCookie } from '@replexica/react/next';

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await loadLocaleFromCookie();
  // Note the .client.json suffix of the i18n file below.
  // It means that only the values *actually used* get passed to the client, not the entire i18n dictionary.
  const localeData = await import(`@replexica/translations/${locale}.client.json`).then((m) => m.default);
  return (
    <ReplexicaIntlProvider data={localeData}>
      <html lang={locale}>
        <body className={inter.className}>{children}</body>
      </html>
    </ReplexicaIntlProvider>
  );
}
```

To test the `use client` components, let's create a new route. First, create a new file `src/app/client/page.tsx` with the following content:

```tsx
export { default } from './content';
```

Then, create a new file `src/app/client/content.tsx` with the following content:

```tsx
'use client';

export default function Content() {
  return (
    <div>
      Hello from <a href="https://react.dev/reference/react/use-client"> client component</a>!
    </div>
  );
}
```

As you see, there is a `'use client'` directive at the top of the file. As a reminder, that means this particular component will be rendered on the client-side only, and the server will not see it, which is exactly what we want for this example.

Now, let's rebuild the app and fetch missing translations from our LLM-powered Replexica API:

```bash
pnpm run build
pnpm replexica i18n
pnpm run build
```

Finally, let's start the app again:

```bash
pnpm run start
```

Now, visit [http://localhost:3000/client](http://localhost:3000/client) in your browser. You should see the `use client` content!

Run the following code in your browser's console to switch the locale to Spanish:

```js
document.cookie = "REPLEXICA_LOCALE=es; path=/;";
location.reload();
```

and the following code to switch back to English:

```js
document.cookie = "REPLEXICA_LOCALE=en; path=/;";
location.reload();
```

## Conclusion

That's it! You've successfully set up Replexica with Nextjs!

Now that you've completed the tutorial, you can start applying Replexica to your own projects.

If you have any questions - drop them in our new [Discord channel](https://discord.gg/GeK6AuSqzw)!
