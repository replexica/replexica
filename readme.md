<p align="center">
<img src="./content/banner.light.png#gh-light-mode-only">
<img src="./content/banner.dark.png#gh-dark-mode-only">
</p>

# Replexica

Replexica is an open-source i18n compiler plugin for React + an AI translation platform.

Multi-language products get more users: 75% of the world doesn't speak English. But building such apps is a pain. *Extract* strings to JSON files, then *update* translations every time there is a change - it's a nightmare.

That's where Replexica comes in: it's a build system plugin, that translates React apps to multiple languages with AI, and doesn't require JSON files extraction / maintenance.

Replexica compiler is open-source, and the API is open so you can build your own translation engine. We're also building our own AI translation platform, to make it even easier to roll out your first multi-language app ;)

- [x] Replexica Compiler
  - [x] Next.js
  - [ ] Remix
  - [ ] Create React App
- [x] Replexica Framework
  - [x] JSX translation
  - [x] Custom context hints
  - [ ] Translation of string literals using a helper
- [x] Replexica Platform
  - [x] AI Translation Engine
  - [x] Translation memory
  - [x] Context awareness aka **Brand voice**
  - [ ] i18n overrides
  - [ ] i18n quality checks
- [x] Replexica CLI
  - [x] CLI for Replexica Platform
  - [x] Open-source API schema
  - [ ] GitHub Actions integration

## How it works

Replexica is a compiler plugin. It hooks into your build system, and collects all the user-facing text in your app, getting it ready for translation with the Replexica platform. Here's how it works:

1. **Infers** metadata from your app, like the text that needs to be translated and the context it's in. The metadata is then stored alongside your build artifacts.
1. **Translates** the text using the CLI that connects to the Replexica platform. The platform uses AI to translate the text, and the more you use it, the better it gets. The API is open, so you can build your own translation engine if you want!
1. **Injects** the translations back into your app, so that the translated text is displayed to the user, based on their locale.

So, with Replexica, you can build multi-language apps without the hassle of JSON files, and with the power of AI translation.

## Getting started

## License
