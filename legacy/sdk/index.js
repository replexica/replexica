console.warn('\x1b[33m%s\x1b[0m', `
⚠️  WARNING: NEW PACKAGE AVAILABLE ⚠️
=======================================
This SDK version is deprecated.
Please use lingo.dev instead:

npm install lingo.dev

Visit https://lingo.dev for more information.
=======================================
`);

export * from "lingo.dev/sdk";
