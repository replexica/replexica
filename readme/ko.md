<p align="center">
  <a href="https://replexica.com">
    <img src="/content/banner.dark.png" width="100%" alt="Replexica" />
  </a>
</p>

<p align="center">
  <strong>⚡️ CI/CD에서 바로 사용 가능한 최첨단 AI 웹 & 모바일 로컬라이제이션.</strong>
</p>

<br />

<p align="center">
  <a href="https://replexica.com">웹사이트</a> •
  <a href="https://github.com/replexica/replexica/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">기여하기</a> •
  <a href="#-github-action">GitHub Action</a>
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

Replexica AI는 소프트웨어 로컬라이제이션을 엔드투엔드로 자동화합니다.

수작업과 관리 오버헤드를 제거하고 즉시 정통한 번역을 생성합니다. Replexica 로컬라이제이션 엔진은 제품 컨텍스트를 이해하여 60개 이상의 언어에서 원어민이 기대하는 완벽한 번역을 만들어냅니다. 결과적으로 팀은 최첨단 품질로 100배 더 빠르게 로컬라이제이션을 수행하여 전 세계의 더 많은 유료 고객에게 기능을 제공할 수 있습니다.

## 💫 빠른 시작

1. **액세스 요청**: [문의하기](https://replexica.com/go/call)를 통해 고객이 되세요.

2. 승인되면 프로젝트를 초기화하세요:
   ```bash
   npx replexica@latest init
   ```

3. 콘텐츠를 로컬라이즈하세요:
   ```bash
   npx replexica@latest i18n
   ```

## 🤖 GitHub Action

Replexica는 CI/CD 파이프라인에서 로컬라이제이션을 자동화하는 GitHub Action을 제공합니다. 기본 설정은 다음과 같습니다:

```yaml
- uses: replexica/replexica@main
  with:
    api-key: ${{ secrets.REPLEXICA_API_KEY }}
```

이 액션은 모든 푸시에서 `replexica i18n`을 실행하여 번역을 자동으로 최신 상태로 유지합니다.

풀 리퀘스트 모드 및 기타 구성 옵션에 대해서는 [GitHub Action 문서](https://docs.replexica.com/setup/gha)를 참조하세요.

## 🥇 팀들이 Replexica를 선택하는 이유

- 🔥 **즉시 통합**: 몇 분 만에 설정 완료
- 🔄 **CI/CD 자동화**: 개발 파이프라인과 원활한 통합
- 🌍 **60개 이상의 언어**: 손쉽게 글로벌 확장
- 🧠 **AI 현지화 엔진**: 제품에 정말로 맞는 번역
- 📊 **유연한 형식**: JSON, YAML, CSV, 마크다운 등 지원

## 🛠️ 강력한 기능

- ⚡️ **초고속**: 몇 초 만에 AI 현지화
- 🔄 **자동 업데이트**: 최신 콘텐츠와 동기화
- 🌟 **네이티브 품질**: 자연스럽게 들리는 번역
- 👨‍💻 **개발자 친화적**: 워크플로우와 통합되는 CLI
- 📈 **확장 가능**: 성장하는 스타트업과 엔터프라이즈 팀을 위해

## 📚 문서

자세한 가이드와 API 참조는 [문서](https://replexica.com/go/docs)를 참조하세요.

## 🤝 기여하기

고객이 아니더라도 기여하는 데 관심이 있으신가요?

[초보자를 위한 이슈](https://github.com/replexica/replexica/labels/good%20first%20issue)를 확인하고 [기여 가이드](./CONTRIBUTING.md)를 읽어보세요.

## 🧠 팀

- **[베로니카](https://github.com/vrcprl)**
- **[맥스](https://github.com/maxprilutskiy)**

질문이나 문의사항이 있으신가요? veronica@replexica.com으로 이메일을 보내주세요.

## 🌐 다른 언어로 된 리드미

- [영어](https://github.com/replexica/replexica)
- [스페인어](/readme/es.md)
- [프랑스어](/readme/fr.md)
- [러시아어](/readme/ru.md)
- [독일어](/readme/de.md)
- [중국어](/readme/zh-Hans.md)
- [한국어](/readme/ko.md)
- [일본어](/readme/ja.md)
- [이탈리아어](/readme/it.md)

원하는 언어가 없나요? [`i18n.json`](./i18n.json) 파일에 새로운 언어 코드를 추가하고 PR을 열어주세요.
