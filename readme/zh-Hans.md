<p align="center">
  <a href="https://lingo.dev">
    <img src="/content/banner.dark.png" width="100%" alt="Lingo.dev" />
  </a>
</p>

<p align="center">
  <strong>⚡️ 通过 CI/CD 实现网页和移动端的最先进 AI 本地化。</strong>
</p>

<br />

<p align="center">
  <a href="https://lingo.dev">官网</a> •
  <a href="https://github.com/lingodotdev/lingo.dev/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">参与贡献</a> •
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

Lingo.dev 使用最新的 LLM 模型实现软件本地化的端到端自动化。

它能即时生成地道的翻译，消除人工工作和管理开销。Lingo.dev 本地化引擎理解产品上下文，为 60 多种语言创建完美的翻译，确保符合母语者的期望。因此，团队可以以最先进的质量完成本地化工作，速度提升 100 倍，将功能更快地推向全球付费用户。

## 💫 快速开始

1. 在[官网](https://lingo.dev)创建账号

2. 初始化项目：

   ```bash
   npx lingo.dev@latest init
   ```

3. 查看我们的文档：[docs.lingo.dev](https://docs.lingo.dev)

4. 本地化你的应用（仅需几秒）：
   ```bash
   npx lingo.dev@latest i18n
   ```

## 🤖 GitHub Action

Lingo.dev 提供 GitHub Action 来在你的 CI/CD 流程中自动化本地化。以下是基本设置：

```yaml
- uses: lingodotdev/lingo.dev@main
  with:
    api-key: ${{ secrets.LINGODOTDEV_API_KEY }}
```

这个 action 会在每次推送时运行 `lingo.dev i18n`，自动保持翻译内容的更新。

关于 pull request 模式和其他配置选项，请访问我们的 [GitHub Action 文档](https://docs.lingo.dev/setup/gha)。

## 🥇 团队选择 Lingo.dev 的原因

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

详细指南和 API 参考，请访问[文档](https://lingo.dev/go/docs)。

## 🤝 参与贡献

有兴趣参与贡献，即使您不是客户？

查看[适合新手的议题](https://github.com/lingodotdev/lingo.dev/labels/good%20first%20issue)并阅读[贡献指南](./CONTRIBUTING.md)。

## 🧠 团队

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

有问题或咨询？发送邮件至 veronica@lingo.dev

## 🌐 其他语言版本的说明文档

- [英文](https://github.com/lingodotdev/lingo.dev)
- [西班牙语](/readme/es.md)
- [法语](/readme/fr.md)
- [俄语](/readme/ru.md)
- [德语](/readme/de.md)
- [中文](/readme/zh-Hans.md)
- [韩语](/readme/ko.md)
- [日语](/readme/ja.md)
- [意大利语](/readme/it.md)
- [阿拉伯语](/readme/ar.md)

没有看到您的语言？只需在 [`i18n.json`](./i18n.json) 文件中添加新的语言代码并提交 PR。
