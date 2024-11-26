<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ 直接从CI/CD实现最先进的Web和移动端AI本地化。</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">官网</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">参与贡献</a> •
  <a href="#-github-action">GitHub Action</a> •
  <a href="#-localization-compiler-experimental">本地化编译器</a>
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

Replexica AI实现软件本地化的端到端自动化。

它能即时生成地道的翻译，消除人工工作和管理开销。Replexica本地化引擎深入理解产品上下文，为60多种语言创建完美的本地化内容，确保符合母语者的期望。因此，团队可以以最先进的质量实现100倍速的本地化，将功能快速推向全球更多付费用户。

## 💫 快速开始

1. **申请访问权限**：[联系我们](https://replexica.com/go/call)成为客户。

2. 一旦获得批准，初始化您的项目：
   ```bash
   npx replexica@latest init
   ```

3. 本地化您的内容：
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

## 🧪 本地化编译器（实验性）

这个代码库还包含我们的新实验：JS/React本地化编译器。

它让开发团队可以**无需将字符串提取到翻译文件**就能完成前端本地化。团队只需一行代码就能实现多语言前端。它在构建时工作，使用抽象语法树（AST）操作和代码生成。

你可以在[这里](https://x.com/MaxPrilutskiy/status/1781011350136734055)查看演示。

如果你想自己尝试编译器，请确保先执行 `git checkout 6c6d59e8aa27836fd608f9258ea4dea82961120f`。

## 🥇 团队选择 Replexica 的原因

- 🔥 **即时集成**：几分钟内完成设置
- 🔄 **CI/CD 自动化**：无缝集成开发流程
- 🌍 **支持 60+ 语言**：轻松实现全球化
- 🧠 **AI 本地化引擎**：真正适合你产品的翻译
- 📊 **灵活的格式支持**：支持 JSON、YAML、CSV、Markdown 等

## 🛠️ 增强功能

- ⚡️ **闪电般速度**：AI 本地化仅需数秒
- 🔄 **自动更新**：与最新内容同步
- 🌟 **原生品质**：地道的翻译效果
- 👨‍💻 **开发者友好**：集成到工作流程的 CLI
- 📈 **可扩展性**：适用于成长型初创企业和企业团队

## 📚 文档

有关详细指南和API参考，请访问[文档](https://replexica.com/go/docs)。

## 🤝 参与贡献

想要参与贡献，即使你不是客户？

查看[适合新手的议题](https://github.com/replexica/replexica/labels/good%20first%20issue)并阅读[贡献指南](./CONTRIBUTING.md)。

## 🧠 团队

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

有问题或咨询？请发送邮件至 veronica@replexica.com

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

没有看到你的语言？只需在[`i18n.json`](./i18n.json)文件中添加新的语言代码并提交PR即可。
