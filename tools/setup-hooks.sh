#!/bin/sh
# tools/setup-hooks.sh
# Run ONCE from Terminal after cloning or when hooks need reinstalling:
#   chmod +x tools/setup-hooks.sh && ./tools/setup-hooks.sh
#
# Installs a pre-push git hook that auto-regenerates static SEO pages
# before every push to origin.

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK="$REPO_ROOT/.git/hooks/pre-push"

cat > "$HOOK" << 'EOF'
#!/bin/sh
# Epistemic pre-push hook — regenerates all static SEO pages before every push
REPO_ROOT="$(git rev-parse --show-toplevel)"
echo "▸ Epistemic: regenerating static concept pages..."
node "$REPO_ROOT/tools/generate-static-pages.js"
if [ $? -ne 0 ]; then
  echo "✗ generate-static-pages.js failed — push aborted."
  exit 1
fi
echo "✓ Static pages up to date."
exit 0
EOF

chmod +x "$HOOK"
echo "✓ pre-push hook installed at $HOOK"
echo "  Static pages will now regenerate automatically on every push."
