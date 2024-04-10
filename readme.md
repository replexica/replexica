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

Replexica is an i18n compiler for React. It doesn't require extracting text into JSON files, and allows shipping multi-language apps fast, using an AI-powered API.

It comes in two parts:

1. **Replexica Compiler** - an open-source compiler plugin for React;
1. **Replexica API** - an i18n API in the cloud that performs translations, using LLMs. (Usage based, has a free tier.)

Replexica supports several i18n formats:

1. JSON-free Replexica compiler format;
1. `.md` files for Markdown content;
1. Legacy JSON and YAML-based formats.

_Looking to jump right in? Check out the [Getting Started](/getting-started.md) guide for Next.js App Router!_

## Why

Having built tens of side-projects, over the years, we found one thing to be particularly annoying: adding i18n to the app. We wanted to **ship, and ship fast**, not to mess with JSON files or extraction scripts.

So it got us thinking: why not build a tool that makes multi-language apps simpler? I mean, anyone who's tried to add i18n to their project knows it's a headache.

And after we found out [~80%](https://www.statista.com/chart/26884/languages-on-the-internet/#:~:text=The%201.46%20billion%20people%20who%20speak%20English%20still%20make%20up%20less%20than%2020%20percent%20of%20the%20world%20population) aren't fluent in English - that seemed like a missed opportunity, since i18n could be a shortcut to reaching more users.

That's why we teamed up to build Replexica: a compiler plus an AI-powered API, designed to make the app multilingual really fast.

### Does Replexica work with ... ?

Please drop by our new [Discord channel](https://discord.gg/GeK6AuSqzw) and ask! Our co-founder Max is online almost 24/7.

## API

> [!NOTE]
> This guide is for Next.js App Router apps only. Support for other setups is coming soon (ETA April 2024). <https://github.com/replexica/replexica/issues/25>

To give a general idea behind Replexica, here's **the only change that's needed** to the basic Next.js app to make it multi-language:

```js
// next.config.mjs

// Import Replexica Compiler
import replexica from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {};

// Define Replexica configuration
/** @type {import('@replexica/compiler').ReplexicaConfig} */
const replexicaConfig = {
  locale: {
    source: 'en',
    targets: ['es'],
  },
};

// Wrap Next.js config with Replexica Compiler
export default replexica.next(
  replexicaConfig,
  nextConfig,
);

```

## What is Replexica

Replexica is a full-stack LLM-powered i18n tool for React, and it consists of **two main parts**:

1. **Replexica i18n Compiler** (this repo) - an open-source compiler plugin for React:
    * Doesn't require extracting strings into JSON files;
    * Seamlessly integrates with React build system;
    * Infers metadata and user-facing text from the app;
    * Prepares the content for further context-aware translation.

1. **Replexica i18n API** ([replexica.com](https://replexica.com)) - an i18n API in the cloud that translates apps into multiple languages, using LLMs, fast:
    * ~~$0/mo + usage, with free tier;~~ Entirely free, during the launch period;
    * Full context awareness + brand voice;
    * State-of-the-art quality translations (adding more new languages soon!) via a mix of open-source and proprietary AI models;
    * API is open, so anyone could build their own translation engine (self-hosting guide coming soon).

The core idea behind Replexica is simple: apps must be multi-language by default, from day one. **The Internet is global, and so must be any software that runs on it.**

## How it Works

Replexica Compiler integrates with the build system, collecting all user-facing text in the app and preparing it for translation with the Replexica Cloud.

Here's how it works:

1. **Infers** metadata from the app, such as the text that needs to be translated and its context. This metadata is then stored alongside the build artifacts. The Abstract Syntax Tree (AST) is traversed to gather the metadata, the context, and the text that needs to be translated.
1. **Translates** the text using the CLI that connects to the Replexica API. The i18n engine uses AI to translate the text, and the more it's used, the better it gets. The very first version used plain gpt-3.5, right now we're using a mix  of Llama + Google Vertex AI + GPT + Mixtral, and we're switching between models regularly as we improve the API. Also, the API is open, so that everyone can build their own translation engine if desired.
1. **Injects** the translations back into the app, so that the translated text is displayed to the user, based on their locale, when React renders the app.

So, with Replexica, everyone can now build multi-language apps, while still shipping fast.

## The Replexica Rule

At Replexica, we believe in the elegance of [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration) principle.

Therefore, there's one important rule to remember when using Replexica:

**Always put translatable text inside `JSX`.**

**As long as you follow this rule**, the Replexica Compiler **will** automatically infer the metadata from your app and prepare the text inside JSX for translation.

**If you don't follow the rule** and decide to store some of your translatable content in variables, that **can** be translated too, but you'll need to manually wrap that text in a helper function.

So, if you want a hassle-free i18n on autopilot, **follow The Replexica Rule** whenever possible.

### Dynamic content

There's a common scenario, when you have an array of items that you render in a list:

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

In this case, you can still follow The Replexica Rule by simply wrapping the text in JSX! Here's how:

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

The Replexica Compiler will automatically infer the metadata from the JSX and prepare the text for translation.

## Roadmap

Here are the main features we're working on next:

* **Next.js** - Replexica Compiler currently supports only Next.js App Router. Support for other setups is coming soon (ETA April 2024).
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

## Getting Started

We've prepared a [Getting Started](/getting-started.md) guide that walks you through the process of setting up Replexica Compiler with Next.js App Router. Check it out!

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

## Core Team

We're a lean team of two:

* **[Veronica](https://github.com/vrcprl)** - Product, Data Science, and LLMs.
* **[Max](https://github.com/maxprilutskiy)** - React, Typescript, and Compilers.

We've also got a few (11 to be precise) contributors who signed up to help us with the project, and we're always looking for more. If you're interested in contributing, please drop by our Discord channel and say hi!

## Contributing

If you're building a side-project, or a startup, or you're working at a big company that uses Replexica - we'd love to hear from you!

* **Feedback** - tell us what you like, what you don't like, what you'd like to see next.
* **Feature requests** - tell us what you need, and we'll do our best to build it.
* **Bug reports** - if you find a bug, please let us know, and we'll fix it as soon as we physically can.

Also the special one:

* **Complaints** - if you're unhappy with _literally anything_ about your current i18n approach - drop by our Discord!

    Last time someone complained we built a feature for them and made it production-ready within 48 hours.

Lastly, we've recently created a [Discord channel](https://discord.gg/GeK6AuSqzw): come say hi! 👋

## Questions

If you found a bug, or have a feature request, please [create an issue](https://github.com/replexica/replexica/issues) or [drop by our Discord channel](https://discord.gg/GeK6AuSqzw) and ask!
