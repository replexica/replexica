#!/usr/bin/env node

import CLI from "lingo.dev/cli";

console.warn('\x1b[33m%s\x1b[0m', `
⚠️  WARNING: NEW PACKAGE AVAILABLE ⚠️
=======================================
This CLI version is deprecated.
Please use lingo.dev instead:

npx lingo.dev@latest

Visit https://lingo.dev for more information.
=======================================
`);

await CLI.parseAsync(process.argv);
