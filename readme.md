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

[Docs](https://github.com/replexica/replexica/wiki) •
[Discord](https://discord.gg/GeK6AuSqzw) •
[Website](https://replexica.com) •
[Twitter](https://twitter.com/replexica)

Replexica is an i18n toolkit for React, to ship multi-language apps fast.

It comes in two parts:

1. [Experimental] **Replexica Compiler** - an open-source compiler plugin for React (experimental, Next.js App Router only);
1. **Replexica API** - an i18n API in the cloud that performs translations using context-aware LLMs (Usage based, has a free tier.).

Replexica supports several i18n formats:

1. JSON-free, experimental Replexica Compiler format;
1. `.md` files for Markdown content;
1. Classic JSON and YAML-based formats.

## Getting Started

Check out our [Docs](https://github.com/replexica/replexica/wiki) for more detailed guides on how to use Replexica with your app.

## What's under the hood

Replexica is a full-stack LLM-powered i18n tool for React, and it consists of **two main parts**:

1. **Replexica i18n Compiler** (this repo) - an open-source compiler plugin for React:
    * Doesn't require extracting strings into JSON files;
    * Seamlessly integrates with React build system;
    * Infers metadata and user-facing text from the app;
    * Prepares the content for further context-aware translation.

    The compiler hooks into the build process, infers metadata from the app, such as the text that needs to be translated and the context it's in. The Abstract Syntax Tree (AST) is traversed to gather the metadata, the context, and the text that needs to be translated. This metadata is then stored alongside the build artifacts.

1. **Replexica i18n API** ([replexica.com](https://replexica.com)) - an i18n API in the cloud that translates apps into multiple languages, using LLMs, fast:
    * ~~$0/mo + usage, with free tier;~~ Entirely free, during the launch period;
    * Full context awareness + brand voice;
    * State-of-the-art quality translations (adding more new languages soon!) via a mix of open-source and proprietary AI models;
    * API is open, so anyone could build their own translation engine (self-hosting guide coming soon).

    The i18n engine uses AI to translate the text, and the more it's used, the better it gets. The very first version used plain gpt-3.5, though currently it's more like a mix of Llama + Google Vertex AI + GPT + Mixtral, and we're switching between models regularly as we improve the API.

The core idea behind Replexica is simple: apps must be multi-language by default, from day one. **The Internet is global, and so must be any software that runs on it.**

## Why

Having built tens of side-projects / micro-startups over the years, we found one thing to be particularly annoying: adding i18n to the app. We wanted to **ship, and ship fast**, not to mess with JSON files or extraction scripts.

So it got us thinking: why not build a tool that makes multi-language apps simpler? I mean, anyone who's tried to add i18n to their project knows it's a headache.

That's why we teamed up build a React compiler coupled with an AI-powered API, to make i18n as simple as possible, at the most fundamental level.

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
    * [x] French
    * [x] Catalan
    * [ ] Italian (Coming in May 2024)
    * [ ] 10+ more languages to be announced (June 2024)
    * [ ] (Create a GitHub issue to request a new language!)
  * [ ] Self-hosting guides / docs
* [x] Replexica CLI
  * [x] CLI for Replexica Platform
  * [x] Open-source API schema
  * [ ] GitHub Actions integration

## Core Team

We're a lean team of two:

* **[Veronica](https://github.com/vrcprl)** - Product, Data Science, and LLMs.
* **[Max](https://github.com/maxprilutskiy)** - React, Typescript, and Compilers.

We've also got a few (11 at the moment) contributors who signed up to help us with the project, and we're always looking for more. If you're interested in contributing, please drop by our Discord channel and say hi!

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
