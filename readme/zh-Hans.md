<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ 直接从CI/CD实现网页和移动端的最先进AI本地化。</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">网站</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">贡献</a> •
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
    <img src="https://img.shields.io/github/last-commit/replexica/replexica" alt="最后提交" />
  </a>
</p>

<br />

Replexica AI实现软件本地化的端到端自动化。

它即时生成地道的翻译，消除了手动工作和管理开销。Replexica本地化引擎理解产品上下文，为60多种语言创建完美的翻译，符合母语使用者的期望。因此，团队可以以最先进的质量进行100倍速的本地化，将功能推广给全球更多付费客户。

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

## 🥇 团队选择 Replexica 的原因

- 🔥 **即时集成**：几分钟内完成设置
- 🔄 **CI/CD 自动化**：无缝集成开发流程
- 🌍 **60+ 种语言**：轻松实现全球化
- 🧠 **AI 本地化引擎**：真正适合您产品的翻译
- 📊 **格式灵活**：支持 JSON、YAML、CSV、Markdown 等

## 🛠️ 超强功能

- ⚡️ **闪电般速度**：AI 本地化仅需几秒
- 🔄 **自动更新**：与最新内容同步
- 🌟 **原生品质**：听起来地道的翻译
- 👨‍💻 **开发者友好**：与您的工作流程集成的 CLI
- 📈 **可扩展**：适用于成长中的初创公司和企业团队

## 📚 文档

有关详细指南和 API 参考，请访问[文档](https://replexica.com/go/docs)。

## 🤝 贡献

即使您不是客户，也对贡献感兴趣吗？

查看[适合新手的问题](https://github.com/replexica/replexica/labels/good%20first%20issue)并阅读[贡献指南](./CONTRIBUTING.md)。

## 🧠 团队

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

有问题或咨询？请发送邮件至 veronica@replexica.com

## 🌐 其他语言的 Readme

- [英文](https://github.com/replexica/replexica)
- [西班牙语](/readme/es.md)
- [法语](/readme/fr.md)
- [俄语](/readme/ru.md)
- [德语](/readme/de.md)
- [中文](/readme/zh-Hans.md)
- [韩语](/readme/ko.md)
- [日语](/readme/ja.md)
- [意大利语](/readme/it.md)
- [阿拉伯语](/readme/ar.md)

没有看到你的语言？只需在 [`i18n.json`](./i18n.json) 文件中添加新的语言代码，然后提交一个 PR。
