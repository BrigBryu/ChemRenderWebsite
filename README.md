# ChemRender Website

Static GitHub Pages site for the ChemRender product.

## Changelog

`../text-to-chem/CHANGELOG.md` is the source of truth for the public changelog.
After editing it, run:

```sh
node scripts/sync-changelog.mjs
```

This regenerates `changelog.html`, which should be committed with the website.
`./update-browser-app.sh` also refreshes the changelog after rebuilding the
browser app.

## Browser version (`app/`)

`app/` holds the **built** browser version of ChemRender — the minified
production bundle only, never the source. The app source lives in a separate
private repo (`../text-to-chem/`).

To refresh it after changing the app, run:

```sh
./update-browser-app.sh
```

This rebuilds the bundle in `../text-to-chem` with `VITE_BASE_PATH=./` (relative
asset paths, so it works under the `/ChemRenderWebsite/` GitHub Pages subdirectory)
and copies only the production output into `app/`. It refuses to publish if any
source maps are found. Then commit the updated `app/` folder to deploy.
