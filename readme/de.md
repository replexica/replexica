<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ Hochmoderne KI-Lokalisierung für Web & Mobile, direkt aus der CI/CD-Pipeline.</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">Website</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">Mitmachen</a> •
  <a href="#-github-action">GitHub Action</a> •
  <a href="#-localization-compiler-experimental">Lokalisierungs-Compiler</a>
</p>

<p align="center">
  <a href="https://github.com/replexica/replexica/actions/workflows/release.yml">
    <img src="https://github.com/replexica/replexica/actions/workflows/release.yml/badge.svg" alt="Release" />
  </a>
  <a href="https://github.com/replexica/replexica/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/replexica/replexica" alt="Lizenz" />
  </a>
  <a href="https://github.com/replexica/replexica/commits/main">
    <img src="https://img.shields.io/github/last-commit/replexica/replexica" alt="Letzter Commit" />
  </a>
</p>

<br />

Replexica KI automatisiert die Software-Lokalisierung von Anfang bis Ende.

Es erstellt sofort authentische Übersetzungen und eliminiert manuelle Arbeit und Verwaltungsaufwand. Die Replexica Lokalisierungs-Engine versteht den Produktkontext und erstellt perfekte Übersetzungen, die Muttersprachler in über 60 Sprachen erwarten. Teams können dadurch Lokalisierung 100-mal schneller durchführen, mit modernster Qualität, und Features an mehr zahlende Kunden weltweit ausliefern.

## 💫 Schnellstart

1. Erstellen Sie ein Konto auf [der Website](https://replexica.com)

2. Initialisieren Sie Ihr Projekt:
   ```bash
   npx replexica@latest init
   ```

3. Lesen Sie unsere Dokumentation: [docs.replexica.com](https://docs.replexica.com)

4. Lokalisieren Sie Ihre App (dauert nur Sekunden):
   ```bash
   npx replexica@latest i18n
   ```

## 🤖 GitHub Action

Replexica bietet eine GitHub Action zur Automatisierung der Lokalisierung in Ihrer CI/CD-Pipeline. Hier ist eine grundlegende Einrichtung:

```yaml
- uses: replexica/replexica@main
  with:
    api-key: ${{ secrets.REPLEXICA_API_KEY }}
```

Diese Action führt bei jedem Push `replexica i18n` aus und hält Ihre Übersetzungen automatisch auf dem neuesten Stand.

Für den Pull-Request-Modus und weitere Konfigurationsoptionen besuchen Sie unsere [GitHub Action Dokumentation](https://docs.replexica.com/setup/gha).

## 🥇 Warum Teams Replexica wählen

- 🔥 **Sofortige Integration**: Setup in Minuten
- 🔄 **CI/CD Automation**: Nahtlose Integration in Dev-Pipelines
- 🌍 **60+ Sprachen**: Mühelose globale Expansion
- 🧠 **KI-Lokalisierungs-Engine**: Übersetzungen, die wirklich zu Ihrem Produkt passen
- 📊 **Format-Flexibel**: Unterstützt JSON, YAML, CSV, Markdown und mehr

## 🛠️ Leistungsstarke Features

- ⚡️ **Blitzschnell**: KI-Lokalisierung in Sekunden
- 🔄 **Auto-Updates**: Synchronisiert mit den neuesten Inhalten
- 🌟 **Native Qualität**: Authentisch klingende Übersetzungen
- 👨‍💻 **Developer-Friendly**: CLI, das sich in Ihren Workflow integriert
- 📈 **Skalierbar**: Für wachsende Startups und Enterprise-Teams

## 📚 Dokumentation

Detaillierte Anleitungen und API-Referenzen finden Sie in der [Dokumentation](https://replexica.com/go/docs).

## 🤝 Mitmachen

Interesse am Mitwirken, auch wenn Sie kein Kunde sind?

Sehen Sie sich die [Good First Issues](https://github.com/replexica/replexica/labels/good%20first%20issue) an und lesen Sie den [Contributing Guide](./CONTRIBUTING.md).

## 🧠 Team

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

Fragen oder Anfragen? E-Mail an veronica@replexica.com

## 🌐 Readme in anderen Sprachen

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

Ihre Sprache nicht dabei? Fügen Sie einfach einen neuen Sprachcode zur [`i18n.json`](./i18n.json) Datei hinzu und öffnen Sie einen PR.
