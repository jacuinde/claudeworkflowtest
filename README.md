# Links

A single-page links site in plain HTML, CSS, and JavaScript (no framework).

## Setup

```sh
npm install
npx playwright install chromium
```

On WSL or a minimal Linux install, Chromium may also need system libraries. If the tests fail to launch the browser, install the ones it reports missing. On Ubuntu 26.04 that was:

```sh
sudo apt install libnss3 libnspr4
```

## Open the page

```sh
npm start
```

This serves the site at http://localhost:4173 and opens it in your browser. Serve it rather than opening `index.html` directly from disk, since later features load data files that browsers block over `file://`.

## Edit the links

Links live in `links.json`, a JSON array of `{ "label", "url" }` objects. The page shows them in file order; add, remove, or reorder entries there with no HTML changes. An empty array (or a blank file) shows a "No links yet" message. If the file is missing or isn't valid JSON, the page shows "Couldn't load links." and logs the cause to the browser console.

## Search

The search box above the list filters links as you type. A link stays visible if its label or URL contains the search text, ignoring case and surrounding spaces. Clearing the box shows every link again; if nothing matches, the page says "No matches."

## Theme

The page follows your operating system's light/dark setting until you press the **Dark theme** button in the header. Your choice is saved in the browser (`localStorage`) and wins over the OS setting on later visits. Both themes meet the WCAG AA contrast ratio for text (4.5:1), which the tests check.

## Run the tests

```sh
npm test
```

Runs the Playwright suite in headless Chromium. The test runner starts its own server, so `npm start` doesn't need to be running.

```sh
npm run typecheck
```

Type-checks the JavaScript with TypeScript (`checkJs`), without emitting files.
