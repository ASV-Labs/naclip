# Validation status

This project distinguishes preview functionality from native integration.

| Surface | Evidence | State |
| --- | --- | --- |
| React/Vite preview | Production bundle builds | Offline verified |
| Local Files/Terminal companion | Real macOS folder chooser, file reads/navigation, real PTY output and directory changes; origin/path/revocation tests | Offline and local macOS browser verified; development server only |
| Instance/profile/chat state | Local switching checks; owner-isolation lifecycle tests | Local simulation verified |
| Archive/restore/delete | Four tests; browser archive/reload/restore/draft recovery, cancel, and disposable chat deletion/reload | Offline and local browser verified |
| Computer routing | Rejects ambiguous/missing owners and registry errors | Offline verified |
| Themes and widget packs | Three light/dark palettes; schema, contrast and action rejection tests; browser editing/import/export/reset/persistence | Offline and local browser verified |
| Widget navigation and agent requests | Named rail, custom prompt insertion, structured theme request in composer | Local simulation verified; native request drafting available; generated pack acceptance pending |
| RFB view/takeover | Simulated running and failed stream checks | Local simulation verified |
| Providers, Bots and core settings | Running native settings/capabilities audited read-only; all 18 groups mapped | Scoped native tests passed; see release audit |
| Capability explorer and settings routes | Three catalog/route tests plus browser search, filters, empty/reset, scoped toggle persistence and navigation | Offline and local simulation verified; redesigned explorer not installed natively |
| Docker image/VM | Configuration and setup paths checked against source | No live image pull or sandbox test |
| Native standalone instance | Separate macOS app and backend launched, quit and reopened with scoped launcher | Scoped native test passed |

The browser roster is a prototype. Installing the runtime plugin does not automatically install that custom roster as a native core replacement. Native Hermes retains its existing session management and guarded model/provider controls. The public source release is experimental. Full native acceptance requires the remaining checklist and actual Docker-image validation.

The supplied appearance is retained for review. The local design evaluation remains below its acceptance threshold; functional local checks do not constitute formal design or native acceptance.

Row menus and delete confirmation were inspected at desktop 1440×1000, tablet 834×1112 and mobile 390×844. Document width matched viewport width; mobile roster actions remained accessible; no warning/error console entries were observed in the final test tab. Delete browser testing used a disposable chat created for that test, not a real Hermes conversation.

Revision 4 inspected Appearance and widget controls at the same three viewport sizes without document overflow. Expanded rail height updates on resize; keyboard Enter expands and Escape collapses with focus restored. Ocean/Outline and custom widget/icon selections survived reload. A changed accent reached the rendered palette. Pack import, invalid-format rejection, reset, prompt widgets and agent theme draft insertion were operated locally. Agent generation and actual link opening remain pending. Revision 6 subsequently tested native theme/editor lifecycle; see release audit.

Revision 5 audited the running native Settings and Skills/Tools/Connectors/Plugins read-only. The browser capability list, inspector and settings navigation were inspected at desktop 1440×1000, tablet 834×1112 and mobile 390×844, with no document horizontal overflow. Search matched individual tool names and connector descriptions; category/source/status filters combined, empty results reset, and per-instance sample toggles survived reload without affecting another instance. Mobile filters expand on demand; list/detail navigation has an explicit back action. Anthropic provider search, all 18 settings groups and fallback deep links were checked. No warning/error console entries were observed in the final test tab. The native app was returned to its original Plugins screen; no native settings were applied.

Revision 5.1 adds Close settings in the persistent workspace header. Browser checks verified desktop and mobile closure returns to the current chat and preserves its draft. The control remains visible at 390px; the production build passes.

Revision 6 launched plugin 0.4.0 in an isolated native macOS arm64 Hermes copy. A real Grok 4.7 reply, archive/restore, delete cancellation, native tool search, four capability tabs, Ocean/Paper theme application, light/dark, Outline persistence, appearance closure, hot reload and disable/re-enable were checked. Native light-mode contrast and stylesheet lifetime defects were repaired. The launcher has five isolation tests. [Release audit](RELEASE-AUDIT.md) records compatibility, layout recovery and remaining gaps.

Revision 7 (0.4.1) verifies the computer main-workspace shortcut and persistent top-right appearance X in the isolated native test app and at all three browser viewport classes. Run `node tandem/scripts/check-workspaces.mjs` for navigation regression coverage. See the release audit for native evidence and the unconfigured computer sandbox boundary.

Revision 8 replaces the browser Files and Terminal placeholders with an optional Mac companion. Native folder selection and Cancel were operated through the real NSOpenPanel. A disposable workspace was listed, its text file read, and a subfolder entered. The xterm panel executed real `printf` and `pwd` commands and retained `cd` within a shell. Closing the panel required enabling a fresh terminal; Disconnect removed the selected folder and reload showed no grant. Files and Terminal were inspected at desktop 1440×1000, tablet 834×1112 and mobile 390×844, with no horizontal document overflow. Panel headers preserve a 44px X outside scrolling contents. The final test tab had no warning/error console entries. Eight preview tests pass, including one integration test with actual PTY commands, Ctrl+C, separate session grants, stale terminal IDs, chooser/disconnect races, and file/symlink escape rejection. Native Hermes controls are unchanged by this revision. See [local setup and permissions](LOCAL-WORKSPACE.md).

## Native workspace follow-up

On October 2, 2026, the isolated native app’s Files tree opened a disposable workspace README. Its real zsh Terminal listed the sample files and ran `python3 hello.py` successfully after choosing the host’s Terminal deck layout. See [the gallery](SCREENSHOTS.md) and [layout recovery notes](NATIVE-TEST.md#native-files-and-terminal). This verifies manual native file opening and sample command execution; it does not establish agent-driven file-edit or full terminal acceptance.

Revision 8 (0.4.2) verifies the layout guard and update prompt in the maintainer's daily Hermes Desktop (hermes-agent `fc4c176`, macOS arm64). Real mouse clicks on **Swap sidebar sides** flipped the layout in both directions repeatedly. After each flip no window-drag region overlapped either titlebar cluster, no tab sat under the traffic lights, the widget rail and shortcut dock seams were hidden, the remaining seam started below the 34px titlebar, and the glass edge followed the sidebar. With `version.json` stubbed to a newer version, **Check for updates** showed the sticky notification, the highlighted update card and the badge on Customize appearance. Run `node tandem/scripts/check-layout.mjs` for offline coverage: manifest/version sync, strict manifest parsing, fixed rail/dock tracks, seam locking across flips and hidden zones, and sidebar-side tracking.
