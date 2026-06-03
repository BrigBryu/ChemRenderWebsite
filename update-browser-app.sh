#!/usr/bin/env bash
#
# update-browser-app.sh
#
# Rebuilds the public browser version of ChemRender from the PRIVATE app source
# repo and copies ONLY the production bundle into this public website repo.
#
# Usage:
#   ./update-browser-app.sh
#
# Layout this script assumes (the two repos sit side by side):
#   <parent>/
#   ├── ChemRenderWebsite/   <- this public repo (contains app/ = built bundle)
#   └── text-to-chem/        <- private app source repo (never committed here)
#
# It builds with VITE_BASE_PATH=./ (RELATIVE asset paths) so the bundle works no
# matter what subdirectory it is mounted under — e.g. a GitHub Pages project site
# at https://<user>.github.io/ChemRenderWebsite/app/. (Absolute /app/ paths would
# 404 there because the real base is /ChemRenderWebsite/.) Only the minified dist/
# output is copied — no source, no node_modules, no source maps.

set -euo pipefail

# 1. Resolve paths relative to THIS script, not the current shell directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_REPO="$(cd "$SCRIPT_DIR/.." && pwd)/text-to-chem"
DIST_DIR="$SOURCE_REPO/dist"
APP_DIR="$SCRIPT_DIR/app"

# 2 + 3. Verify the private source repo and its package.json exist.
if [ ! -d "$SOURCE_REPO" ]; then
  echo "error: app source repo not found at $SOURCE_REPO" >&2
  echo "       expected ../text-to-chem next to this website repo." >&2
  exit 1
fi

if [ ! -f "$SOURCE_REPO/package.json" ]; then
  echo "error: package.json not found in $SOURCE_REPO" >&2
  echo "       is that the correct app source repo?" >&2
  exit 1
fi

# 4. Build the browser bundle inside the source repo with relative asset paths.
echo "Building browser bundle in $SOURCE_REPO ..."
( cd "$SOURCE_REPO" && VITE_BASE_PATH=./ npm run build )

if [ ! -d "$DIST_DIR" ]; then
  echo "error: build did not produce $DIST_DIR" >&2
  exit 1
fi

# 5. Remove the old public bundle.
rm -rf "$APP_DIR"

# 6. Copy ONLY the production dist output into app/.
cp -R "$DIST_DIR" "$APP_DIR"

# 7. Confirm the entry point landed.
if [ ! -f "$APP_DIR/index.html" ]; then
  echo "error: $APP_DIR/index.html missing after copy" >&2
  exit 1
fi

# 8. Fail loudly if any source maps were copied (would leak source).
MAPS="$(find "$APP_DIR" -name '*.map' -print)"
if [ -n "$MAPS" ]; then
  echo "error: source maps found under app/ — refusing to publish:" >&2
  echo "$MAPS" >&2
  exit 1
fi

# 9. Done.
echo "✓ Browser app updated -> $APP_DIR"
echo "  Commit the app/ folder in this repo to publish it."
