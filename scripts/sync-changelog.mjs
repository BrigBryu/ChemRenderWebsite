#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const sourcePath = path.resolve(siteDir, "..", "text-to-chem", "CHANGELOG.md");
const outputPath = path.join(siteDir, "changelog.html");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInline(value) {
  const parts = value.split(/(`[^`]+`)/g);

  return parts
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }

      return escapeHtml(part);
    })
    .join("");
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let listOpen = false;
  let entryOpen = false;

  function closeList() {
    if (!listOpen) return;
    html.push("        </ul>");
    listOpen = false;
  }

  function closeEntry() {
    closeList();
    if (!entryOpen) return;
    html.push("      </section>");
    entryOpen = false;
  }

  for (const line of lines) {
    if (line.startsWith("# ")) continue;

    if (line.startsWith("## ")) {
      closeEntry();
      entryOpen = true;
      html.push('      <section class="doc-section changelog-entry">');
      html.push(`        <h2 class="doc-h2">${renderInline(line.slice(3).trim())}</h2>`);
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      html.push(`        <h3 class="changelog-subhead">${renderInline(line.slice(4).trim())}</h3>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!listOpen) {
        html.push('        <ul class="doc-list changelog-list">');
        listOpen = true;
      }
      html.push(`          <li>${renderInline(line.slice(2).trim())}</li>`);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      continue;
    }

    closeList();
    html.push(`        <p>${renderInline(line.trim())}</p>`);
  }

  closeEntry();
  return html.join("\n");
}

function renderPage(changelogHtml) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#282828" />
    <meta
      name="description"
      content="ChemRender changelog: product history, new features, fixes, and release notes for the organic chemistry study card renderer."
    />
    <title>Changelog - ChemRender</title>
    <link rel="icon" href="./assets/icon.svg" type="image/svg+xml" />
    <link rel="icon" href="./assets/icon.png" type="image/png" sizes="512x512" />
    <link rel="apple-touch-icon" href="./assets/icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="./index.html" aria-label="ChemRender home">
        <img src="./assets/logo.png" alt="" width="42" height="31" />
        <span>ChemRender</span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        <a href="./index.html#how">How it works</a>
        <a href="./index.html#features">Features</a>
        <a href="./index.html#download">Download</a>
        <a href="./index.html#tutorials">Tutorials</a>
        <a href="./changelog.html" aria-current="page">Changelog</a>
      </nav>
    </header>

    <main id="top" class="doc">
      <p class="doc-back"><a href="./index.html">&larr; Home</a></p>
      <p class="eyebrow">Product history</p>
      <h1 class="doc-title">ChemRender changelog</h1>
      <p class="lede">
        A running history of notable ChemRender updates, generated from the app changelog.
      </p>

${changelogHtml}
    </main>

    <footer class="site-footer">
      <p>ChemRender is a free organic chemistry study renderer. Bring your own AI model.</p>
      <p class="footer-links">
        <a href="mailto:bridger.brundy@gmail.com?subject=ChemRender%20issue">Report an issue or contact me</a>
        <span aria-hidden="true">&middot;</span>
        <a href="./index.html">Home</a>
      </p>
    </footer>
    <script src="./analytics.js" defer></script>
  </body>
</html>
`;
}

const markdown = await readFile(sourcePath, "utf8");
const changelogHtml = renderMarkdown(markdown);

await writeFile(outputPath, renderPage(changelogHtml), "utf8");
console.log(`Synced changelog -> ${path.relative(siteDir, outputPath)}`);
