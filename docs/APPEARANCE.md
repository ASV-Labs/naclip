# Customize NaCLip

NaCLip is an appearance and navigation layer over Hermes Desktop. It does not replace the agent backend, provider/model selection, profiles, session storage or tool policies. It has no ALSTEAD dependency or shared product configuration.

## Widget rail

The left icons are called widgets in NaCLip. Hover or focus one to see its name. The top arrow expands a narrow sidebar containing each icon and its label; Collapse sidebar returns to icons. Expansion is remembered locally. The chat roster contains chats and bots rather than a second list of the rail's destinations.

The browser prototype allocates space for the expanded sidebar on desktop/tablet and overlays it on mobile. Native SDK integration uses a top-layer label drawer because the reviewed public SDK has no pane-resize method. That native placement still needs real-host acceptance. Native sidebar preferences request hiding duplicate links; Hermes can retain reserved navigation entries such as Capabilities.

## Themes and custom colors

In the browser preview, open **Settings → Appearance**. In native Hermes, use the palette widget **Customize appearance** or the command palette’s **NaCLip: Customize appearance**. Native Settings → Appearance → Theme also lists the currently saved NaCLip palette. The separate editor keeps custom controls available on versions that hide the SDK extra slot on settings subpages. Choose Graphite, Ocean or Paper. Each has a light and dark palette; the sun/moon control switches modes.

For a custom palette:

1. Give the pack a name.
2. Choose Light or Dark under Editing palette.
3. Change background, sidebar, surface, text, secondary text, border and accent colors.
4. Apply appearance. Validation keeps text and secondary text at least 4.5:1 against all three reading surfaces.

Edits form a review draft until Apply appearance. Selecting a built-in theme applies its palette immediately. Reset appearance restores Graphite and the default widgets. It does not reset chat or agent configuration. NaCLip selects an SDK-contributed theme; it never patches the Hermes app bundle.

## Widget packs

Signal uses colored tiles; Outline uses quiet line icons; Mono follows the theme accent. Choose rounded, circle or square tile shapes.

Select a widget under Edit widget to rename it, change its icon/color, reorder it, or show/hide it. Settings always remains available. Apply appearance saves those edits. Built-in widget actions retain their native destinations even when their labels/icons change.

Add a custom widget for a prompt, supported Hermes page, or HTTP(S) website. Prompt widgets insert text into the current composer's draft for review; they do not automatically submit a message. Website widgets open only when clicked. This is a declarative launcher customization, not installation of arbitrary executable plugin code.

## Import and export

Open Import or export a pack. Export pack places the current pack's JSON in the text field. Copy JSON and save it as a `.json` file, or paste it into your own repository. Preview pack accepts pasted JSON or Choose pack file accepts a local `.json` file. It loads a review draft; inspect colors/widget changes and click Apply appearance to use it.

Examples:

- [Ocean appearance pack](../examples/naclip-ocean.json)
- [Ocean Focus widget pack](../examples/naclip-focus-widgets.json), including a Daily brief prompt widget

The versioned format is `naclip/appearance@1`. It carries a name, both palettes, widget style/shape and ordered widget definitions. It excludes providers, accounts, credentials, chat history and agent settings. Packs are limited to 50 KB and 20 widgets, use six-digit hex colors and approved icons/actions, and reject unknown fields, executable link schemes and links with embedded credentials. Optional custom widgets use `custom-` ids. Imported packs can change navigation labels or add prompts/links: review these before applying.

## Create a theme with your agent

Describe the desired look under Create with your agent, then choose Draft theme request. NaCLip adds a structured request and the current pack example to the current chat draft and opens that chat. Review/send it using Hermes's own composer and selected model. Ask the agent to return one appearance-pack JSON object, then import and review it above.

The preview demonstrates drafting and importing locally; it does not call an LLM or generate a real agent response. Native live generation, model-specific JSON quality and returned pack acceptance must be tested in the isolated instance. The current workflow supports user-reviewed import; it does not silently let an agent rewrite desktop plugins or automatically apply a reply.

## Persistence and compatibility

Appearance and rail expansion use plugin-scoped storage; preview data is browser-local. Existing chat storage is preserved. User-facing branding is NaCLip. Legacy `tandem` plugin ids, storage keys, classes and receipt identifiers remain internally for compatibility with the supplied source, not as a second product name. Disabling the native plugin drops its contributions; Hermes's original settings and navigation remain the recovery path.
