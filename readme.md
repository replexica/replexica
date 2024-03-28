<p align="center">
<img src="./content/banner.light.png#gh-light-mode-only">
<img src="./content/banner.dark.png#gh-dark-mode-only">
</p>

# Replexica

Replexica is a free, open-source compiler plugin for React, paired with an AI translation platform. It's a toolset that enables React apps to speak many languages.

![GitHub License](https://img.shields.io/github/license/replexica/replexica)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/replexica/replexica/release)

Why does this matter? Because 75% of the world doesn't speak English. If the app is multilingual, it can serve many more users. But, let's be honest, making an app multilingual is a headache. You have to extract strings to JSON files and update translations every time something changes.

That's where Replexica comes in: it's a build system plugin that translates React apps into multiple languages using AI. The best part? It doesn't require messing around with extracting or maintaining JSON files.

## The API

```js
import compiler from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {};

/** @type {import('@replexica/compiler').ReplexicaConfig} */
const replexicaConfig = {
  locale: {
    source: 'en',
    targets: ['es'],
  },
};

export default compiler.next(
  replexicaConfig,
  nextConfig,
);

```

## The Roadmap

- [x] Replexica Compiler
  - [x] Next.js App Router
  - [ ] Next.js Pages Router
  - [ ] Remix
  - [ ] Create React App
- [x] Replexica Framework
  - [x] JSX translation
  - [x] Custom context hints
  - [x] Skipper for non-translatable text
  - [x] Avoid fetching unused translations
  - [x] Translation of JSX attributes (title, alt, placeholder)
  - [ ] Translation of generic literals with helper functions
  - [ ] Translation of arbitrary attributes
- [x] Replexica Platform
  - [x] AI Translation Engine
  - [x] Translation memory
  - [x] Context awareness aka **Brand voice**
  - [ ] Supported locales (production-ready, state-of-the-art quality)
    - [x] English
    - [x] Spanish
    - [ ] French (April 2024)
    - [ ] German (April 2024)
    - [ ] (Create a GitHub issue )
  - [ ] Automated i18n quality checks (May 2024)
  - [ ] Documentation/examples on self-hosted translation engine
- [x] Replexica CLI
  - [x] CLI for Replexica Platform
  - [x] Open-source API schema
  - [ ] GitHub Actions integration

The Replexica compiler is open-source, and the API is open, allowing you to build your own translation engine. We're also developing our own AI translation platform ([replexica.com](https://replexica.com)), to make it even easier to launch your first multi-language app!

## How it Works

Replexica is a compiler plugin that integrates with the build system, collecting all user-facing text in the app and preparing it for translation with the Replexica platform. Here's how it works:

1. **Infers** metadata from your app, such as the text that needs to be translated and its context. This metadata is then stored alongside the build artifacts.
1. **Translates** the text using the CLI that connects to the Replexica platform. The platform uses AI to translate the text, and the more you use it, the better it gets. The API is open, so you can build your own translation engine if you wish!
1. **Injects** the translations back into your app, so that the translated text is displayed to the user, based on their locale.

With Replexica, you can build multi-language apps without the hassle of managing JSON files, and with the power of AI translation.

## The Replexica Rule

At Replexica, we believe in the elegance of [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration) principle.

Therefore, there's an important rule to remember when using Replexica:

> [!TIP]
> Place translatable text inside `JSX`.

As long as you follow this rule, the Replexica Compiler can automatically infer the metadata from your app and prepare the text inside JSX for translation.

If you don't follow the rule and decide to store some of your translatable content in variables, that **can be translated too**, but you'll need to manually wrap that text in a helper function.

So, if you want a hassle-free i18n on autopilot, **follow The Replexica Rule** whenever possible.

## Getting Started

#### Step 1. Install Replexica

```bash
pnpm add replexica @replexica/compiler @replexica/react
```

#### Step 2. Configure NextJS

```js
// next.config.mjs

import compiler from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {};

/** @type {import('@replexica/compiler').ReplexicaConfig} */
const replexicaConfig = {
  locale: {
    source: 'en', // Language the app's content is in
    targets: ['es'], // Target language(s)
  },
};

export default compiler.next(
  replexicaConfig,
  nextConfig,
);

```

#### Step 3. Configure React App

> [!NOTE]
> This guide is for Next.js App Router apps only. Guides for other setups are coming soon (ETA April 2024).

If you plan on having `'use client'` components in your app (you probably do), you'll need to also wrap your entire component tree in `<ReplexicaProvider />`:

```jsx
import { ReplexicaIntlProvider } from '@replexica/react/client';
import { loadLocaleFromCookie } from '@replexica/react/next';

// ... rest of the code

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

## How to Switch Between Languages

Different apps use different strategies for switching between supported languages. Here are a few approaches we've seen:

- Cookie value (get/set cookie value)
- Subdomain (`en.myapp.com` / `es.myapp.com`)
- TLD domain (`myapp.com` / `myapp.es`)
- Pathname segments (`myapp.com/en` / `myapp.com/es`)

... and so on.

To support every possible strategy, now and in the future, Replexica does the following:

*Replexica reads the value of the `REPLEXICA_LOCALE` cookie to determine the currently selected locale*

So, whatever approach you choose for switching between locales, just be sure to update the value of the `REPLEXICA_LOCALE` cookie, and Replexica will handle the rest.

## Questions?

If you have any questions, feel free to create a GitHub issue!
