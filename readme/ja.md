<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ CI/CDから直接、ウェブ＆モバイル向けの最先端AIローカライゼーション。</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">ウェブサイト</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">貢献する</a> •
  <a href="#-github-action">GitHub Action</a>
</p>

<p align="center">
  <a href="https://github.com/replexica/replexica/actions/workflows/release.yml">
    <img src="https://github.com/replexica/replexica/actions/workflows/release.yml/badge.svg" alt="リリース" />
  </a>
  <a href="https://github.com/replexica/replexica/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/replexica/replexica" alt="ライセンス" />
  </a>
  <a href="https://github.com/replexica/replexica/commits/main">
    <img src="https://img.shields.io/github/last-commit/replexica/replexica" alt="最終コミット" />
  </a>
</p>

<br />

Replexica AIはソフトウェアのローカライゼーションを完全に自動化します。

瞬時に本格的な翻訳を生成し、手作業と管理のオーバーヘッドを排除します。Replexica ローカライゼーションエンジンは製品のコンテキストを理解し、60以上の言語で、ネイティブスピーカーが期待する完璧な翻訳を作成します。その結果、チームは最先端の品質で100倍速くローカライゼーションを行い、世界中のより多くの有料顧客に機能を提供できます。

## 💫 クイックスタート

1. **アクセスをリクエスト**: [お問い合わせ](https://replexica.com/go/call)して顧客になります。

2. 承認されたら、プロジェクトを初期化します：
   ```bash
   npx replexica@latest init
   ```

3. コンテンツをローカライズします：
   ```bash
   npx replexica@latest i18n
   ```

## 🤖 GitHub Action

Replexicaは、CI/CDパイプラインでローカライゼーションを自動化するGitHub Actionを提供しています。基本的なセットアップは以下の通りです：

```yaml
- uses: replexica/replexica@main
  with:
    api-key: ${{ secrets.REPLEXICA_API_KEY }}
```

このアクションは、プッシュごとに`replexica i18n`を実行し、翻訳を自動的に最新の状態に保ちます。

プルリクエストモードやその他の設定オプションについては、[GitHub Actionのドキュメント](https://docs.replexica.com/setup/gha)をご覧ください。

## 🥇 チームがReplexicaを選ぶ理由

- 🔥 **即時統合**: 数分でセットアップ完了
- 🔄 **CI/CD自動化**: 開発パイプラインにシームレスに統合
- 🌍 **60以上の言語**: 簡単にグローバル展開
- 🧠 **AIローカライゼーションエンジン**: 製品に真にフィットする翻訳
- 📊 **柔軟なフォーマット**: JSON、YAML、CSV、Markdown他多数対応

## 🛠️ パワーアップ機能

- ⚡️ **超高速**: 数秒でAIローカライゼーション
- 🔄 **自動更新**: 最新コンテンツと同期
- 🌟 **ネイティブ品質**: 自然な翻訳
- 👨‍💻 **開発者フレンドリー**: ワークフローに統合可能なCLI
- 📈 **スケーラブル**: 成長中のスタートアップから大企業チームまで対応

## 📚 ドキュメンテーション

詳細なガイドとAPIリファレンスは、[ドキュメント](https://replexica.com/go/docs)をご覧ください。

## 🤝 貢献

顧客でなくても貢献に興味がありますか？

[初心者向け課題](https://github.com/replexica/replexica/labels/good%20first%20issue)をチェックし、[貢献ガイド](./CONTRIBUTING.md)をお読みください。

## 🧠 チーム

- **[Veronica](https://github.com/vrcprl)**
- **[Max](https://github.com/maxprilutskiy)**

質問や問い合わせは veronica@replexica.com までメールでお願いします。

## 🌐 他言語のREADME

- [英語](https://github.com/replexica/replexica)
- [スペイン語](/readme/es.md)
- [フランス語](/readme/fr.md)
- [ロシア語](/readme/ru.md)
- [ドイツ語](/readme/de.md)
- [中国語](/readme/zh-Hans.md)
- [韓国語](/readme/ko.md)
- [日本語](/readme/ja.md)
- [イタリア語](/readme/it.md)

お使いの言語が見つかりませんか？[`i18n.json`](./i18n.json)ファイルに新しい言語コードを追加し、PRを開いてください。
