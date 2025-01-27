#!/usr/bin/env node

import CLI from "../build/cli.mjs";

await CLI.parseAsync(process.argv);
