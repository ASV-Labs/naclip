# NaCLip website

Static landing page at [asv-labs.github.io/naclip](https://asv-labs.github.io/naclip/), adapted from the HTML supplied for this project. The GitHub repository retains the installation guide and real native/preview screenshots.

## Run locally

From the repository root:

```sh
python3 -m http.server 14328 --bind 127.0.0.1 --directory landing
```

Open http://127.0.0.1:14328/. No build is needed to serve the checked-in CSS. Stop with Ctrl+C. The page makes no model calls and does not access local files, credentials or Hermes state.

## Edit styles

```sh
npm exec --yes --package=tailwindcss@3.4.19 -- tailwindcss --config landing/tailwind.config.cjs -i landing/input.css -o landing/styles.css --minify
node --check landing/script.js
```

Navigation links point directly to the repository and source documents. The two scenes work with their buttons, wheel, Arrow keys or Page Up/Down. Pause stops decorative video playback. OS reduced motion starts paused and skips the curtain reveal. `?motion=off` also starts with motion disabled; Play is an explicit opt-in. Content and install links do not depend on video or application JavaScript.

## Publish

`.github/workflows/pages.yml` uploads only index.html, styles.css, script.js and the two credited logo assets. Design notes stay in Git, outside the published bundle. Full gate receipts remain local and ignored. Changes to landing/ on main redeploy through GitHub Pages.

The original external decorative videos remain hosted at their supplied URLs. Text and navigation work if those assets are unavailable. Logos and their owner credits are documented in [third-party notices](../THIRD-PARTY-NOTICES.md).

[Design note](design-notes.md) · [Visual review](wdi-011-score-sheet.md)
