# Local Files and Terminal

The localhost development preview includes an optional companion running on your own Mac. Native Hermes continues to use its existing file browser, project folder picker and terminal. This companion does not change Hermes profiles, credentials, settings or agent access.

## Setup

Use the README quick start (`npm ci`, then `npm run dev` in `localhost-preview`) and open `http://127.0.0.1:14327/` on the same Mac. Folder selection requires macOS and Apple's Xcode Command Line Tools, including `xcrun swiftc`. If they are missing, run `xcode-select --install` and complete Apple's installation dialog before trying again. Node.js/npm are also required. Docker and provider keys are not required for these two controls.

The first folder request compiles the included small Swift/AppKit helper into a private temporary application bundle. Subsequent requests reuse it. Source is in `localhost-preview/local/choose-folder.swift`; no helper binary is downloaded. The helper exits when the chooser closes. Build failures appear in the panel; check `xcrun swiftc --version` if selection cannot open.

## Files

1. Click **Files** in the chat header. At smaller widths, use **More chat actions → Files**.
2. Click **Choose workspace folder…**. A native macOS folder dialog opens, with Finder's familiar sidebar and navigation. Browse to your folder or use Command+Shift+G to enter a path.
3. Click **Allow folder access** to let this preview list and read that folder. **Cancel** grants no new access and retains an existing selection.
4. Navigate folders, use **Up a folder**, refresh the list, and click a file to preview its text.
5. Use **Change folder** for another workspace or **Disconnect access** to revoke the grant and stop its terminal.

This browser-session grant is held in memory. Reloading the page or restarting the development server requires choosing again. Closing only the Files panel retains the folder grant for the current page. Access is shared by this tab's Files and Terminal panels, independent of the simulated provider/profile selector. File contents are not sent to your agent or stored with chat history. Hidden files and dependency directories are omitted, listings are capped at 250 entries, and text previews are limited to 256 KB. Binary previews, editing, uploads, and directory symlink navigation are not implemented. Resolved paths outside the chosen folder, including escaped symlinks, are rejected.

This is an application permission flow and a native folder-selection dialog, not a macOS App Sandbox entitlement. The development server already runs under your account. It exposes the selected folder through guarded local endpoints only after the grant. macOS may separately request access to a protected directory; review that OS prompt yourself.

## Terminal

Click **Terminal**, choose a folder if needed, then **Enable local terminal**. This starts a real interactive `/bin/zsh -f` shell in the selected folder with an xterm display. Commands execute locally; `cd`, interactive programs, arrow keys and Ctrl+C use a persistent PTY session. Shell startup files are skipped, and the companion does not copy provider credentials from its environment into the shell. Commands can still read credentials or other files accessible to your Mac account.

**The terminal runs with your account's permissions, not in a VM or a folder sandbox.** The selected folder is its starting directory. Enable it only when you intend to run local commands. Output and commands are not sent to the simulated agent. Closing the panel, clicking **Stop terminal**, changing the folder or disconnecting access stops its shell. Background jobs deliberately detached by a command may outlive it. Reopening the panel requires enabling a new shell; it does not restore command history. The server also stops a shell after 30 seconds without client activity. Browser unload requests are best effort; this idle timeout handles lost connections. Folder sessions expire after 30 minutes without activity.

## Deployment boundary

The companion is installed only by Vite's development-server middleware. A static `npm run build` deployment or `vite preview` cannot launch a Mac folder chooser or terminal and shows a setup message. Keep the development server bound to `127.0.0.1:14327`; its companion rejects other Host/Origin values and cross-site requests. Session tokens stay in page memory and are passed in a request header, not a URL. Never expose this development companion over a public host, proxy or tunnel. It is not a remote workspace service or mobile backend.

The native macOS picker is currently implemented only for macOS. Linux CI verifies the backend with an injected disposable folder; it does not prove a Linux desktop chooser. Native Hermes on supported desktop platforms continues to own its own folder and terminal controls. Android and iOS remain a separate project.

## Validation

Run `npm test` in `localhost-preview`. Tests use disposable folders and actual PTY shells to exercise origin/host rejection, separate session grants, file listing/reading, path and symlink escape rejection, explicit terminal consent, persistent directory changes, Ctrl+C, stale terminal IDs, and revocation. The native chooser is checked manually on macOS; automated tests do not open OS permission dialogs.

The terminal uses the official [node-pty](https://github.com/microsoft/node-pty) and [xterm.js](https://xtermjs.org/docs/guides/security/) packages. On macOS, the companion repairs a missing owner execute bit on node-pty's own packaged spawn helper when needed. It does not change permissions on user workspace files.
