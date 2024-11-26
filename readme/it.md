<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ Localizzazione AI all'avanguardia per web e mobile, direttamente dal CI/CD.</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">Website</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">Contribuisci</a> •
  <a href="#-github-action">GitHub Action</a> •
  <a href="#-localization-compiler-experimental">Compilatore di localizzazione</a>
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

Replexica AI automatizza la localizzazione del software end-to-end.

Produce traduzioni autentiche istantaneamente, eliminando il lavoro manuale e l'overhead di gestione. Il motore di localizzazione Replexica comprende il contesto del prodotto, creando traduzioni perfezionate che i madrelingua si aspettano in oltre 60 lingue. Di conseguenza, i team eseguono la localizzazione 100 volte più velocemente, con qualità all'avanguardia, distribuendo funzionalità a più clienti paganti in tutto il mondo.

## 💫 Avvio rapido

1. **Richiedi l'accesso**: [parlaci](https://replexica.com/go/call) per diventare un cliente.

2. Una volta approvato, inizializza il tuo progetto:
   ```bash
   npx replexica@latest init
   ```

3. Localizza il tuo contenuto:
   ```bash
   npx replexica@latest i18n
   ```

## 🤖 GitHub Action

Replexica offre una GitHub Action per automatizzare la localizzazione nel tuo pipeline CI/CD. Ecco una configurazione di base:

```yaml
- uses: replexica/replexica@main
  with:
    api-key: ${{ secrets.REPLEXICA_API_KEY }}
```

Questa action esegue `replexica i18n` ad ogni push, mantenendo le tue traduzioni aggiornate automaticamente.

Per la modalità pull request e altre opzioni di configurazione, visita la nostra [documentazione GitHub Action](https://docs.replexica.com/setup/gha).

## 🧪 Compiler di localizzazione (sperimentale)

Questa repository contiene anche il nostro nuovo esperimento: un compilatore di localizzazione JS/React.

Permette ai team di sviluppo di fare localizzazione frontend **senza estrarre le stringhe nei file di traduzione**. I team possono ottenere un frontend multilingue con una sola riga di codice. Funziona durante la compilazione, utilizza la manipolazione dell'abstract syntax tree (AST) e la generazione del codice.

Puoi vedere la demo [qui](https://x.com/MaxPrilutskiy/status/1781011350136734055).

Se vuoi sperimentare con il compilatore per conto tuo, assicurati prima di eseguire `git checkout 6c6d59e8aa27836fd608f9258ea4dea82961120f`.

## 🥇 Perché i team scelgono Replexica

- 🔥 **Integrazione istantanea**: Setup in pochi minuti
- 🔄 **Automazione CI/CD**: Integrazione perfetta nella pipeline di sviluppo
- 🌍 **Oltre 60 lingue**: Espansione globale senza sforzo
- 🧠 **Motore di localizzazione AI**: Traduzioni che si adattano perfettamente al tuo prodotto
- 📊 **Flessibilità nei formati**: Supporta JSON, YAML, CSV, Markdown e altro

## 🛠️ Funzionalità potenziate

- ⚡️ **Velocità fulminea**: Localizzazione AI in pochi secondi
- 🔄 **Aggiornamenti automatici**: Sincronizzazione con i contenuti più recenti
- 🌟 **Qualità nativa**: Traduzioni che suonano autentiche
- 👨‍💻 **Developer-friendly**: CLI che si integra nel tuo workflow
- 📈 **Scalabile**: Per startup in crescita e team enterprise

## 📚 Documentazione

Per guide dettagliate e riferimenti API, visita la [documentazione](https://replexica.com/go/docs).

## 🤝 Contribuisci

Interessato a contribuire, anche se non sei un cliente?

Dai un'occhiata ai [Good First Issues](https://github.com/replexica/replexica/labels/good%20first%20issue) e leggi la [Guida per Contribuire](./CONTRIBUTING.md).

## 🧠 Team

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

Domande o richieste? Scrivi a veronica@replexica.com

## 🌐 Readme in altre lingue

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

Non vedi la tua lingua? Aggiungi semplicemente un nuovo codice lingua al file [`i18n.json`](./i18n.json) e apri una PR.
