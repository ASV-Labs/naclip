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

## Social cards

`social-preview.json` records the canonical URL, share copy, image dimensions, provenance and hash. Re-render the bounded metadata block and validate without executing website JavaScript:

```sh
python3 landing/scripts/social-preview.py --render
python3 landing/scripts/social-preview.py --deployed --output .local-test/social-preview-live.json
```

The commands run from the repository root. CI validates the emitted metadata and image bytes. Deployed checks read the canonical as a normal client, Twitterbot and Meta crawler user agents, then fetch the exact versioned image. They do not publish posts or prove a platform's cached composer preview.

Authoring source: `social/card.html`. Serve landing/ locally and export at a 1200×630 viewport for the link card. For portrait exports, use a 1080×1000 viewport with `?format=post` or `?format=story`, then a full-page screenshot for the exact 1080×1350 / 1080×1920 canvas. These files are authoring inputs and are not uploaded as site routes.

[Sharing guide and Instagram artwork](../docs/SOCIAL-SHARING.md).
