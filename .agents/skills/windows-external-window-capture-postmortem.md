# Postmortem: Windows External Window Capture, Hybrid Display Pipelines, and Zero-Mirror Room Architecture

**Date:** 2026-08-28  
**Component:** Regaarder Room — Screen Sharing, Always-on-Top Floating PiP HUD, Multi-Process Media Pipelines, Native Presenter View  
**Severity Level:** High (Multi-attempt architectural stabilization across OS-level Win32 window management, Electron IPC, and React stage compositing)

---

## 1. Executive Summary & Problem Overview

When presenting external desktop applications (such as **Git Bash / `cmd.exe`**, **WhatsApp**, or **VS Code**) from Regaarder Compose into Room:
1. The app needed to automatically yield OS focus to the selected window.
2. An Always-On-Top floating HUD needed to appear over the application with meeting controls, live timer, and a real-time mini-preview of the presentation.
3. Clicking **Open Room** on the floating widget needed to restore Compose directly into the active Room meeting stage without visual distortion or infinite feedback loops.

During iterative implementation, several complex OS and compositor bugs emerged:
- **Black Screen with Green Bars:** Console windows produced empty black textures when captured directly.
- **Unstable "Portal" Random App Switching:** Selecting WhatsApp switched to Antigravity, and selecting Antigravity switched to WhatsApp.
- **Infinite Mirror Recursion:** Opening Room displayed an endless feedback loop of Compose capturing itself.
- **Background App Bleed & Mini-HUD Inception:** Non-maximized Git Bash showed background apps (Antigravity) and a recursive mini-HUD in the corner.
- **Missing Translation & Component Clones:** Opening Room routed to a cloned prototype page or threw `ReferenceError: t is not defined`.

---

## 2. Failed Attempts & Root Cause Breakdown

| # | Bug / Symptom | Root Cause | Failed Attempt |
|---|---|---|---|
| **1** | **Black screen with green sidebars on Git Bash** | Windows console windows (`conhost.exe` / `cmd.exe`) are legacy Win32 GDI surfaces without Direct3D shared texture swapchains. Chromium's DXGI capturer cannot extract hardware textures from non-D3D handles. | Attempted direct `window:HWND:0` capture on Git Bash. |
| **2** | **"Unstable Portal" random app switching** | PowerShell's `AppActivate(name)` performs fuzzy substring matching across all open windows. If another window (like Antigravity or a browser tab) contained that text, Windows promoted the wrong window. | Attempted fuzzy process title matching instead of exact Win32 integer HWNDs. |
| **3** | **Window minimization jumping to random background apps** | Calling `mainWindow.minimize()` before the target window had finished restoring caused Windows OS to promote whatever app was next in the Z-order stack. | Blindly called `mainWindow.minimize()` on every window focus. |
| **4** | **Infinite Mirror Recursion Tunnel in Room** | Capturing the physical display (`screen:0:0`) while displaying that live video inside Compose on the same display creates a mathematical feedback loop (recording a screen showing the recording). | Attempted to play the live desktop stream directly inside the presenter's own Room stage. |
| **5** | **Background App Bleed & Mini-HUD Inset** | Because Git Bash was floating as a smaller window, desktop capture recorded everything behind it (Antigravity) and the floating HUD in the bottom-right corner. | Captured uncropped desktop without expanding the target window. |
| **6** | **UI Cloning & `ReferenceError: t is not defined`** | The app had two Room implementations: `RoomLandingPage.jsx` (prototype) and native Room in `App.jsx`. The navigation routed to `room-landing`, and `RoomInviteModal` omitted `useTranslation`. | Hardcoded navigation to `room-landing` and called `t()` without destructuring. |

---

## 3. The Final First-Principles Solution & Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          MAIN ELECTRON PROCESS                           │
│  - backgroundThrottling: false                                          │
│  - disable-features=CalculateNativeWinOcclusion                          │
│  - Exact HWND Activation: ShowWindowAsync(HWND, 3/9) + SetForegroundWindow│
│  - WDA_EXCLUDEFROMCAPTURE on pipFloatingWindow                           │
└──────────────────┬───────────────────────────────────────┬───────────────┘
                   │                                       │
                   ▼                                       ▼
┌──────────────────────────────────────┐ ┌─────────────────────────────────┐
│        MAIN RENDERER (App.jsx)       │ │    FLOATING PIP WIDGET WINDOW   │
│ - Hybrid Capture Engine:             │ │ - Pure CPU 2D Software Canvas   │
│   • GUI Apps: window:HWND:0          │ │ - Receives JPEG DataURL via IPC │
│   • Console Apps: screen:0:0         │ │ - Zero GPU Context Conflict     │
│ - 5.5% Bottom & 2.6% Top Crop        │ │ - 1-Click "Open Room" Dispatch  │
│ - 0x0C0C0C Inception Mask            │ │   to native productMode:'room'  │
│ - Google Meet Presenter Dashboard    │ │                                 │
└──────────────────────────────────────┘ └─────────────────────────────────┘
```

### A. Hybrid Capture Pipeline
- **DirectX/GUI Applications (WhatsApp, VS Code, Figma, Chrome):** Captured directly via isolated `window:HWND:0` for crisp, single-app streaming with zero background bleed.
- **Legacy Console Windows (Git Bash, `cmd.exe`, PowerShell):** Captured via display Device Context (`screen:0:0`) combined with Win32 `SW_MAXIMIZE` (`3`) to expand the terminal edge-to-edge.

### B. Dynamic Bounding Box Crop & Inception Mask
- **Taskbar & Titlebar Crop:** Applied a `5.5%` bottom crop (58px) and `2.6%` top crop (28px) in the canvas pipeline to eliminate the Windows taskbar accent line and blue titlebar.
- **HUD Inception Mask:** Painted a matching `#0c0c0c` mask over the bottom-right coordinate region where the floating widget resides, eliminating the recursive mini-HUD inset.

### C. Google Meet Zero-Mirror Presenter Standard
- Inside the native Room interface (`productMode: 'room'`), when the user is actively presenting, the stage renders the **Google Meet / Zoom Presenter Dashboard**:
  - Center Badge: *"You are presenting to everyone • Broadcasting: [Window Name]"*
  - Controls: **`Stop Presenting`** and **`Floating OS Window`**
  - Remote participants receive the pristine live stream, while the local presenter views a clean, feedback-free dashboard.

---

## 4. Lessons Learned & Extrapolatable Engineering Patterns

1. **Console Windows vs. GUI DirectX Windows:**
   Never assume all OS windows can be captured via window-level texture APIs. GDI console windows must use display capture with automatic maximization, while modern DirectX/Electron apps should use isolated window handles.

2. **Always Use Integer HWNDs for OS Window Focus:**
   Never rely on window title strings (`AppActivate`) in desktop environments. Always extract the unique integer HWND from `sourceId` (`window:HWND:0`) and invoke native Win32 `SetForegroundWindow(HWND)`.

3. **Google Meet Presenter Pattern for Screen Sharing:**
   A screen-sharing presenter should never be shown a live mirror of their own full-screen broadcast in the main stage. Always render a dedicated Presenter Card to avoid mathematical feedback loops.

4. **Pure 2D Canvas IPC for Secondary Utility Windows:**
   Never invoke secondary hardware `getUserMedia` streams in sub-windows. Capture in the primary process and pump lightweight JPEG DataURLs over IPC to a 2D software canvas.
