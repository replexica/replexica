<p align="center">
  <a href="https://lingo.dev">
    <img src="/content/banner.dark.png" width="100%" alt="Lingo.dev" />
  </a>
</p>

<p align="center">
  <strong>⚡️ State-of-the-art AI localization for web & mobile, right from CI/CD.</strong>
</p>

<br />

<p align="center">
  <a href="https://lingo.dev">Website</a> •
  <a href="https://github.com/lingodotdev/lingo.dev/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">Contribute</a> •
  <a href="#-github-action">GitHub Action</a>
</p>

<p align="center">
  <a href="https://github.com/lingodotdev/lingo.dev/actions/workflows/release.yml">
    <img src="https://github.com/lingodotdev/lingo.dev/actions/workflows/release.yml/badge.svg" alt="Release" />
  </a>
  <a href="https://github.com/lingodotdev/lingo.dev/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/lingodotdev/lingo.dev" alt="License" />
  </a>
  <a href="https://github.com/lingodotdev/lingo.dev/commits/main">
    <img src="https://img.shields.io/github/last-commit/lingodotdev/lingo.dev" alt="Last Commit" />
  </a>
</p>

<br />

Lingo.dev automates software localization end-to-end using latest LLM models.

It produces authentic translations instantly, eliminating manual work and management overhead. Lingo.dev Localization Engine understands product context, creating perfected translations that native speakers expect across 60+ languages. As a result, teams do localization 100x faster, with state-of-the-art quality, shipping features to more paying customers worldwide.

## 💫 Quickstart

1. Create an account on [the website](https://lingo.dev)

2. Initialize your project:

   ```bash
   npx lingo.dev@latest init
   ```

3. Check out our docs: [docs.lingo.dev](https://docs.lingo.dev)

4. Localize your app (takes seconds):
   ```bash
   npx lingo.dev@latest i18n
   ```

## 🤖 GitHub Action

Lingo.dev offers a GitHub Action to automate localization in your CI/CD pipeline. Here's a basic setup:

```yaml
- uses: lingodotdev/lingo.dev@main
  with:
    api-key: ${{ secrets.LINGODOTDEV_API_KEY }}
```

This action runs `lingo.dev i18n` on every push, keeping your translations up-to-date automatically.

For pull request mode and other configuration options, visit our [GitHub Action documentation](https://docs.lingo.dev/setup/gha).

## 🥇 Why teams choose Lingo.dev

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

For detailed guides and API references, visit the [documentation](https://lingo.dev/go/docs).

## 🤝 Contribute

Interested in contributing, even if you aren't a customer?

Check out the [Good First Issues](https://github.com/lingodotdev/lingo.dev/labels/good%20first%20issue) and read the [Contributing Guide](./CONTRIBUTING.md).

## 🧠 Team

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

Questions or inquiries? Email veronica@lingo.dev

## 🌐 Readme in other languages

- [English](https://github.com/lingodotdev/lingo.dev)
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
