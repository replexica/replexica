<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ Localización de IA de última generación para web y móvil, directamente desde CI/CD.</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">Sitio web</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">Contribuir</a> •
  <a href="#-github-action">GitHub Action</a>
</p>

<p align="center">
  <a href="https://github.com/replexica/replexica/actions/workflows/release.yml">
    <img src="https://github.com/replexica/replexica/actions/workflows/release.yml/badge.svg" alt="Lanzamiento" />
  </a>
  <a href="https://github.com/replexica/replexica/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/replexica/replexica" alt="Licencia" />
  </a>
  <a href="https://github.com/replexica/replexica/commits/main">
    <img src="https://img.shields.io/github/last-commit/replexica/replexica" alt="Último Commit" />
  </a>
</p>

<br />

Replexica AI automatiza la localización de software de principio a fin.

Produce traducciones auténticas al instante, eliminando el trabajo manual y la gestión adicional. El motor de localización de Replexica comprende el contexto del producto, creando traducciones perfectas que los hablantes nativos esperan en más de 60 idiomas. Como resultado, los equipos realizan la localización 100 veces más rápido, con calidad de última generación, lanzando funciones a más clientes de pago en todo el mundo.

## 💫 Inicio rápido

1. **Solicita acceso**: [habla con nosotros](https://replexica.com/go/call) para convertirte en cliente.

2. Una vez aprobado, inicializa tu proyecto:
   ```bash
   npx replexica@latest init
   ```

3. Localiza tu contenido:
   ```bash
   npx replexica@latest i18n
   ```

## 🤖 GitHub Action

Replexica ofrece un GitHub Action para automatizar la localización en tu pipeline de CI/CD. Aquí tienes una configuración básica:

```yaml
- uses: replexica/replexica@main
  with:
    api-key: ${{ secrets.REPLEXICA_API_KEY }}
```

Esta acción ejecuta `replexica i18n` en cada push, manteniendo tus traducciones actualizadas automáticamente.

Para el modo de pull request y otras opciones de configuración, visita nuestra [documentación de GitHub Action](https://docs.replexica.com/setup/gha).

## 🥇 Por qué los equipos eligen Replexica

- 🔥 **Integración instantánea**: Configuración en minutos
- 🔄 **Automatización CI/CD**: Integración perfecta en el flujo de desarrollo
- 🌍 **Más de 60 idiomas**: Expándete globalmente sin esfuerzo
- 🧠 **Motor de localización con IA**: Traducciones que realmente se adaptan a tu producto
- 📊 **Flexibilidad de formatos**: Compatible con JSON, YAML, CSV, Markdown y más

## 🛠️ Características potenciadas

- ⚡️ **Ultrarrápido**: Localización AI en segundos
- 🔄 **Actualizaciones automáticas**: Sincroniza con el contenido más reciente
- 🌟 **Calidad nativa**: Traducciones que suenan auténticas
- 👨‍💻 **Amigable para desarrolladores**: CLI que se integra con tu flujo de trabajo
- 📈 **Escalable**: Para startups en crecimiento y equipos empresariales

## 📚 Documentación

Para guías detalladas y referencias de API, visita la [documentación](https://replexica.com/go/docs).

## 🤝 Contribuir

¿Interesado en contribuir, incluso si no eres cliente?

Consulta los [Good First Issues](https://github.com/replexica/replexica/labels/good%20first%20issue) y lee la [Guía de Contribución](./CONTRIBUTING.md).

## 🧠 Equipo

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

¿Preguntas o consultas? Envía un correo a veronica@replexica.com

## 🌐 Readme en otros idiomas

- [Inglés](https://github.com/replexica/replexica)
- [Español](/readme/es.md)
- [Francés](/readme/fr.md)
- [Ruso](/readme/ru.md)
- [Alemán](/readme/de.md)
- [Chino](/readme/zh-Hans.md)

¿No ves tu idioma? Simplemente añade un nuevo código de idioma al archivo [`i18n.json`](./i18n.json) y abre un PR.
