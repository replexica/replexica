---
"@replexica/cli": patch
---

Improved JSON serialization to preserve existing formatting in i18n.json. If a Prettier config is provided, it will be used for formatting; otherwise, the .editorconfig will be used, or defaults will be applied if neither is available.
