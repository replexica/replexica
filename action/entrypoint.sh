#!/bin/sh -l

set -e

# Function to run Replexica CLI
run_replexica() {
    npx replexica@${REPLEXICA_VERSION} i18n
    if [ $? -eq 1 ]; then
        echo "::error::Replexica: Translation update failed. For assistance, join our Discord: https://replexica.com/go/discord"
        exit 1
    fi
}

# Function to configure git
configure_git() {
    git config --global --add safe.directory $PWD
    git config --global user.name "Replexica"
    git config --global user.email "support@replexica.com"
}

# Function to get the current branch name
get_current_branch() {
    local branch_name=""

    if [ -n "$GITHUB_HEAD_REF" ]; then
        # Pull request
        branch_name="$GITHUB_HEAD_REF"
    elif [ -n "$GITHUB_REF_NAME" ]; then
        # Push or workflow_dispatch
        if echo "$GITHUB_REF" | grep -q "^refs/tags/"; then
            # It's a tag, return the default branch
            branch_name=$(gh api repos/:owner/:repo | jq -r .default_branch)
        else
            branch_name="$GITHUB_REF_NAME"
        fi
    elif [ -n "$GITHUB_REF" ]; then
        # Fallback for other cases
        branch_name=$(echo "$GITHUB_REF" | sed 's:^refs/[^/]*/::')
    else
        echo "::error::Replexica: Unable to determine the current branch name. For assistance, join our Discord: https://replexica.com/go/discord"
        exit 1
    fi

    echo "$branch_name"
}

# Function to commit changes
commit_changes() {
    git add .
    if ! git diff --staged --quiet; then
        git commit -m "${REPLEXICA_COMMIT_MESSAGE}"
        echo "Changes committed successfully"
        return 0
    else
        echo "::notice::Replexica: All translations are up to date."
        return 1
    fi
}

# Function to create or update PR
create_or_update_pr() {
    local current_branch=$(get_current_branch)
    local pr_branch="replexica/${current_branch}"
    local pr_title="${REPLEXICA_PULL_REQUEST_TITLE}"

    # Create or update the branch
    git checkout -B "$pr_branch"
    git push -f origin "$pr_branch"

    # Check if PR already exists
    existing_pr=$(gh pr list --head "$pr_branch" --json number --jq '.[0].number')

    # Read PR body from adjacent file called pr.md
    pr_body_file="/pr.md"

    local pr_create_args="--title \"$pr_title\" --body-file \"$pr_body_file\" --head \"$pr_branch\""
    local pr_edit_args="--title \"$pr_title\" --body-file \"$pr_body_file\""

    add_assignees_to_pr_args
    add_labels_to_pr_args "$existing_pr"

    # Create new PR or update existing one
    if [ -n "$existing_pr" ]; then
        eval gh pr edit "$existing_pr" $pr_edit_args
        echo "::notice::Replexica: Updated existing PR #$existing_pr with translations. Review it here: https://github.com/$GITHUB_REPOSITORY/pull/$existing_pr"
    else
        new_pr=$(eval gh pr create $pr_create_args)
        echo "::notice::Replexica: Created new PR with translations. Review it here: $new_pr"
    fi
}

# Function to add assignees to PR arguments
add_assignees_to_pr_args() {
    if [ -n "$REPLEXICA_PULL_REQUEST_ASSIGNEES" ]; then
        OLD_IFS="$IFS"
        IFS=','
        for assignee in $REPLEXICA_PULL_REQUEST_ASSIGNEES; do
            pr_create_args="$pr_create_args --assignee \"$assignee\""
            pr_edit_args="$pr_edit_args --add-assignee \"$assignee\""
        done
        IFS="$OLD_IFS"
    fi
}

# Function to add labels to PR arguments
add_labels_to_pr_args() {
    local existing_pr="$1"
    if [ -n "$REPLEXICA_PULL_REQUEST_LABELS" ]; then
        OLD_IFS="$IFS"
        IFS=','
        for label in $REPLEXICA_PULL_REQUEST_LABELS; do
            # Check if label exists in the repository
            if ! gh label list | grep -q "^$label "; then
                # Create label if it doesn't exist in the repository
                gh label create "$label" --color "#1ac964" || true > /dev/null
            fi
            
            # For new PRs, add all labels
            if [ -z "$existing_pr" ]; then
                pr_create_args="$pr_create_args --label \"$label\""
            else
                # For existing PRs, check if the label is already present
                if ! gh pr view "$existing_pr" --json labels --jq '.labels[].name' | grep -q "^$label$"; then
                    pr_edit_args="$pr_edit_args --add-label \"$label\""
                fi
            fi
        done
        IFS="$OLD_IFS"
    fi
}

# Main execution
main() {
    if [ "$REPLEXICA_PULL_REQUEST" = "true" ]; then
        if [ -z "$GH_TOKEN" ]; then
            echo "::error::Replexica: GitHub token is missing. Add 'GH_TOKEN: \${{ github.token }}' to your Replexica action configuration env section."
            exit 1
        fi
    fi

    # Run Replexica to update translations
    run_replexica

    # Configure git for committing changes
    configure_git

    # Commit changes if any are found
    if commit_changes; then
        if [ "$REPLEXICA_PULL_REQUEST" = "true" ]; then
            # Create or update pull request
            create_or_update_pr
        else
            # Push changes directly to the repository
            git pull --rebase
            git push
            COMMIT_HASH=$(git rev-parse HEAD)
            COMMIT_URL="https://github.com/$GITHUB_REPOSITORY/commit/$COMMIT_HASH"
            echo "::notice::Replexica: Translation updates pushed successfully. View the commit: $COMMIT_URL"
        fi
    fi
}

# Run the main function
main
