#!/bin/bash
# ep-commit.sh — run from Mac Terminal to commit Epistemic changes
# Usage: ./ep-commit.sh "v2.14b - your commit message"
# Claude stages the files, you run this to commit. GitHub Desktop stays open.

REPO="$HOME/Documents/GitHub/listen-learn-live"
cd "$REPO" || { echo "❌ Repo not found at $REPO"; exit 1; }

# Clear any stale locks
rm -f .git/index.lock .git/HEAD.lock

MSG="${1:-"wip: auto-commit from ep-commit.sh"}"

# Stage all modified tracked files (equivalent to git add for changed files)
git add -u

# Also stage any explicitly listed files passed after the message
shift
for f in "$@"; do
  git add "$f"
done

git commit -m "$MSG"
echo ""
echo "✅ Committed. Now click 'Push origin' in GitHub Desktop."
