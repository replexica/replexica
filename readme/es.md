<p align="center">
  <a href="https://lingo.dev">
    <img src="/content/banner.dark.png" width="100%" alt="Lingo.dev" />
  </a>
</p>

<p align="center">
  <strong>⚡️ Localización con IA de última generación para web y móvil, directamente desde CI/CD.</strong>
</p>

<br />

<p align="center">
  <a href="https://lingo.dev">Sitio web</a> •
  <a href="https://github.com/lingodotdev/lingo.dev/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">Contribuir</a> •
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

Lingo.dev automatiza la localización de software de principio a fin utilizando los últimos modelos de LLM.

Produce traducciones auténticas al instante, eliminando el trabajo manual y la sobrecarga de gestión. El Motor de Localización de Lingo.dev comprende el contexto del producto, creando traducciones perfeccionadas que los hablantes nativos esperan en más de 60 idiomas. Como resultado, los equipos realizan la localización 100 veces más rápido, con calidad de última generación, llevando funcionalidades a más clientes de pago en todo el mundo.

## 💫 Inicio rápido

1. Crea una cuenta en [el sitio web](https://lingo.dev)

2. Inicializa tu proyecto:

   ```bash
   npx lingo.dev@latest init
   ```

3. Consulta nuestra documentación: [docs.lingo.dev](https://docs.lingo.dev)

4. Localiza tu aplicación (toma segundos):
   ```bash
   npx lingo.dev@latest i18n
   ```

## 🤖 GitHub Action

Lingo.dev ofrece un GitHub Action para automatizar la localización en tu pipeline de CI/CD. Aquí tienes una configuración básica:

```yaml
- uses: lingodotdev/lingo.dev@main
  with:
    api-key: ${{ secrets.LINGODOTDEV_API_KEY }}
```

Esta action ejecuta `lingo.dev i18n` en cada push, manteniendo tus traducciones actualizadas automáticamente.

Para el modo de pull request y otras opciones de configuración, visita nuestra [documentación de GitHub Action](https://docs.lingo.dev/setup/gha).

## 🥇 Por qué los equipos eligen Lingo.dev

- 🔥 **Integración instantánea**: Configuración en minutos
- 🔄 **Automatización CI/CD**: Integración perfecta con el pipeline de desarrollo
- 🌍 **Más de 60 idiomas**: Expándete globalmente sin esfuerzo
- 🧠 **Motor de localización con IA**: Traducciones que realmente se adaptan a tu producto
- 📊 **Flexible en formatos**: Compatible con JSON, YAML, CSV, Markdown y más

## 🛠️ Características potenciadas

- ⚡️ **Ultra rápido**: Localización con IA en segundos
- 🔄 **Actualizaciones automáticas**: Sincronización con el contenido más reciente
- 🌟 **Calidad nativa**: Traducciones que suenan auténticas
- 👨‍💻 **Amigable para desarrolladores**: CLI que se integra con tu flujo de trabajo
- 📈 **Escalable**: Para startups en crecimiento y equipos empresariales

## 📚 Documentación

Para guías detalladas y referencias de la API, visita la [documentación](https://lingo.dev/go/docs).

## 🤝 Contribuye

¿Interesado en contribuir, incluso si no eres cliente?

Revisa los [Issues para Principiantes](https://github.com/lingodotdev/lingo.dev/labels/good%20first%20issue) y lee la [Guía de Contribución](./CONTRIBUTING.md).

## 🧠 Equipo

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

¿Preguntas o consultas? Envía un correo a veronica@lingo.dev

## 🌐 Readme en otros idiomas

- [Inglés](https://github.com/lingodotdev/lingo.dev)
- [Español](/readme/es.md)
- [Francés](/readme/fr.md)
- [Ruso](/readme/ru.md)
- [Alemán](/readme/de.md)
- [Chino](/readme/zh-Hans.md)
- [Coreano](/readme/ko.md)
- [Japonés](/readme/ja.md)
- [Italiano](/readme/it.md)
- [Árabe](/readme/ar.md)
- [Hindi](/readme/hi.md)

¿No ves tu idioma? Simplemente agrega un nuevo código de idioma al archivo [`i18n.json`](./i18n.json) y abre un PR.
