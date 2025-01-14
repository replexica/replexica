<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ 直接从CI/CD实现最先进的网页和移动端AI本地化。</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">官网</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">参与贡献</a> •
  <a href="#-github-action">GitHub Action</a>
</p>

<p align="center">
  <a href="https://github.com/replexica/replexica/actions/workflows/release.yml">
    <img src="https://github.com/replexica/replexica/actions/workflows/release.yml/badge.svg" alt="发布" />
  </a>
  <a href="https://github.com/replexica/replexica/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/replexica/replexica" alt="许可证" />
  </a>
  <a href="https://github.com/replexica/replexica/commits/main">
    <img src="https://img.shields.io/github/last-commit/replexica/replexica" alt="最新提交" />
  </a>
</p>

<br />

Replexica AI实现软件本地化的端到端自动化。

它能即时生成地道的翻译，消除人工工作和管理开销。Replexica本地化引擎深入理解产品上下文，为60多种语言创建完美的本地化内容，确保符合母语者的期望。因此，团队可以以最先进的质量实现100倍速的本地化，将功能快速推向全球更多付费用户。

## 💫 快速开始

1. 在[官网](https://replexica.com)创建账户

2. 初始化你的项目：

   ```bash
   npx replexica@latest init
   ```

3. 查看我们的文档：[docs.replexica.com](https://docs.replexica.com)

4. 本地化你的应用（仅需几秒）：
   ```bash
   npx replexica@latest i18n
   ```

## 🤖 GitHub Action

Replexica提供GitHub Action以在您的CI/CD流程中自动化本地化。以下是基本设置：

```yaml
- uses: replexica/replexica@main
  with:
    api-key: ${{ secrets.REPLEXICA_API_KEY }}
```

此action在每次推送时运行`replexica i18n`，自动保持您的翻译最新。

关于拉取请求模式和其他配置选项，请访问我们的[GitHub Action文档](https://docs.replexica.com/setup/gha)。

## 🥇 团队选择 Replexica 的原因

- 🔥 **即时集成**：几分钟内完成设置
- 🔄 **CI/CD 自动化**：无缝开发流程集成
- 🌍 **支持60+语言**：轻松实现全球化
- 🧠 **AI本地化引擎**：完美契合产品的翻译
- 📊 **格式灵活**：支持 JSON、YAML、CSV、Markdown 等

## 🛠️ 超强功能

- ⚡️ **闪电般速度**：AI 本地化仅需几秒
- 🔄 **自动更新**：与最新内容同步
- 🌟 **原生品质**：地道自然的翻译
- 👨‍💻 **开发者友好**：集成工作流的 CLI
- 📈 **可扩展性**：适用于成长型初创企业和企业团队

## 📚 文档

详细指南和 API 参考，请访问[文档](https://replexica.com/go/docs)。

## 🤝 参与贡献

想要参与贡献，即使你不是客户？

查看[适合新手的议题](https://github.com/replexica/replexica/labels/good%20first%20issue)并阅读[贡献指南](./CONTRIBUTING.md)。

## 🧠 团队

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

有问题或咨询？发邮件至 veronica@replexica.com

## 🌐 其他语言版本的说明文档

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

没有看到你的语言？只需在 [`i18n.json`](./i18n.json) 文件中添加新的语言代码并提交 PR。
