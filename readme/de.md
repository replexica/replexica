<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ Hochmoderne KI-Lokalisierung für Web & Mobile, direkt aus CI/CD.</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">Website</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">Mitwirken</a> •
  <a href="#-github-action">GitHub Action</a>
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

Replexica AI automatisiert die Software-Lokalisierung von Anfang bis Ende.

Es erstellt sofort authentische Übersetzungen und eliminiert manuelle Arbeit und Verwaltungsaufwand. Die Replexica Lokalisierungs-Engine versteht den Produktkontext und erstellt perfekte Übersetzungen, die Muttersprachler in über 60 Sprachen erwarten. Dadurch führen Teams Lokalisierungen 100-mal schneller durch, mit modernster Qualität, und liefern Funktionen an mehr zahlende Kunden weltweit.

## 💫 Schnellstart

1. **Zugang anfordern**: [Sprechen Sie mit uns](https://replexica.com/go/call), um Kunde zu werden.

2. Nach der Freigabe initialisieren Sie Ihr Projekt:
   ```bash
   npx replexica@latest init
   ```

3. Lokalisieren Sie Ihre Inhalte:
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

- 🔥 **Sofortige Integration**: In Minuten eingerichtet
- 🔄 **CI/CD-Automatisierung**: Nahtlose Integration in den Entwicklungsprozess
- 🌍 **Über 60 Sprachen**: Mühelose globale Expansion
- 🧠 **KI-Lokalisierungs-Engine**: Übersetzungen, die wirklich zu Ihrem Produkt passen
- 📊 **Formatflexibel**: Unterstützt JSON, YAML, CSV, Markdown und mehr

## 🛠️ Leistungsstarke Funktionen

- ⚡️ **Blitzschnell**: KI-Lokalisierung in Sekundenschnelle
- 🔄 **Automatische Updates**: Synchronisiert mit den neuesten Inhalten
- 🌟 **Muttersprachliche Qualität**: Übersetzungen, die authentisch klingen
- 👨‍💻 **Entwicklerfreundlich**: CLI, die sich in Ihren Workflow integriert
- 📈 **Skalierbar**: Für wachsende Startups und Unternehmensteams

## 📚 Dokumentation

Detaillierte Anleitungen und API-Referenzen finden Sie in der [Dokumentation](https://replexica.com/go/docs).

## 🤝 Mitwirken

Interessiert daran, einen Beitrag zu leisten, auch wenn Sie kein Kunde sind?

Schauen Sie sich die [Good First Issues](https://github.com/replexica/replexica/labels/good%20first%20issue) an und lesen Sie den [Leitfaden für Mitwirkende](./CONTRIBUTING.md).

## 🧠 Team

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

Fragen oder Anfragen? E-Mail an veronica@replexica.com

## 🌐 Readme in anderen Sprachen

- [Englisch](https://github.com/replexica/replexica)
- [Spanisch](/readme/es.md)
- [Französisch](/readme/fr.md)
- [Russisch](/readme/ru.md)
- [Deutsch](/readme/de.md)
- [Chinesisch](/readme/zh-Hans.md)
- [Koreanisch](/readme/ko.md)
- [Japanisch](/readme/ja.md)
- [Italienisch](/readme/it.md)

Siehst du deine Sprache nicht? Füge einfach einen neuen Sprachcode zur Datei [`i18n.json`](./i18n.json) hinzu und eröffne einen PR.
