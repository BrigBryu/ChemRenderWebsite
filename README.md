# ChemRender Website

Static GitHub Pages site for the ChemRender product.

## Browser version (`app/`)

`app/` holds the **built** browser version of ChemRender — the minified
production bundle only, never the source. The app source lives in a separate
private repo (`../text-to-chem/`).

To refresh it after changing the app, run:

```sh
./update-browser-app.sh
```

This rebuilds the bundle in `../text-to-chem` with `VITE_BASE_PATH=/app/` (so it
works on GitHub Pages as a subdirectory) and copies only the production output
into `app/`. It refuses to publish if any source maps are found. Then commit the
updated `app/` folder to deploy.
