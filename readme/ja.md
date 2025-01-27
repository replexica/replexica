<p align="center">
  <a href="https://lingo.dev">
    <img src="/content/banner.dark.png" width="100%" alt="Lingo.dev" />
  </a>
</p>

<p align="center">
  <strong>⚡️ CI/CDから直接利用できる最先端のAIローカライゼーション - ウェブ＆モバイル対応</strong>
</p>

<br />

<p align="center">
  <a href="https://lingo.dev">ウェブサイト</a> •
  <a href="https://github.com/lingodotdev/lingo.dev/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">コントリビュート</a> •
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

Lingo.devは、最新のLLMモデルを使用してソフトウェアのローカライゼーションを完全に自動化します。

瞬時に自然な翻訳を生成し、手作業や管理の手間を排除します。Lingo.devのローカライゼーションエンジンは製品のコンテキストを理解し、60以上の言語でネイティブスピーカーが期待する完璧な翻訳を作成します。その結果、チームは最先端の品質を維持しながら、ローカライゼーションを100倍速く実行でき、世界中のより多くの有料顧客に向けて機能をリリースすることができます。

## 💫 クイックスタート

1. [ウェブサイト](https://lingo.dev)でアカウントを作成

2. プロジェクトの初期化:

   ```bash
   npx lingo.dev@latest init
   ```

3. ドキュメントを確認: [docs.lingo.dev](https://docs.lingo.dev)

4. アプリのローカライズ（数秒で完了）:
   ```bash
   npx lingo.dev@latest i18n
   ```

## 🤖 GitHub Action

Lingo.devは、CI/CDパイプラインでローカライゼーションを自動化するGitHub Actionを提供しています。基本的なセットアップは以下の通りです：

```yaml
- uses: lingodotdev/lingo.dev@main
  with:
    api-key: ${{ secrets.LINGODOTDEV_API_KEY }}
```

このアクションは、プッシュごとに`lingo.dev i18n`を実行し、翻訳を自動的に最新の状態に保ちます。

プルリクエストモードやその他の設定オプションについては、[GitHub Actionのドキュメント](https://docs.lingo.dev/setup/gha)をご覧ください。

## 🥇 チームがLingo.devを選ぶ理由

- 🔥 **即時導入**: 数分でセットアップ完了
- 🔄 **CI/CD自動化**: シームレスな開発パイプライン統合
- 🌍 **60以上の言語**: グローバル展開を簡単に
- 🧠 **AIローカライゼーションエンジン**: 製品に最適化された翻訳
- 📊 **柔軟なフォーマット**: JSON、YAML、CSV、Markdown他に対応

## 🛠️ パワフルな機能

- ⚡️ **超高速**: 数秒でAIローカライゼーション
- 🔄 **自動更新**: 最新コンテンツと同期
- 🌟 **ネイティブ品質**: 自然な翻訳
- 👨‍💻 **開発者フレンドリー**: ワークフローに統合できるCLI
- 📈 **スケーラブル**: 成長中のスタートアップから大企業まで対応

## 📚 ドキュメント

詳細なガイドやAPIリファレンスについては、[ドキュメント](https://lingo.dev/go/docs)をご覧ください。

## 🤝 コントリビュート

顧客でなくても、コントリビュートに興味がありますか？

[Good First Issues](https://github.com/lingodotdev/lingo.dev/labels/good%20first%20issue)をチェックして、[コントリビューションガイド](./CONTRIBUTING.md)をお読みください。

## 🧠 チーム

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

ご質問やお問い合わせは veronica@lingo.dev までメールでご連絡ください

## 🌐 他言語のREADME

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

お使いの言語が見つかりませんか？[`i18n.json`](./i18n.json)ファイルに新しい言語コードを追加してPRを開いてください。
