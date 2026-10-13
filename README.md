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

## Run the tests

```sh
npm test
```

Runs the Playwright suite in headless Chromium. The test runner starts its own server, so `npm start` doesn't need to be running.

```sh
npm run typecheck
```

Type-checks the JavaScript with TypeScript (`checkJs`), without emitting files.
