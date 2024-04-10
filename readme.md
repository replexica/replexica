<p align="center">
<img src="./content/banner.light.png#gh-light-mode-only">
<img src="./content/banner.dark.png#gh-dark-mode-only">
</p>

# Replexica

[![Discord](https://img.shields.io/discord/1193198600298172486?label=discord
)](https://discord.gg/GeK6AuSqzw)
![GitHub last commit](https://img.shields.io/github/last-commit/replexica/replexica)
[![Release](https://github.com/replexica/replexica/actions/workflows/release.yml/badge.svg)](https://github.com/replexica/replexica/actions/workflows/release.yml)
[![GitHub License](https://img.shields.io/github/license/replexica/replexica)](https://github.com/replexica/replexica/blob/main/LICENSE.md)

Replexica is an AI-powered i18n API for building multi-language React apps.

It ships in two parts:

1. **Replexica Compiler** - an open-source compiler plugin for React;
1. **Replexica API** - an i18n API in the cloud that performs translations, using AI models.

_Looking to jump right in? Check out the [Getting Started](/getting-started.md) guide for Next.js App Router!_

## Why

75% of the world doesn't speak English. So, if the app is multilingual, it can reach many more users!

But, making an app multilingual is a headache: extracting text, managing JSON files, asking a native-speaking teammate to double-check the translations... Oftentimes, it's a lot of work.

That's where Replexica comes in: it's an AI-powered i18n engine, that integrates with React, to make the app multilingual right during the build, and scale to more international users much faster.

The best part - _you don't even have to deal with JSON files!_ (You can though, if you want to, Replexica supports that too.)

### Does Replexica work with ... ?

Please drop by our new [Discord channel](https://discord.gg/GeK6AuSqzw) and ask! Our co-founder Max is online almost 24/7.

## API

> [!NOTE]
> This guide is for Next.js App Router apps only. Support for other setups is coming soon (ETA April 2024). <https://github.com/replexica/replexica/issues/25>

While the full getting started guide is below, here's a quick TLDR of the changes needed to get Replexica up and running in a modern Next.js app:

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

## What is Replexica

Replexica is an AI-powered i18n engine for React, and it consists of **two main parts**:

1. **Replexica i18n Compiler** (this repo) - an open-source compiler plugin for React:
    * Doesn't require extracting strings into JSON files;
    * Seamlessly integrates with React build system;
    * Infers metadata and user-facing text from the app;
    * Prepares the content for translation.

1. **Replexica i18n API** ([replexica.com](https://replexica.com)) - an i18n API in the cloud that translates apps into multiple languages, using LLMs, fast:
    * ~~$0/mo + usage and Free tier (w/ fair usage policy);~~ Entirely free, during the launch period;
    * Full context awareness + brand voice;
    * State-of-the-art quality translations (adding even more new languages soon!) via a mix of open-source and proprietary AI models;
    * API is open, so anyone could build their own translation engine (self-hosting guide coming soon).

The core idea behind Replexica is simple: apps must be multi-language by default, from day one. **The Internet is global, and so should be any software that runs on it!**

## How it Works

Replexica Compiler integrates with the build system, collecting all user-facing text in the app and preparing it for translation with the Replexica Cloud.

Here's how it works:

1. **Infers** metadata from the app, such as the text that needs to be translated and its context. This metadata is then stored alongside the build artifacts.
1. **Translates** the text using the CLI that connects to the Replexica Cloud. The cloud engine uses AI to translate the text, and the more it's used, the better it gets. Also, the API is open, so that everyone can build their own translation engine if desired.
1. **Injects** the translations back into the app, so that the translated text is displayed to the user, based on their locale, when React renders the app.

With Replexica, you can build multi-language apps without the hassle of dealing with i18n JSON files, and with the power of AI-powered translation engine!

## OSS + Commercial

### Open Source

Everyone in the world deserves to have access to great software. And we believe that making software multilingual is the most important step towards removing digital barriers.

That's why Replexica Compiler is open source: so that anyone can start building multi-language apps quickly and ship them to the world faster!

### Commercial

Replexica API, the commercial part of Replexica, is where we hope to start making money in the future. We don't have a clear business model yet, but we're thinking $0/month + usage, along with a free tier (with a fair usage policy), would be a good start.

Having built hundreds of side-projects ourselves, we're committed to making Replexica an affordable / free tool for indie hackers and hobbyists building side-projects. In the end, that's where we come from, and that's where our heart is.

At the same time, we're also committed to making Replexica a powerful tool for startups and enterprises building commercial software, to enable them to reach more users faster.

### Self-Hosting

Additionally, since the API is open, anyone can build their own translation engine, memory, and fine-tune it themselves instead of using these features of Replexica Cloud. We're planning to release the self-hosting guide soon.

## Roadmap

Replexica is a new project (support our work with a GitHub star btw! 😉), and here are the main features we're working on next:

* **Next.js App Router** - Replexica Compiler currently supports only Next.js App Router. Support for other setups is coming soon (ETA April 2024).
* **New Languages** - Replexica Cloud currently supports only English and Spanish. More languages are coming soon (ETA April 2024).

The more detailed roadmap is below:

* [x] Replexica Compiler
  * [x] Next.js App Router
  * [ ] Next.js Pages Router (April 2024)
  * [ ] Remix (May 2024)
  * [ ] Create React App (May 2024)
* [x] Replexica Framework
  * [x] Core JSX translation
  * [x] Custom context hints
  * [x] Translation of JSX attributes (title, alt, placeholder)
  * [ ] Translation of generic literals with helper functions
  * [ ] Translation of arbitrary attributes
* [x] Replexica Cloud
  * [x] AI Translation Engine
  * [x] Context awareness aka **Brand voice**
  * [ ] Supported locales (production-ready, state-of-the-art quality)
    * [x] English
    * [x] Spanish
    * [ ] French (April 2024)
    * [ ] German (April 2024)
    * [ ] 10+ more languages to be announced (June 2024)
    * [ ] (Create a GitHub issue to request a new language!)
  * [ ] Self-hosting guides / docs
* [x] Replexica CLI
  * [x] CLI for Replexica Platform
  * [x] Open-source API schema
  * [ ] GitHub Actions integration

## The Replexica Rule

At Replexica, we believe in the elegance of [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration) principle.

Therefore, there's one important rule to remember when using Replexica:

> [!TIP]
> Place translatable text inside `JSX`.

As long as you follow this rule, the Replexica Compiler can automatically infer the metadata from your app and prepare the text inside JSX for translation.

If you don't follow the rule and decide to store some of your translatable content in variables, that **can be translated too**, but you'll need to manually wrap that text in a helper function (... that we're planning to release soon, ETA April 2024).

So, if you want a hassle-free i18n on autopilot, **follow The Replexica Rule** whenever possible.

<details>
  <summary>
  Edge case: But what if I have an array of items, and some of the fields should be translated?
  </summary>
  
  There's a common scenario, when you have an array of items that you render in a list, like this:

```jsx
const menuItems = [
  {
    title: 'Home',
    url: '/',
  },
  {
    title: 'About',
    url: '/about',
  },
  {
    title: 'Contact',
    url: '/contact',
  },
];
```

In this case, you can still follow The Replexica Rule by simply wrapping the text in JSX! Here's how you can do it:

```jsx
const menuItesm = [
  {
    title: <>Home</>,
    url: '/',
  },
  {
    title: <>About</>,
    url: '/about',
  },
  {
    title: <>Contact</>,
    url: '/contact',
  },
];
```

And that's it! The Replexica Compiler will automatically infer the metadata from the JSX and prepare the text for translation.
</details>

## Getting Started

### Step 1. Install Replexica

```bash
pnpm add replexica @replexica/compiler @replexica/react
```

### Step 2. Configure NextJS

```js
// next.config.mjs

import replexica from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {};

/** @type {import('@replexica/compiler').ReplexicaConfig} */
const replexicaConfig = {
  locale: {
    source: 'en', // Language the app's content is in
    targets: ['es'], // Target language(s)
  },
};

export default replexica.next(
  replexicaConfig,
  nextConfig,
);

```

### Step 3. Configure React app

> [!NOTE]
> This guide is for Next.js App Router apps only. Guides for other setups are coming soon (ETA April 2024). <https://github.com/replexica/replexica/issues/25>

If you plan on having `'use client'` components _at least somewhere_ in your app (you probably do), you'll need to also wrap your entire component tree in `<ReplexicaProvider />`:

```jsx
// src/app/layout.tsx

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

### Step 4. Run the compiler

```bash
# If you haven't already, authenticate with the Replexica platform
pnpm replexica auth --login

# Build the app, without translations
pnpm run build

# Fetch translations from the Replexica platform
pnpm replexica i18n

# Build the app again, to inject translations into the build output
pnpm run build

# Start the app
pnpm run start
```

> [!TIP]
> `pnpm replexica i18n` must be run after every build, to fetch the latest translations from the Replexica platform. It must be run in CI/CD pipelines as well, right after the `build` step.

> [!NOTE]
> We know that running `pnpm replexica i18n` after every build and running the build twice can be a bit cumbersome. We're working on a solution to make this process more streamlined (ETA April 2024). We're working really hard on this one! 🙏 <https://github.com/replexica/replexica/issues/26>

### Step 5 (Optional). Test the result

If you haven't yet implemented the language switcher on the UI, run the following code in the browser console to switch the language to Spanish:

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

## How to Switch Between Languages

Different apps use different strategies for switching between supported languages. Here are a few approaches we've seen:

* Cookie value (get/set cookie value)
* Subdomain (`en.myapp.com` / `es.myapp.com`)
* TLD domain (`myapp.com` / `myapp.es`)
* Pathname segments (`myapp.com/en` / `myapp.com/es`)

... and so on.

To support every possible strategy, now and in the future, Replexica does the following:

*Replexica reads the value of the `REPLEXICA_LOCALE` cookie to determine the currently selected locale*

So, whatever approach you choose for switching between locales, just be sure to update the value of the `REPLEXICA_LOCALE` cookie, and Replexica will handle the rest.

> [!WARNING]
> Be sure to drop by our Discord (link at the bottom) if you have an opinion on how Replexica should be handling the locale detection. Even if your idea is exotic or feels unfeasible, we'd love to hear it! 🙏 (feel free to send in private, if you want).

## Team

Before Replexica, we were bootstrapping a B2B SaaS startup. It got acquired, and we decided to build a devtool that'd just be cool and would be fun to work on.

We used to work with i18n a lot, using tens of different libraries, and none of them was a perfect match: something has always been a bit off.

So, we decided to build Replexica, to solve the i18n problem once and for all, for everyone, in a way that's simple, elegant, and powerful.

We're a lean team of two:

* **[Veronica](https://github.com/vrcprl)** - Product, and AI.
* **[Max](https://github.com/maxprilutskiy)** - React, Typescript and Compilers.

## Contributing

If you're building a side-project, or a startup, or you're working at a big company that uses Replexica - we'd LOVE to hear from you!

You can contribute in the form of:

* **Feedback** - tell us what you like, what you don't like, what you'd like to see next.
* **Feature requests** - tell us what you need, and we'll do our best to build it.
* **Bug reports** - if you find a bug, please let us know, and we'll fix it as soon as we physically can.

Also the special one:

* **Complaints** - if you're unhappy with _ANYTHING_ about your current i18n approach, and you just need to vent, we're (our co-founder Max specifically) here to listen!

Lastly, we've recently created a [Discord channel](https://discord.gg/GeK6AuSqzw): come say hi! 👋

## Questions

If you found a bug, or have a feature request, please [create an issue](https://github.com/replexica/replexica/issues) and post the link in the Discord channel.
