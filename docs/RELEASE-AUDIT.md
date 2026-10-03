# NaCLip 0.4.0 release audit

Audited October 2, 2026. This is an **experimental source release**, with a working browser simulation and a scoped native macOS smoke test. It is not full native parity acceptance or an Android/iOS application.

## Native test environment

Hermes Desktop macOS arm64, install stamp `54bc5e509c98`, corresponding source commit `54bc5e509c985f37265c3d416bd2c64b10fc77ba`. A separate app copy, independent backend snapshot/dependencies, Hermes home, Electron user data, shared-auth store and workspace were used. The daily Hermes process remained running; its source checkout remained clean. Test credentials and state are excluded from Git.

Compatibility is feature based: plugin SDK theme registration/request, contribution storage/disposal, titlebar/panes, `host.revealPane`, `host.openWorkspace`, owner-aware session/composer routing and optional `display.*` Bot Screen RPCs. Older builds may omit these seams. This is the tested baseline, not a guarantee for every upstream release. NaCLip does not patch the Hermes app bundle or backend.

## Observed results

| Check | Result |
| --- | --- |
| Native plugin discovery and mounting | Passed: NaCLip rail, dock, theme control, Bots access and computer notice loaded |
| Real chat | Passed: `grok-4.7` over native xAI OAuth returned a reply; backend recorded complete, one model call, zero tool turns |
| Model picker | Passed: native inventory offered Grok 4.7; main/default and chat picker showed it. Bundled xAI recommendation still defaulted to 4.6 |
| Theme application | Passed: Ocean and Paper applied in native host; light/dark switched through icon control |
| Widget treatment | Passed: Outline applied and persisted across restart |
| Appearance access and close | Passed: dedicated SDK workspace editor, explicit close and native-settings link |
| Session archive/restore | Passed: test chat disappeared, appeared in native archives and restored with messages |
| Session delete safeguard | Passed: native confirmation opened and Cancel retained the chat. Permanent native deletion was not executed |
| Capabilities | Passed: Skills, Tools, Connectors and Plugins loaded; `browser_back` search filtered the native Tools list; connector directory showed 65 entries |
| Plugin disable/re-enable | Passed: skin contributions disappeared, core navigation returned, re-enable restored the skin |
| Hot reload and restart | Passed: updated plugin loaded; own appearance pane disposed on reload; scoped launcher reopened independent runtime with saved appearance |
| Computer screen | Correctly showed unsupported/unconfigured state; no Docker image or live RFB stream tested |
| Git entry | Root `plugin.js` matches Hermes installer discovery; SDK admission scanner returned no findings |

The live provider test used Grok 4.7. OpenAI, Anthropic, Gemini and local-model reply tests remain pending. Native connector authorization, installation of third-party plugins, voice, agent-driven file operations, real multi-gateway switching and agent-generated pack import remain pending. Browser demonstrations do not satisfy those checks.

## Repairs from this audit

- Moved the desktop entry to root `plugin.js`; Hermes Git installation does not discover the previous nested `tandem/plugin.js` layout.
- Added a direct appearance editor because this Hermes build renders its plugin appearance extra slot only on an unsplit settings page while navigation selects subpages.
- Scoped CSS lifetime to plugin registration/disposal so opening core Settings does not remove the skin’s styles.
- Added SDK icon fallbacks where native Hermes does not export the preview’s `Bot` icon.
- Repaired user-message and computer-notice contrast in native light mode.
- Added a clean-environment launcher with isolated path/symlink checks and five tests.

Initial pane adoption left workspace panes overlapping. Hermes’s **Reset layout** command restored visible chat/editor/computer/dock placement. The saved arrangement persisted through restart. This recovery resets pane arrangement and is documented in setup; initial layout compatibility across other Hermes versions remains a release limitation.

## Local checks and release boundary

Seven preview tests, five launcher tests, routing checks, appearance validation and production build passed. The dependency audit reported zero vulnerabilities at the audit date. A clean local checkout reproduced the checks, and [the first public GitHub Actions run](https://github.com/ASV-Labs/naclip/actions/runs/37084298876) passed on Ubuntu with Node 24. An unauthenticated public clone contained the exact root plugin entry and excluded test/auth directories; the native Git-install dialog itself remains untested. Preview interactions were inspected at desktop, tablet and mobile widths; no horizontal document overflow was observed in earlier complete viewport checks. Native changes were inspected in the actual macOS window.

The redesigned capability explorer and extra Tools filters are still browser-only; native Hermes retains its own capability pages. The skin’s native search improvement is cosmetic. Mobile browser support is not a packaged mobile client.

The local design rubric remains **3.65/5, below its 4.0 acceptance threshold**. The static design verifier also reports limitations scanning this React source/dist setup. Publication is an experimental owner-requested release; no formal design pass, full native parity, or live Docker acceptance is claimed.

## 0.4.1 usability patch

Agent’s computer now opens a closeable main workspace using `host.openWorkspace`, rather than silently re-revealing its existing side pane. Native checks opened it from Artifacts and Capabilities, repeated the shortcut without creating a second tab, and closed it back to the prior route. The main tab temporarily replaces the side pane’s viewer to avoid competing screen/control state. Older SDKs receive explicit fallback guidance. The isolated profile correctly remains unsupported/unconfigured for a live computer sandbox; this patch does not configure Docker or prove an RFB session.

Appearance now has a persistent header and a labeled top-right X (44×44px). Native scrolling and closure passed. The browser adapter renders the actual plugin workspace rather than redirecting the palette shortcut to a different settings screen. Desktop 1440×1000, tablet 834×1112 and mobile 390×844 checks passed for computer open/close, keyboard appearance closure, persistent X after form scrolling and absence of document overflow. A React list-key warning in the rail was also corrected. Native core Settings is its own full-screen overlay and retains its own close control.

Regression check: `node tandem/scripts/check-workspaces.mjs` covers modern main-workspace navigation, close disposal, stable tab identity and explicit legacy SDK fallback. Existing checks and SDK admission were rerun. The daily Hermes home and configuration were not modified. The existing formal composition evaluation remains below its design acceptance threshold; this functional patch does not change that verdict.

## Documentation and disposable workspace follow-up

The October 2 homepage refresh adds labeled captures of the browser preview, native appearance editor and actual native terminal. A disposable native workspace contained `README.md`, `hello.py` and `notes/release-checklist.md`. Hermes’s Files pane listed the files and opened the README in its native editor. A real native zsh shell executed `ls` and `python3 hello.py`; output matched the sample script. No provider or production-home configuration was changed.

The initial blank terminal was recovered with **Layout editor → Advanced → Terminal deck → Done**, which mounted the native terminal and created its zsh session. Reset layout subsequently restored plugin placement. A later blank appearance body after pane rearrangement recovered through **Reload window**. These are host layout/renderer recoveries on this test build, not fixes to the Hermes backend or proof that every layout is compatible. The README documents the recovery and the native Git-install dialog remains untested.
