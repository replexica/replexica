<p align="center">
  <a href="https://lingo.dev">
    <img src="/content/banner.dark.png" width="100%" alt="Lingo.dev" />
  </a>
</p>

<p align="center">
  <strong>⚡️ Localização com IA de última geração para web & mobile, direto do CI/CD.</strong>
</p>

<br />

<p align="center">
  <a href="https://lingo.dev">Website</a> •
  <a href="https://github.com/lingodotdev/lingo.dev/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">Contribua</a> •
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

O Lingo.dev automatiza a localização de software de ponta a ponta usando os mais recentes modelos LLM.

Ele produz traduções autênticas instantaneamente, eliminando trabalho manual e overhead de gerenciamento. O Motor de Localização do Lingo.dev entende o contexto do produto, criando traduções aperfeiçoadas que falantes nativos esperam em mais de 60 idiomas. Como resultado, as equipes fazem localização 100x mais rápido, com qualidade de última geração, entregando recursos para mais clientes pagantes em todo o mundo.

## 💫 Início rápido

1. Crie uma conta no [website](https://lingo.dev)

2. Inicialize seu projeto:

   ```bash
   npx lingo.dev@latest init
   ```

3. Confira nossa documentação: [docs.lingo.dev](https://docs.lingo.dev)

4. Localize seu app (leva segundos):
   ```bash
   npx lingo.dev@latest i18n
   ```

## 🤖 GitHub Action

O Lingo.dev oferece uma GitHub Action para automatizar a localização em seu pipeline de CI/CD. Aqui está uma configuração básica:

```yaml
- uses: lingodotdev/lingo.dev@main
  with:
    api-key: ${{ secrets.LINGODOTDEV_API_KEY }}
```

Esta action executa `lingo.dev i18n` a cada push, mantendo suas traduções automaticamente atualizadas.

Para o modo de pull request e outras opções de configuração, visite nossa [documentação da GitHub Action](https://docs.lingo.dev/setup/gha).

## 🥇 Por que as equipes escolhem o Lingo.dev

- 🔥 **Integração instantânea**: Configure em minutos
- 🔄 **Automação CI/CD**: Integração perfeita com pipeline de dev
- 🌍 **60+ Idiomas**: Expanda globalmente sem esforço
- 🧠 **Motor de Localização com IA**: Traduções que realmente se encaixam no seu produto
- 📊 **Flexível em formatos**: Suporta JSON, YAML, CSV, Markdown e mais

## 🛠️ Recursos poderosos

- ⚡️ **Ultra-rápido**: Localização com IA em segundos
- 🔄 **Atualizações automáticas**: Sincroniza com o conteúdo mais recente
- 🌟 **Qualidade nativa**: Traduções que soam autênticas
- 👨‍💻 **Amigável para desenvolvedores**: CLI que integra com seu workflow
- 📈 **Escalável**: Para startups em crescimento e times enterprise

## 📚 Documentação

Para guias detalhados e referências da API, visite a [documentação](https://lingo.dev/go/docs).

## 🤝 Contribua

Interessado em contribuir, mesmo não sendo cliente?

Confira as [Good First Issues](https://github.com/lingodotdev/lingo.dev/labels/good%20first%20issue) e leia o [Guia de Contribuição](./CONTRIBUTING.md).

## 🧠 Time

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

Dúvidas ou informações? Email veronica@lingo.dev

## 🌐 Readme em outros idiomas

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
- [Hindi](/readme/hi.md)

Não vê seu idioma? Apenas adicione um novo código de idioma ao arquivo [`i18n.json`](./i18n.json) e abra um PR.