# Postmortem: Windows External Window Capture, Multi-Process HUD, and OS Compositor Integration

**Date:** 2026-08-28  
**Component:** Regaarder Room — Screen Sharing, Always-on-Top Floating PiP HUD, Electron Multi-Process Media Pipelines  
**Severity Level:** High (Multi-attempt stabilization of OS-level video streaming, process focus, and UI overlays)

---

## 1. Executive Summary & Problem Overview

When presenting an external application (such as **Git Bash / `cmd.exe`**) from Regaarder Compose into Room:
1. The app needed to automatically yield OS focus to the target terminal.
2. An Always-On-Top floating HUD needed to appear over the terminal with meeting controls, live timer, and a real-time mini-preview of the presentation.
3. Clicking **Open Room** on the floating widget needed to restore Compose directly into the active Room meeting stage.

During iterative implementation, several critical bugs occurred:
- Blank/black frames with green borders appeared inside the floating HUD.
- Clicking "Open Room" navigated to Docs or threw unregistered IPC errors.
- Chromium's GPU process crashed with `exit_code=34` (`ContextResult::kFatalFailure`).
- Stale Electron background instances blocked updated Node.js IPC handlers from loading.
- PowerShell Win32 bounding box scripts broke due to multi-line string escaping.
- An infinite mirror (recursive PiP inception) and taskbar slivers appeared in the capture.

---

## 2. Mistakes & Failed Attempts

| # | Attempted Approach | Why It Failed / Incorrect Assumption |
|---|---|---|
| **1** | **Direct `getUserMedia` in Secondary PiP Window** | *Assumption:* Assumed the secondary PiP `BrowserWindow` could independently call `getUserMedia({ chromeMediaSourceId: sourceId })`.`\n`*Reality:* Dual concurrent `getUserMedia` requests across separate Electron renderer processes crashed Chromium's GPU compositor (`exit_code=34`, `Bind context provider failed`). |
| **2** | **DirectX Texture Capturer on Windows Console Windows** | *Assumption:* Assumed Chromium's DXGI window capturer could isolate `cmd.exe` / `conhost.exe` textures in software mode.`\n`*Reality:* Windows console windows lack Direct3D shared swapchains. Without hardware acceleration, DXGI returns empty black buffers with green margin artifacts. |
| **3** | **Git Bash Process Termination (`taskkill /F /IM`)** | *Assumption:* Assumed running `taskkill /F /IM electron.exe` in Git Bash would kill Electron.`\n`*Reality:* Git Bash translates single slashes (`/F`) into POSIX paths (`F:/`), causing `taskkill` to fail with syntax errors while old Electron instances remained alive in memory. |
| **4** | **PowerShell Here-String Flattening in Command Arguments** | *Assumption:* Assumed multi-line C# struct definitions (`@" ... "@`) could be joined with spaces into `powershell -Command "..."`.`\n`*Reality:* PowerShell strictly enforces raw newlines after `@"` and `"@`. Flattening it caused parser errors (`Unrecognized token`, `Missing using directive`), returning `null` bounds. |
| **5** | **Window Restore without Explicit Route State** | *Assumption:* Assumed calling `mainWindow.restore()` and `show()` would naturally bring the user into Room.`\n`*Reality:* `productMode` remained on `'compose'` (Docs) or defaulted to lobby (`isLobby: true`), causing the restored window to show Docs or the *"Welcome to Room"* lobby overlay. |

---

## 3. Root Cause Analysis

### A. Windows Console Architecture & D3D Swapchains
Windows `conhost.exe` and legacy GDI terminal windows do not render into DirectX 11 shared texture backings. When hardware acceleration is disabled in Electron (`disable-gpu`), Chromium's software compositor falls back to GDI. While GDI captures the **Entire Desktop (`screen:0:0`)** seamlessly via the display Device Context, it fails when attempting to isolate non-D3D console window handles, returning empty buffers.

### B. Chromium Background Occlusion Throttling
On Windows 10/11, native window occlusion notifies Chromium when `mainWindow` is minimized. Chromium automatically suspends video element decoding and clamps timers to 1000ms. Without explicit flags (`--disable-backgrounding-occluded-windows`, `--disable-features=CalculateNativeWinOcclusion`, `backgroundThrottling: false`), background frame pumps freeze immediately.

### C. Win32 Display Affinity (`WDA_EXCLUDEFROMCAPTURE`)
Screen capturers capturing the full desktop inherently capture all visible screen pixels, including Always-On-Top floating overlays. This creates an infinite visual recursion (the floating widget capturing itself).

---

## 4. Final Solution & Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MAIN ELECTRON PROCESS                         │
│  - backgroundThrottling: false                                         │
│  - disable-features=CalculateNativeWinOcclusion                         │
│  - AppActivate(safeName) -> Brings Git Bash to foreground               │
│  - WDA_EXCLUDEFROMCAPTURE -> setContentProtection(true) on PiP Window   │
└──────────────────┬──────────────────────────────────────┬───────────────┘
                   │                                      │
                   ▼                                      ▼
┌──────────────────────────────────────┐┌─────────────────────────────────┐
│       MAIN RENDERER (App.jsx)        ││    FLOATING PIP WIDGET WINDOW   │
│ - Captures primary screen:0:0        ││ - Pure CPU 2D Software Canvas   │
│ - Unthrottled offscreen <video>      ││ - Receives JPEG DataURL via IPC │
│ - Crops top 2.6% (titlebar) &        ││ - Zero GPU Context Conflict     │
│   bottom 5.5% (taskbar)              ││ - 1-Click "Open Room" IPC Dis-  │
│ - Pumps 60 FPS JPEG frames over IPC  ││   patch to productMode:'room'   │
└──────────────────────────────────────┘└─────────────────────────────────┘
```

1. **Desktop Stream Fallback with Taskbar & Titlebar Crop:**
   - Console windows fallback to primary desktop capture (`screen:0:0`), where Git Bash is immediately focused in the foreground.
   - Canvas frame pipeline applies `2.6%` top crop (removes blue titlebar) and `5.5%` bottom crop (removes Windows taskbar), yielding a 100% borderless, isolated terminal display.
2. **Pure CPU 2D Software Canvas (Zero GPU Collisions):**
   - The main renderer pumps lightweight JPEG DataURLs (`offscreenCanvas.toDataURL('image/jpeg', 0.65)`) over IPC to the floating widget.
   - The floating widget renders on a pure 2D CPU canvas (`ctx.drawImage(img)`), completely bypassing secondary `getUserMedia` calls and eliminating `exit_code=34` crashes.
3. **OS Kernel Capture Exclusion (`setContentProtection(true)`):**
   - Enables `WDA_EXCLUDEFROMCAPTURE` on `pipFloatingWindow`, natively hiding the HUD from screen capture and eliminating the infinite recursive mirror effect.
4. **Deterministic Cross-Process Navigation (`pip:return-to-room`):**
   - Clicking **Open Room** invokes `returnToRoom()`, which restores `mainWindow` and fires `pip:navigate-to-room`.
   - `App.jsx` catches the event, sets `productMode: 'room-landing'`, sets `roomState: 'active'`, and automatically dismisses `isLobby: false`.

---

## 5. Lessons Learned & Extrapolatable Architectural Principles

### 1. Never Spawn Secondary `getUserMedia` Streams in Sub-Windows
In Electron, do **not** re-acquire hardware media streams in secondary or floating utility windows. Always capture in the primary renderer, pump frames or data over IPC, and render on a software 2D canvas. This avoids GPU context deadlocks and permission duplication.

### 2. Isolate Console Window Streaming via Screen Capture + Crop
Do not rely on OS window-isolation capturers for command-line consoles (`cmd`, `bash`, `powershell`). Use desktop capture combined with top/bottom bounding box insets for universal, crash-free streaming across all Windows versions.

### 3. Use `setContentProtection(true)` for Floating Overlays Over Shares
Any floating HUD, annotation overlay, or presenter bar intended to float *above* a shared application must have `setContentProtection(true)` to prevent visual recursion in the capture pipeline.

### 4. Git Bash Command Escaping in Windows Environments
When managing Windows processes from Git Bash, always use double slashes (`taskkill //F //IM electron.exe`) or PowerShell cmdlets (`Stop-Process -Name electron -Force`) to avoid POSIX path translation traps.

### 5. Always Accompany Window Restores with Explicit Route State
Restoring an OS window (`mainWindow.show()`) does not guarantee user interface state. Always pair window restoration with explicit IPC route signals (`pip:navigate-to-room`) and bypass modal lobby states (`isLobby: false`) when an active session is in flight.
