<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ State-of-the-art AI localization for web & mobile, right from CI/CD.</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">Website</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">Contribute</a> •
  <a href="#-github-action">GitHub Action</a> •
  <a href="#-localization-compiler-experimental>Localization Compiler</a>
</p>

<p align="center">
  <a href="https://github.com/replexica/replexica/actions/workflows/release.yml">
    <img src="https://github.com/replexica/replexica/actions/workflows/release.yml/badge.svg" alt="Release" />
  </a>
  <a href="https://github.com/replexica/replexica/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/replexica/replexica" alt="License" />
  </a>
  <a href="https://github.com/replexica/replexica/commits/main">
    <img src="https://img.shields.io/github/last-commit/replexica/replexica" alt="Last Commit" />
  </a>
</p>

<br />

Replexica AI automates software localization end-to-end.

It produces authentic translations instantly, eliminating manual work and management overhead. Replexica Localization Engine understands product context, creating perfected translations that native speakers expect across 60+ languages. As a result, teams do localization 100x faster, with state-of-the-art quality, shipping features to more paying customers worldwide.

## 💫 Quickstart

1. **Request access**: [talk to us](https://replexica.com/go/call) to become a customer.

2. Once approved, initialize your project:
   ```bash
   npx replexica@latest init
   ```

3. Localize your content:
   ```bash
   npx replexica@latest i18n
   ```

## 🤖 GitHub Action

Replexica offers a GitHub Action to automate localization in your CI/CD pipeline. Here's a basic setup:

```yaml
- uses: replexica/replexica@main
  with:
    api-key: ${{ secrets.REPLEXICA_API_KEY }}
```

This action runs `replexica i18n` on every push, keeping your translations up-to-date automatically.

For pull request mode and other configuration options, visit our [GitHub Action documentation](https://docs.replexica.com/setup/gha).

## 🧪 Localization compiler (experimental)

This repository also contains our new experiment: a JS/React localization compiler.

It lets dev teams do frontend localization **without extracting strings to translation files**. Teams can get multilingual frontend with just one line of code. It works at build time, uses abstract syntax tree (AST) manipulation and code generation.

You can see the demo [here](https://x.com/MaxPrilutskiy/status/1781011350136734055).

## 🥇 Why teams choose Replexica

- 🔥 **Instant integration**: Set up in minutes
- 🔄 **CI/CD Automation**: Seamless dev pipeline integration
- 🌍 **60+ Languages**: Expand globally effortlessly
- 🧠 **AI Localization Engine**: Translations that truly fit your product
- 📊 **Format Flexible**: Supports JSON, YAML, CSV, Markdown, and more

## 🛠️ Supercharged features

- ⚡️ **Lightning-Fast**: AI localization in seconds
- 🔄 **Auto-Updates**: Syncs with the latest content
- 🌟 **Native Quality**: Translations that sound authentic
- 👨‍💻 **Developer-Friendly**: CLI that integrates with your workflow
- 📈 **Scalable**: For growing startups and enterprise teams

## 📚 Documentation

For detailed guides and API references, visit the [documentation](https://replexica.com/go/docs).

## 🤝 Contribute

Interested in contributing, even if you aren't a customer?

Check out the [Good First Issues](https://github.com/replexica/replexica/labels/good%20first%20issue) and read the [Contributing Guide](./CONTRIBUTING.md).

## 🧠 Team

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

Questions or inquiries? Email veronica@replexica.com

## 🌐 Readme in other languages

- [English](https://github.com/replexica/replexica)
- [Spanish](/readme/es.md)
- [French](/readme/fr.md)
- [Russian](/readme/ru.md)
- [German](/readme/de.md)
- [Chinese](/readme/zh-Hans.md)
- [Korean](/readme/ko.md)
- [Japanese](/readme/ja.md)
- [Italian](/readme/it.md)
- [Arabic](/readme/ar.md)

Don't see your language? Just add a new language code to the [`i18n.json`](./i18n.json) file and open a PR.
