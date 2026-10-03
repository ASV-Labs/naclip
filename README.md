# NaCLip for Hermes Desktop

[![Checks](https://github.com/ASV-Labs/naclip/actions/workflows/checks.yml/badge.svg)](https://github.com/ASV-Labs/naclip/actions/workflows/checks.yml)

A customizable skin for working alongside your Hermes agent: Sessions and Bots, instance/profile access, a composer model picker, light/dark controls, and an agent-computer pane.

**Status: development preview and experimental desktop plugin.** The browser preview is working with simulated services. The native plugin has passed a scoped macOS integration smoke test, including a real Grok 4.7 reply. Full native parity and Docker screen acceptance remain pending. This repository does not ship a standalone Hermes application or a preconfigured virtual machine.

## Choose how to try it

| Mode | Requirements | What it changes |
| --- | --- | --- |
| Browser preview | Node.js and npm | Local browser data only; no Hermes installation, API keys, Docker or models needed |
| Isolated native test | Compatible Hermes Desktop source/runtime plus separate app-data and Hermes-home directories | A separate test instance with independent state and backend; broader acceptance remains pending |
| Plugin in an existing Hermes | Compatible desktop plugin SDK | Adds NaCLip to that instance; theme/sidebar choices can affect its interface |
| Live Docker-backed computer | Native Hermes backend with Bot Screen support, running Docker engine, desktop sandbox image | Creates an agent desktop in a container on the backend host |

A VM does not inherently require Docker. **The Docker sandbox path does.** On macOS and Windows, Docker Desktop is a straightforward way to provide the Linux engine/VM. If Hermes connects to a remote Linux backend, Docker belongs on that backend when it uses Docker; the desktop client does not need Docker just to view the stream. A Linux gateway can also provide a Bot Screen directly without Docker. See [computer sandbox setup](docs/COMPUTER-SANDBOX.md).

## Quick start: browser preview

Install Node.js 22.22 or newer within a version supported by your Hermes checkout if you also plan native development. The preview itself supports Node 20.19 or 22.12 and newer per Vite's engine requirements. From this repository:

```sh
cd localhost-preview
npm ci
npm run dev
```

Open [http://127.0.0.1:14327/](http://127.0.0.1:14327/). Keep that terminal running; Ctrl+C stops the server. It binds only to loopback and refuses to take another port if 14327 is occupied.

The preview contains sample Local, OpenAI, Grok, Anthropic and Gemini workspaces. Its models are sample catalog entries, not discovered accounts or installed models. Messages get local simulated replies. Files show examples, attachment controls retain filenames, voice does not activate a microphone, and terminal commands do not execute. “Start computer” paints a simulated screen; it does not start Docker.

### Explore capabilities and settings

Capabilities includes Skills, Tools, Connectors and Plugins. Search names/descriptions (or individual tool names), combine category/source/status filters, sort results and inspect details. The connector directory contains 65 public catalog entries; other tabs use representative samples. Toggles and Add/Remove are scoped browser demonstrations, not native installations or authorizations. Mobile filters expand on demand.

The searchable settings tree includes all 18 native groups and their subpages. Providers includes Anthropic and other major cloud/local examples; Gateways manages sample instances; Connectors holds app/MCP integrations. See [the Hermes feature audit](docs/HERMES-PARITY.md) for coverage and the current integration boundary.

### Manage chats

Each session row has a **…** button:

- **Archive chat** removes it from Chats and keeps its draft, messages, attachments and model choice.
- **Archived** beside the Chats heading opens the archive for the current instance/profile.
- **Restore chat** returns it to Chats.
- **Delete chat…** opens a confirmation with the chat's workspace and profile. Cancel keeps it; Archive instead preserves it; Delete chat removes its local content permanently.

Bot chats are canonical conversations and do not expose regular-session deletion controls. The preview stores chat content and archive state in this browser's local storage under `tandem-preview:chats:v1`. Reloading retains them; clearing site data removes them. Do not enter secrets into this demonstration. These controls never archive or delete your real Hermes conversations.

## Personalize the skin

See [Appearance and widget packs](docs/APPEARANCE.md) for hover labels, expanded navigation, Graphite/Ocean/Paper light and dark palettes, custom colors/icons, widget ordering/visibility, custom prompt/page/link widgets and JSON import/export. Draft a theme request to your current agent, then review/import its returned pack. The browser preview simulates messaging; native request drafting is available; agent-generated pack acceptance remains to be verified.

## Native test and installation

Use [the isolated native test guide](docs/NATIVE-TEST.md) before installing into your daily instance. Separate Electron user data alone is not the whole isolation boundary: give the test its own `HERMES_HOME`, provider configuration, and backend context as well.

The revised runtime plugin is [`plugin.js`](plugin.js). It uses the Hermes plugin SDK, reveals the native Bots pane, opens existing profiles/settings/capabilities routes, and uses native theme controls. The native core still owns sessions, provider/model switching, language settings, attachments, voice and terminals. The expanded browser roster is a prototype, not an installed replacement of those native components.

[Native acceptance checklist](docs/NATIVE-TEST.md#acceptance-checklist) includes real session archive/delete, actual provider inventories, multiple connection ownership, stream reconnect and lease cleanup. Local build success is not native acceptance.

## Install as a Hermes Desktop plugin

In a compatible Hermes Desktop, open **Capabilities → Plugins → Install from Git** and enter `https://github.com/ASV-Labs/naclip`. Enable **NaCLip**. The root `plugin.js` is the installable desktop entry; no preview build is needed. Try the isolated test first, because installing in your daily instance changes that instance’s appearance.

Use **Customize appearance** (the palette widget above Settings) or the command **NaCLip: Customize appearance** for theme and widget editing. The pane has a persistent top-right **X** and a link to native Hermes appearance settings. **Agent’s computer** opens a closeable main workspace, including from Capabilities. Core Settings retains its own close control.

If panes are missing or overlap after first installation, use the command palette’s **Reset layout**. This resets your pane arrangement, so record a layout you want to retain before using it. Native pane placement is managed by Hermes.

Disable NaCLip from Capabilities → Plugins to restore core navigation. Select a core theme in Settings → Appearance → Theme if needed. The internal plugin ID remains `tandem` for storage compatibility; remove or disable an older Tandem installation before installing this repository to avoid duplicate IDs. See [native setup and recovery](docs/NATIVE-TEST.md) and [the release audit](docs/RELEASE-AUDIT.md).

## Computer sandbox and providers

Follow [computer sandbox setup](docs/COMPUTER-SANDBOX.md) for Docker installation, profile configuration, image selection, readiness checks and troubleshooting. Configure OpenAI, Grok or a local compatible endpoint through the native Hermes settings in the **test instance**. Set provider credentials locally. Local LLM inference is separate from the computer container and does not inherently require Docker.

## Development checks

```sh
cd localhost-preview
npm test
npm run build
node ../tandem/scripts/check-routing.mjs
node ../tandem/scripts/check-appearance.mjs
cd ..
PYTHONDONTWRITEBYTECODE=1 python3 scripts/test-launcher.py
```

Seven preview tests cover catalog filtering, settings routes, archive recovery, deletion after persistence, instance/profile isolation and canonical-bot protection. Routing checks reject ambiguous focused owners and unavailable routes. Appearance checks validate all palettes and pack round trips, and reject unsafe/unreadable definitions. Five launcher tests cover isolated paths, credential environment exclusion and symlink rejection. See [validation status](docs/VALIDATION.md) for the observed boundary.

## Repository layout

```text
plugin.js                         Native runtime plugin entry
tandem/scripts/check-routing.mjs  Owner-routing checks
scripts/launch-isolated-mac.py    Prepared macOS test-app launcher
localhost-preview/               Runnable React/Vite interface simulation
docs/                            Native testing, sandbox setup and validation
examples/docker-sandbox.yaml     Configuration fragment; no credentials
```

The supplied source archive, nested source checkout, dependencies, test data, local review packets and screenshots are ignored by Git. Account configuration, authentication tokens, conversations and Hermes app binaries are excluded from this repository. Android and iOS clients are a separate future project.

## License

MIT, retaining the original ASV Labs copyright; see [LICENSE](LICENSE). See [third-party notices](THIRD-PARTY-NOTICES.md) for upstream connector metadata. This project is not affiliated with Nous Research. Hermes and Docker retain their own licenses and requirements.
