# CONTRIBUTING.md

Thank you for contributing to Lingo.dev! We're an exciting open source project and we'd love to have you contribute!

Here's some resources and guidance to help you get started:

[1. Getting Started](#getting-started)
[2. Issues](#issues)
[3. Pull Requests](#pull-requests)
[4. Release Process](#release-process)

## Getting Started

Here's how to get the project running locally:

```bash
git clone https://github.com/lingodotdev/lingo.dev
cd lingo.dev
pnpm i
pnpm turbo build

# in terminal window 1 - watch for CLI code changes
cd packages/cli
pnpm run dev

# in terminal window 2 - test the CLI
cd package
pnpm lingo.dev --help # this command will use the current cli code + demo config from ./package/i18n.json
```

Feel free to ask questions on our [Discord server](https://lingo.dev/go/discord)!

## Issues

If you find a bug, please create an Issue and we'll triage it.

- Please search [existing Issues](https://github.com/lingodotdev/lingo.dev/issues) before creating a new one
- Please include a clear description of the problem along with steps to reproduce it. Exact steps with screenshots and urls really help here
- Before starting work on an issue, please comment on it and wait for it to be assigned to you. This prevents multiple people from working on the same issue simultaneously
- Let's discuss implementation details in the issue comments or Discord before starting work, to ensure alignment between contributors and the Lingo.dev team

## Pull Requests

We actively welcome your Pull Requests! A couple of things to keep in mind before you submit:

- If you're fixing an Issue, make sure someone else hasn't already created a PR fixing the same issue
- Make sure to link your PR to the related Issue(s)
- We will always try to accept the first viable PR that resolves the Issue
- Please discuss implementation approach beforehand to avoid having PRs rejected

## Release Process

Be sure to run `pnpm new` after you're done with the changes. This will use `changesets` library to trigger a new version after the PR is merged to the main branch. Be sure to do that after requesting a review from the maintainers: the CI build will fail if you don't run `pnpm new`.
