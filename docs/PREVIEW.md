# Browser preview

Install Node.js 22.22 or newer within a version supported by your Hermes checkout if you also plan native development. The preview itself supports Node 20.19 or 22.12 and newer per Vite's engine requirements. From the NaCLip repository root:

```sh
cd localhost-preview
npm ci
npm run dev
```

Open [http://127.0.0.1:14327/](http://127.0.0.1:14327/). Keep that terminal running; Ctrl+C stops the server. It binds only to loopback and refuses to take another port if 14327 is occupied.

The preview contains sample Local, OpenAI, Grok, Anthropic and Gemini workspaces. Its models are sample catalog entries, not discovered accounts or installed models. Messages get local simulated replies. Files can open a native macOS folder chooser and preview real workspace text files after permission. Terminal starts a real interactive shell only after a separate **Enable local terminal** action. Attachment controls retain filenames and voice does not activate a microphone. “Start computer” paints a simulated screen; it does not start Docker. See [local Files and Terminal setup](LOCAL-WORKSPACE.md) for prerequisites, access limits, and stopping access.

### Explore capabilities and settings

Capabilities includes Skills, Tools, Connectors and Plugins. Search names/descriptions (or individual tool names), combine category/source/status filters, sort results and inspect details. The connector directory contains 65 public catalog entries; other tabs use representative samples. Toggles and Add/Remove are scoped browser demonstrations, not native installations or authorizations. Mobile filters expand on demand.

The searchable settings tree includes all 18 native groups and their subpages. Providers includes Anthropic and other major cloud/local examples; Gateways manages sample instances; Connectors holds app/MCP integrations. See [the Hermes feature audit](HERMES-PARITY.md) for coverage and the current integration boundary.

### Manage chats

Each session row has a **…** button:

- **Archive chat** removes it from Chats and keeps its draft, messages, attachments and model choice.
- **Archived** beside the Chats heading opens the archive for the current instance/profile.
- **Restore chat** returns it to Chats.
- **Delete chat…** opens a confirmation with the chat's workspace and profile. Cancel keeps it; Archive instead preserves it; Delete chat removes its local content permanently.

Bot chats are canonical conversations and do not expose regular-session deletion controls. The preview stores chat content and archive state in this browser's local storage under `tandem-preview:chats:v1`. Reloading retains them; clearing site data removes them. Do not enter secrets into this demonstration. These controls never archive or delete your real Hermes conversations.


The expanded roster and capability explorer are browser prototypes. Native Hermes retains its own session, model and capability controls. See [native installation](../README.md#install-in-hermes-desktop) and [verification notes](RELEASE-AUDIT.md).
