# Hermes feature audit and overlay boundary

NaCLip is an appearance plugin. Hermes owns the agent, sessions, models, provider credentials, gateways, tools, skills, connectors and plugins. The plugin contributes theme tokens, navigation widgets and appearance settings through the desktop SDK. It opens existing core routes; it does not replace core configuration or implement a second agent backend.

## Audit evidence

On October 2, 2026, the running macOS Hermes Desktop was inspected read-only. Settings and all four Capabilities tabs were opened; no provider/model changes, tool toggles, installations, credential entry or session mutations were performed. The native window was returned to Plugins. Labels and route parameters were also checked against the corresponding desktop source, including `app/settings`, `app/capabilities`, the SDK and public connector manifests. This is a feature inventory, not a live test of NaCLip installed in that app.

The localhost harness mirrors this navigation and demonstrates the proposed layout. It does not load private account configuration. Native pages keep their own controls and available catalogs when reached through the SDK plugin.

## Complete settings navigation

| Native group | Included pages |
| --- | --- |
| Model | Main model, Fallback models, Auxiliary models, Mixture of Agents |
| Chat | Behavior, Attachments |
| Appearance | General, Theme, Typography, Window & layout, Chat display, Pet |
| Workspace | Projects & discovery, Shell environment, Files & execution |
| Safety | Approvals, Privacy & network, Checkpoints |
| Browser | Browser profile, Local & private URLs |
| Passwords & Logins | Saved credentials, Password managers |
| Memory & Context | Persistent memory, Context & compression |
| Voice | Voice conversation, Speech to text, Text to speech |
| Advanced | Desktop & startup, Agent limits, Tool access, Terminal backend, Subagents, Output limits |
| Notifications | Desktop alerts, Sounds |
| Billing | Overview, Plans when available |
| Providers | Accounts, API keys, Custom Endpoints, Local Models when available |
| Gateways | This window, Saved connections, Remote updates |
| Keyboard Shortcuts | Key bindings, HUD gesture, Screen capture |
| Tools & Keys | Tools, Settings |
| Sessions | Archive & retention, Default project folder |
| About | Version & updates, Uninstall |

The localhost settings menu is searchable and has a grouped page selector on mobile. Nonappearance pages show native descriptions and clearly identify operations that remain native. Model fallback, auxiliary and Mixture of Agents pages do not change the current chat model. The sample chat picker is available on Main model and in the composer.

Core deep links retain their native parameters: `page`, `pview`, `kview` and `bview`. The older Connections link resolves to Gateways. Local-model management and billing Plans can depend on native launch flags, account access and version.

## Capabilities

| Tab | Native functions preserved | Localhost demonstration |
| --- | --- | --- |
| Skills | Discovery, installed/built-in/optional sources, category filters, skill details, install and enable policies | Representative samples, text/category/source/status search, detail view and browser-local toggles |
| Tools | Native tool search, usage sorting, tool names, enable policies, bulk actions and tool configuration | 27 representative groups with name/description/tool-name search, category/source/status filters, sort and inspector |
| Connectors | Native catalog, add-your-own MCP, installation, authorization and live status | Public metadata for 65 connector entries, search/filters, transport/authentication labels; Add/Remove only changes preview state |
| Plugins | Native discovery, sources/categories, Git/disk install, rescan, plugin settings and enabled state | Representative plugin rows with search/filters and sample toggles |

Preview counts describe fixtures, not installed features. Enabled flags are sample choices. Tool names are representative, not an exhaustive native tool inventory. Preview toggles persist per instance, bot and tab in `naclip-preview:capabilities:v1`; they never invoke installation, authorization or backend policy changes.

The runtime plugin improves the visibility and focus treatment of the existing native Capabilities search field. The new category/status Tools filters and list/inspector layout are currently implemented in the localhost harness. The SDK does not expose a Tools filter replacement API, and this revision does not patch Hermes core to install that layout. Native integration of those additions remains unverified and requires a supported extension seam. Native Capabilities is also retained as the plugin recovery path.

## Providers, Gateways and Connectors

**Providers** choose who runs a model. The preview directory includes Anthropic, OpenAI, Google Gemini, Grok/xAI, Nous Portal, OpenRouter, DeepSeek, Mistral, Groq, Fireworks AI, Together AI, Cerebras, MiniMax, Moonshot/Kimi, Z.ai, NVIDIA, Hugging Face, Azure OpenAI, Amazon Bedrock, Local LLM, Ollama, LM Studio and a custom endpoint. These are examples, not a claim that a user's account supports every provider or has installed every runtime. Native Hermes supplies the actual model inventory and sign-in/key flows.

**Gateways** are the local/SSH/URL/cloud Hermes backends used by a window. The browser has five sample workspaces: Local, OpenAI, Grok, Anthropic and Gemini. Each has independent sample chats and selections; workspace names are illustrative, not a requirement for one gateway per provider.

**Connectors** expose external applications through MCP. Anthropic belongs in Providers; app integrations such as Airtable, GitHub, Notion and Slack belong in Connectors. Connector fixture metadata is derived from Hermes's public optional-MCP manifests. It contains names, descriptions, category labels and transport/auth types, without credentials, tokens or private settings. Nous Research's MIT notice is retained in [third-party notices](../THIRD-PARTY-NOTICES.md).

## Before native acceptance

Follow [the isolated native test guide](NATIVE-TEST.md). Verify every settings group, conditional pages, all four Capabilities tabs, actual catalogs and native operations in an independent test home. Browser layout checks and unit tests do not demonstrate native parity. A subsequent isolated macOS smoke test changed only its dedicated test state and selected Grok 4.7 there; the daily app and source were left intact. See [release audit](RELEASE-AUDIT.md).
