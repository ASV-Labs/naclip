# Run an isolated native test

The browser preview needs no Hermes installation. These steps are for testing the experimental plugin in the **real Electron desktop** without installing it into your daily instance. A scoped macOS smoke test passed; broader native parity is still pending; the browser's revised roster/model menu is not itself a packaged native shell.

## Prerequisites

- A separate compatible Hermes Agent source checkout with the desktop plugin SDK, `host.revealPane`, focused-owner routing, theme API, and `display.*` Bot Screen support.
- That checkout's Python runtime/dependencies prepared using its upstream instructions. Do not point a first-run bootstrap at your production runtime.
- Node/npm versions required by that checkout; the source reviewed for this guide requires Node `^22.22.0`, `^24.11.0` or `>=26.0.0` for desktop development.
- Platform build requirements from [Hermes desktop BUILDING.md](https://github.com/NousResearch/hermes-agent/blob/main/apps/desktop/BUILDING.md), including Xcode Command Line Tools for macOS source builds.

Follow the checkout's [desktop development guide](https://github.com/NousResearch/hermes-agent/blob/main/apps/desktop/README.md). It may change between versions. Install npm workspace dependencies from the **Hermes repository root**, not only `apps/desktop`.

## 1. Choose separate paths

In a POSIX shell, starting from the NaCLip repository root:

```sh
tandem_repo="$PWD"
tandem_test="$tandem_repo/.local-test/native"
hermes_checkout="/absolute/path/to/your/separate/hermes-agent-checkout"
mkdir -p "$tandem_test/hermes-home/desktop-plugins/tandem"
mkdir -p "$tandem_test/electron-user-data" "$tandem_test/shared-auth" "$tandem_test/workspace"
cp "$tandem_repo/plugin.js" "$tandem_test/hermes-home/desktop-plugins/tandem/plugin.js"
```

Replace `hermes_checkout` before continuing. Keep this test home outside any existing Hermes home or `profiles/` directory. Do not symlink its configuration, session databases, memory, credentials or plugins back to production. Never run two independent backend writers against the same home.

These commands only stage NaCLip in the test home. They do not copy your existing agent identity, history, provider keys or schedules. Configure what the test needs explicitly in the test instance.

## 2. Prepare the independent checkout

Once its upstream Python setup is complete:

```sh
cd "$hermes_checkout"
npm ci
cd apps/desktop
```

This checkout must be independent of the source tree used by your daily Hermes. Preparation/build scripts write into the checkout, so merely using different runtime data directories does not protect a shared source tree from development changes.

## 3. Launch with scoped data and backend

```sh
env -u NODE_ENV -u HERMES_DESKTOP_REMOTE_URL -u HERMES_DESKTOP_REMOTE_TOKEN \
  -u HERMES_DESKTOP_HERMES \
  HERMES_HOME="$tandem_test/hermes-home" \
  HERMES_DESKTOP_USER_DATA_DIR="$tandem_test/electron-user-data" \
  HERMES_SHARED_AUTH_DIR="$tandem_test/shared-auth" \
  HERMES_DESKTOP_HERMES_ROOT="$hermes_checkout" \
  HERMES_DESKTOP_IGNORE_EXISTING=1 \
  HERMES_DESKTOP_ISOLATED_BACKEND=1 \
  HERMES_DESKTOP_APP_NAME="Hermes NaCLip Test" \
  HERMES_DESKTOP_CWD="$tandem_test/workspace" \
  npm run dev
```

The independent user-data directory gives Electron its own single-instance lock. `HERMES_HOME` scopes agent state. Shared-auth override scopes the supported shared token store. The explicit checkout pins the backend resolver; ignore-existing and isolated-backend settings avoid adopting an already-running backend. These are source-supported controls, not proof that your installed version implements them identically.

Use a clean shell without inherited provider credentials if the test should have no provider access. Isolation is not an OS security sandbox: the app still runs as your user. Do not enable schedules, host computer control or production connections for a first smoke test. A native app opened from your usual Dock icon still uses its usual environment and is not this test instance.

The upstream dev renderer uses loopback port 5174. If occupied, stop the identified other dev server or follow your checkout's port configuration; do not kill your daily Hermes to free it. The browser preview's port is 14327 and can remain open separately.

## Alternative: launch a prepared macOS app copy

Prepare a separate `.app` copy and an independent backend checkout with its own dependencies first. Do not redistribute your Hermes binary or local provider state with a widget pack. From the NaCLip repository:

```sh
python3 scripts/launch-isolated-mac.py \
  --app "/absolute/path/to/Hermes NaCLip Test.app" \
  --backend-root "/absolute/path/to/independent/hermes-agent" \
  --test-dir "/absolute/path/to/naclip-test" \
  --install-plugin
```

Add `--check` to validate paths without writing or launching. The launcher strips inherited provider keys and remote-backend overrides, stages NaCLip only in the test home, preserves a changed prior plugin as `plugin.js.previous`, and uses the scoped environment above. It does not download/build Hermes, create provider credentials or start a VM. Refusal of existing-home paths and symlinked data stores is deliberate. It requires Python 3 and a compatible prepared app; isolation is not an OS sandbox.

**Reopen with the launcher every time.** Opening the `.app` directly from Finder or the Dock does not carry these environment variables. The test window can still be titled Hermes despite the copy’s distinct filename. An already-running copy is left running; close it first to change launch paths. Normal Quit stops its dedicated backend on the tested build.

If an existing layout hides chat/editor panes, use Hermes’s **Reset layout** command. Save your preferred arrangement first; it resets pane placement. The smoke test needed this recovery after initial plugin adoption. Reset is not proof of layout compatibility with every Hermes release.

## 4. Enable NaCLip and configure the test

Open test-instance **Capabilities → Plugins**. Confirm NaCLip is discovered and enable it if required by your SDK version. Use the command palette's **Reload desktop plugins** if the plugin was copied after startup. Use the **Customize appearance** palette widget or **NaCLip: Customize appearance** command to choose a palette and widget treatment. Close appearance returns to the chat. Native Settings → Appearance → Theme also lists the saved palette. Duplicate-link preferences apply with the skin; Hermes may retain reserved navigation entries.

Configure providers and local model endpoints through native Settings. Connect only to test backends whose profile ownership you can verify. The plugin reveals native Bots; the Bots plugin itself must be available/enabled. Core model selection stays in Hermes's composer.

Plugin discovery may differ between SDK versions. If it is absent, check this test home's `desktop-plugins/tandem/plugin.js`, native plugin errors and desktop logs. Do not fix discovery by copying it into the production home.

## Acceptance checklist

- Verify the desktop log and active runtime paths point at the test home and independent checkout.
- Send a harmless prompt and obtain a real reply through a configured test provider.
- Test local, OpenAI, Anthropic and Grok model inventory/selection against actual endpoints; verify switching does not affect another chat or connection.
- Verify native Bots resolves each canonical Bot Chat correctly.
- Create a disposable native test session, archive it, find it in archives, restore it, then verify deletion through the native confirmation flow. Use the actual backend owner for every mutation.
- Verify all 18 Settings groups and subpages, including model fallback/auxiliary/Mixture of Agents and conditional local-model/billing pages. Check language, files, attachments, voice and terminal through native controls.
- Open Skills, Tools, Connectors and Plugins. Check real catalogs, native search/filter/sort, enable policies, Git/disk installation, custom MCP entry and authorization through the test instance. Compare [the feature audit](HERMES-PARITY.md).
- Inspect the cosmetic Capabilities search styling with focus, empty query and populated query. Ensure other fields and native events are unaffected. Extra Tools filters and the redesigned explorer are currently browser-only; do not count them as installed native features.
- Check rail tooltips, expanded labels, custom palettes/widget packs, persistence, reset and import/export on the real host. Draft a theme request with a real configured agent, review its returned JSON and import it.
- Follow [computer setup](COMPUTER-SANDBOX.md): confirm real screen frames, takeover/hand-back, profile/connection switching, reconnect and input/lease cleanup.
- Close the test app and dev server; verify your daily app and its data remain intact.

Native session lifecycle belongs to Hermes. Reviewed core APIs use owner-scoped PATCH for `archived` and owner-scoped DELETE for removal; keep native safeguards. Preview actions only mutate browser data and are not evidence that those live APIs passed.

## Stop and remove the test

Hand back and stop any test screen, close the test app, then Ctrl+C the dev server. Retain the isolated directory if you want to resume its conversations. Delete it manually only after deciding its test data is disposable. Disable/uninstall NaCLip in the test instance if needed; never clean up the production home as part of this procedure.

These instructions were checked against Hermes commit `54bc5e509c985f37265c3d416bd2c64b10fc77ba`. A separately copied macOS arm64 app and independent backend were launched and tested with plugin 0.4.0. See [the release audit](RELEASE-AUDIT.md) for passed and pending checks.
