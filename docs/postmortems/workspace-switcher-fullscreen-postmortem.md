# Postmortem: Missing Workspace Switcher Popover & Fullscreen Gesture Trapping in Sheets and Decks

**Incident Date:** September 1, 2026  
**Component:** Global Navigation & Workspace Switcher Popover / Gesture Lifecycle  
**Affected Subsystems:** Sheets, Decks, Docs, Global Translations  
**Status:** Resolved  

---

## 1. Executive Summary

Users reported that tapping the **Switch Workspace** icon button (`LayoutGrid`) in Sheets displayed the active state styling on the trigger button, but the actual popover menu never rendered on screen. Furthermore, attempting to exit full screen or dismiss the active state via double-tap or `Escape` failed silently in Sheets and Decks, despite functioning as expected in Docs/Compose. Additionally, the workspace switcher list displayed `"Notes"` instead of `"Browser"`.

Investigation revealed that:
1. **Isolated Root JSX Branching:** Sheets and Decks utilize a dedicated top-level early return block (`if (productMode === 'deck' || productMode === 'sheets')`). The modal invocation `{workspaceSwitcherOpen && renderWorkspaceSwitcherDropdownContent()}` was only mounted in the main Docs return tree.
2. **Missing Shell Pointer & Double-Click Listeners:** The root container in the Sheets/Deck branch did not bind `onPointerDown={handleAppShellPointerDown}` or `onDoubleClick={handleAppShellDoubleClick}`, isolating Sheets and Decks from the app-wide immersive mode and double-tap toggle pipeline.
3. **Locale Key Drift:** `nav.browser` had been mapped to `"Notes"` across multiple translation dictionaries, causing the switcher to display `"Notes"` instead of `"Browser"`.

---

## 2. Root Cause Analysis

### A. Forked Root Tree Rendering (Missing Modal Invocations)
In `src/App.jsx`, the component structure forks early for high-performance rendering:
```jsx
// Line 48827
if (productMode === 'deck' || productMode === 'sheets') {
  return (
    <div ref={appShellRef} ...>
       {/* Toolbar with Switcher Button */}
       ...
       {/* BUG: workspaceSwitcherOpen && renderWorkspaceSwitcherDropdownContent() WAS MISSING HERE */}
    </div>
  );
}

// Line 72932
return (
  <div ref={appShellRef} onPointerDown={handleAppShellPointerDown} ...>
     ...
     {/* ONLY PRESENT HERE AT THE VERY BOTTOM OF DOCS RETURN */}
     {workspaceSwitcherOpen && renderWorkspaceSwitcherDropdownContent()}
  </div>
);
```
Because the popover component was only declared in the lower return statement, triggering the button in Sheets set `workspaceSwitcherOpen = true`, but the JSX node was never evaluated or mounted into the DOM.

### B. Shell Ref & Gesture Disconnect
The Docs tree passed `handleAppShellPointerDown` and `handleAppShellDoubleClick` to `<div ref={appShellRef}>`, enabling timestamp-based double-tap detection and CSS immersive expansion. The Sheets/Decks tree lacked both event handlers and the `${isDocumentImmersive ? 'fixed inset-0 z-[9999] h-screen w-screen' : ''}` class.

### C. Translation Hierarchy Misalignment
In `src/i18n/locales/*.json`, the `nav.browser` translation key was mapped to `"Notes"` / `"Notas"` / `"Catatan"`, overriding the intended branding `"Browser"`.

---

## 3. Corrective Measures & Architectural Resolution

1. **Global Popover Mounting in All Root Branches:**
   - Injected `{workspaceSwitcherOpen && renderWorkspaceSwitcherDropdownContent()}` into the Sheets/Deck return tree directly above `{renderCloseConfirmModal()}`.
2. **Universal Shell Gesture Handling:**
   - Added `onPointerDown={handleAppShellPointerDown}` and `onDoubleClick={handleAppShellDoubleClick}` to the Sheets & Decks shell container.
   - Connected `isDocumentImmersive` styles so Sheets responds fluidly to double-taps.
3. **Global Escape Listener Enhancement:**
   - Updated the capture-phase `Escape` keydown handler to unconditionally dismiss `workspaceSwitcherOpen` and exit `isDocumentImmersive` across all workspaces.
4. **Synchronized Workspace Translations:**
   - Corrected `nav.browser` to `"Browser"` across all 9 locale dictionaries (`en.json`, `es.json`, `fr.json`, `ar.json`, `ja.json`, `ko.json`, `vi.json`, `id.json`, `zh-TW.json`).
5. **Multi-Package Tree Synchronization:**
   - Applied and verified changes consistently across root and sub-package trees (`Regaarder Compose/src/App.jsx`, `Regaarder Compose/Regaarder Compose/src/App.jsx`, `src/App.jsx`).

---

## 4. Prevention & Architecture Directives

1. **Global Modal & Overlay Invariants:** Any global floating UI (popovers, search modals, confirmation dialogs, switchers) must either be declared inside a top-level layout wrapper that encapsulates all workspace modes or ported to a centralized `<GlobalOverlays />` coordinator.
2. **Early-Return Auditing:** When adding an early-return branch for a specific workspace mode, ensure all global providers, portals, and shell gesture listeners are preserved.
3. **Translation Key Integrity:** Navigation labels must remain distinct from feature labels (e.g., `nav.browser` vs `workspace.notes`).
