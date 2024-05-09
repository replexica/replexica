# Add Next.js Pages Router Support

This pull request introduces dynamic page routing support for the Next.js pages router within the `replexica` project. The changes include the creation of a new dynamic page file `[id].tsx` in the `next-pages` package, which allows for dynamic routing based on the page ID.

## Changes
- Created a new file `demo/next-pages/src/pages/[id].tsx` to handle dynamic routing.
- The dynamic page component uses the `useRouter` hook from `next/router` to access the router object and the page ID from the query parameters.

## Testing
- The dynamic routing functionality has been tested locally to ensure that it works as expected.
- The development server was run, and the dynamic routing was verified by navigating to different page IDs.

## Notes
- The README.md files for the npm packages have been updated with links to the main repository as part of the initial task.
- The local git configuration has been updated to attribute commits to the username `iftekharanwar`.

Please review the changes and provide any feedback or approval as necessary. Thank you!
