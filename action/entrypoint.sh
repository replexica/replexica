#!/bin/sh -l

# Run Replexica CLI to localize missing strings
# USe REPLEXICA_VERSION env variable to specify the version of Replexica CLI
npx replexica@${REPLEXICA_VERSION} i18n
# Return exit code 1 if the previous command fails
if [ $? -eq 1 ]; then
  echo "::error::🚨 Replexica incurred an error while applying translations. Discord: https://replexica.com/go/discord"
  exit 1
fi
# Commit the changes into the current branch
git config --global --add safe.directory $PWD
git config --global user.name "Replexica"
git config --global user.email "support@replexica.com"
git add .
if git diff --staged --quiet; then
  echo "::notice::Replexica has not found any missing translations"
else
  git commit -m "feat: add missing translations"
  # Pull the latest changes from the remote repository
  git pull --rebase
  git push
  # retrieve the last commit hash
  COMMIT_HASH=$(git rev-parse HEAD)
  # build a github url to the commit
  COMMIT_URL="https://github.com/$GITHUB_REPOSITORY/commit/$COMMIT_HASH"
  # output the commit url to the github actions announcements using ::notice::
  echo "::notice::Replexica has just added missing translations and pushed them to the repo! The commit: $COMMIT_URL"
fi
