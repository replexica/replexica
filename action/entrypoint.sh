#!/bin/sh -l

set -e

# Function to run Replexica CLI
run_replexica() {
    npx replexica@${REPLEXICA_VERSION} i18n
    if [ $? -eq 1 ]; then
        echo "::error::🚨 Replexica incurred an error while applying translations. Discord: https://replexica.com/go/discord"
        exit 1
    fi
}

# Function to configure git
configure_git() {
    git config --global --add safe.directory $PWD
    git config --global user.name "Replexica"
    git config --global user.email "support@replexica.com"
}

# Function to commit changes
commit_changes() {
    git add .
    if ! git diff --staged --quiet; then
        git commit -m "feat: add missing translations"
        echo "Changes committed"
        return 0
    else
        echo "::notice::Replexica has not found any missing translations"
        return 1
    fi
}

# Function to create or update PR
create_or_update_pr() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    local pr_branch="${current_branch}/replexica"
    local pr_title="Replexica: Add missing translations"
    local pr_body="This PR adds missing translations using Replexica."

    # Create or update the branch
    git checkout -B "$pr_branch"
    git push -f origin "$pr_branch"

    # Check if PR already exists
    existing_pr=$(gh pr list --head "$pr_branch" --json number --jq '.[0].number')

    if [ -n "$existing_pr" ]; then
        gh pr edit "$existing_pr" --title "$pr_title" --body "$pr_body"
        echo "::notice::Updated existing PR #$existing_pr"
    else
        gh pr create --title "$pr_title" --body "$pr_body" --head "$pr_branch"
        echo "::notice::Created new PR"
    fi
}

# Main execution
run_replexica
configure_git

if commit_changes; then
    if [ "$REPLEXICA_PULL_REQUEST" = "true" ]; then
        create_or_update_pr
    else
        git pull --rebase
        git push
        COMMIT_HASH=$(git rev-parse HEAD)
        COMMIT_URL="https://github.com/$GITHUB_REPOSITORY/commit/$COMMIT_HASH"
        echo "::notice::Replexica has just added missing translations and pushed them to the repo! The commit: $COMMIT_URL"
    fi
fi
