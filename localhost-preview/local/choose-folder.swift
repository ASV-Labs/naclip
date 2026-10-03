import AppKit

final class FolderPickerDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        let panel = NSOpenPanel()
        panel.title = "NaCLip — Allow workspace access"
        panel.message = "Choose a folder to let this local NaCLip session list and read its files. Nothing is uploaded. You can disconnect access in NaCLip."
        panel.prompt = "Allow folder access"
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        panel.canCreateDirectories = false
        NSApp.activate(ignoringOtherApps: true)
        if panel.runModal() == .OK, let url = panel.url {
            print(url.path)
        }
        NSApp.terminate(nil)
    }
}
let app = NSApplication.shared
let delegate = FolderPickerDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
