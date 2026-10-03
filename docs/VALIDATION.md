# Validation status

This project distinguishes preview functionality from native integration.

| Surface | Evidence | State |
| --- | --- | --- |
| React/Vite preview | Production bundle builds | Offline verified |
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
