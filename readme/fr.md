<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ Localisation IA de pointe pour le web et le mobile, directement depuis CI/CD.</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">Site web</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">Contribuer</a> •
  <a href="#-github-action">GitHub Action</a>
</p>

<p align="center">
  <a href="https://github.com/replexica/replexica/actions/workflows/release.yml">
    <img src="https://github.com/replexica/replexica/actions/workflows/release.yml/badge.svg" alt="Release" />
  </a>
  <a href="https://github.com/replexica/replexica/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/replexica/replexica" alt="Licence" />
  </a>
  <a href="https://github.com/replexica/replexica/commits/main">
    <img src="https://img.shields.io/github/last-commit/replexica/replexica" alt="Dernier commit" />
  </a>
</p>

<br />

Replexica IA automatise la localisation de logiciels de bout en bout.

Elle produit instantanément des traductions authentiques, éliminant le travail manuel et les frais de gestion. Le moteur de localisation Replexica comprend le contexte du produit, créant des traductions perfectionnées que les locuteurs natifs attendent dans plus de 60 langues. En conséquence, les équipes effectuent la localisation 100 fois plus rapidement, avec une qualité de pointe, livrant des fonctionnalités à davantage de clients payants dans le monde entier.

## 💫 Démarrage rapide

1. **Demandez l'accès** : [contactez-nous](https://replexica.com/go/call) pour devenir client.

2. Une fois approuvé, initialisez votre projet :
   ```bash
   npx replexica@latest init
   ```

3. Localisez votre contenu :
   ```bash
   npx replexica@latest i18n
   ```

## 🤖 GitHub Action

Replexica propose une GitHub Action pour automatiser la localisation dans votre pipeline CI/CD. Voici une configuration de base :

```yaml
- uses: replexica/replexica@main
  with:
    api-key: ${{ secrets.REPLEXICA_API_KEY }}
```

Cette action exécute `replexica i18n` à chaque push, maintenant automatiquement vos traductions à jour.

Pour le mode pull request et d'autres options de configuration, consultez notre [documentation GitHub Action](https://docs.replexica.com/setup/gha).

## 🥇 Pourquoi les équipes choisissent Replexica

- 🔥 **Intégration instantanée** : Configuration en quelques minutes
- 🔄 **Automatisation CI/CD** : Intégration transparente dans le pipeline de développement
- 🌍 **Plus de 60 langues** : Expansion mondiale sans effort
- 🧠 **Moteur de localisation IA** : Des traductions parfaitement adaptées à votre produit
- 📊 **Flexibilité des formats** : Prise en charge de JSON, YAML, CSV, Markdown et plus encore

## 🛠️ Fonctionnalités surpuissantes

- ⚡️ **Ultra-rapide** : Localisation par IA en quelques secondes
- 🔄 **Mises à jour automatiques** : Synchronisation avec le contenu le plus récent
- 🌟 **Qualité native** : Des traductions qui sonnent authentiques
- 👨‍💻 **Convivial pour les développeurs** : CLI qui s'intègre à votre flux de travail
- 📈 **Évolutif** : Pour les startups en croissance et les équipes d'entreprise

## 📚 Documentation

Pour des guides détaillés et des références API, consultez la [documentation](https://replexica.com/go/docs).

## 🤝 Contribuer

Intéressé à contribuer, même si vous n'êtes pas client ?

Consultez les [Good First Issues](https://github.com/replexica/replexica/labels/good%20first%20issue) et lisez le [Guide de contribution](./CONTRIBUTING.md).

## 🧠 Équipe

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

Des questions ou des demandes ? Envoyez un e-mail à veronica@replexica.com

## 🌐 Readme dans d'autres langues

- [Anglais](https://github.com/replexica/replexica)
- [Espagnol](/readme/es.md)
- [Français](/readme/fr.md)
- [Russe](/readme/ru.md)
- [Allemand](/readme/de.md)
- [Chinois](/readme/zh-Hans.md)

Vous ne voyez pas votre langue ? Ajoutez simplement un nouveau code de langue au fichier [`i18n.json`](./i18n.json) et ouvrez une PR.
