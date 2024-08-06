# CONTRIBUTING.md

Thank you for contributing to Replexica! We’re an exciting open source project and we’d love to have you contribute! Here’s some resources and guidance to help you get started:

[1. Issues](#issues)
[2. Pull Requests](#pull-requests)

## Issues

If you find a bug, please create an Issue and we’ll triage it.

- Please search [existing Issues](https://github.com/replexica/replexica/issues) before creating a new one.
- Please include a clear description of the problem along with steps to reproduce it. Exact steps with screenshots and urls really help here.

## Pull Requests

We actively welcome your Pull Requests! A couple of things to keep in mind before you submit:

- If you’re fixing an Issue, make sure someone else hasn’t already created a PR fixing the same issue. Likewise, make sure to link your PR to the related Issue(s).
- We will always try to accept the first viable PR that resolves the Issue.

## Release Process

Be sure to run `pnpm new` after you're done with the changes. This will use `changesets` library to trigger a new version after the PR is merged to the main branch.

Be sure to do that after requesting a review from the maintainers: the CI build will fail if you don't run `pnpm new`.
