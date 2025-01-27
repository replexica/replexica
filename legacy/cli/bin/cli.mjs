#!/usr/bin/env node

import CLI from "lingo.dev/cli";

const envVarConfigWarning = process.env.LINGODOTDEV_API_KEY
  ? "\nThis version is not compatible with LINGODOTDEV_API_KEY env variable."
  : "";

console.warn(
  "\x1b[33m%s\x1b[0m",
  `
⚠️  WARNING: NEW PACKAGE AVAILABLE ⚠️
================================================================================
This CLI version is deprecated.${envVarConfigWarning}
Please use lingo.dev instead:

npx lingo.dev@latest

Visit https://lingo.dev for more information.
================================================================================
`,
);

process.env.LINGODOTDEV_API_KEY = process.env.REPLEXICA_API_KEY;
process.env.LINGODOTDEV_PULL_REQUEST = process.env.REPLEXICA_PULL_REQUEST;
process.env.LINGODOTDEV_PULL_REQUEST_TITLE = process.env.REPLEXICA_PULL_REQUEST_TITLE;
process.env.LINGODOTDEV_COMMIT_MESSAGE = process.env.REPLEXICA_COMMIT_MESSAGE;
process.env.LINGODOTDEV_WORKING_DIRECTORY = process.env.REPLEXICA_WORKING_DIRECTORY;

await CLI.parseAsync(process.argv);
