# Postmortem: Floating PiP Window & Real-Time Screen Capture Architecture

**Date:** August 28, 2026  
**Status:** Resolved & Production-Ready  
**Components:** `FloatingPipWidgetWindow.jsx`, `electron/main.cjs`, `src/App.jsx`, `src/main.jsx`  
**Authors:** Principal Software Architect / Antigravity AI  

---

## 1. Executive Summary & Problem Space

The Floating Picture-in-Picture (PiP) widget in Regaarder Compose was designed to give users a minimalist, Apple-style floating screen preview over their desktop when sharing application windows. During development and testing across diverse Windows 10/11 environments, a cascading series of subtle visual, architectural, and operating-system-level bugs surfaced:

1. **The Ugly White Host Box:** The floating widget was enclosed inside a blocky white rectangular container instead of floating transparently on the desktop.
2. **The Black Screen & Green Border Capture Failure:** When sharing hardware-accelerated windows (e.g. Antigravity IDE), the video canvas rendered solid black with yellow-green top/bottom border bands.
3. **The Infinite Optical Feedback Loop ("Hall of Mirrors"):** Navigating back into the Room while presenting caused the screen capture to capture itself recursively ad infinitum.
4. **Sidebar Clipping & Leftover Edge Artifacts:** The full width (notably the left sidebar) was clipped, and dark, cut-off border lines remained along the bottom and right edges of the widget.
5. **Window Dragging Failure:** Hovering over the widget showed a move cursor, but dragging was completely blocked.

---

## 2. Root Cause Analysis (First-Principles Breakdown)

### A. The White Host Box Artifact
* **Root Cause:** Chromium and Vite bootstrap render the HTML document with an opaque `<body>` background (`#ffffff`). Even with `transparent: true` on Electron's `BrowserWindow`, without explicit `backgroundColor: '#00000000'` and `document.body.style.background = 'transparent'`, the host window renders an opaque white plate behind padded child elements.

### B. Hardware-Accelerated Blackout & Windows WGC
* **Root Cause 1 (DRM Protection):** `mainWindow.setContentProtection(true)` was invoked during screen sharing. Windows DWM flags protected windows with `WDA_MONITOR`, forcing screen capturers to blank the pixels as DRM blackouts.
* **Root Cause 2 (DirectComposition Surface Sharing):** Because Chromium GPU process crashes were prevented by launching Electron with `--disable-gpu`, Windows Graphics Capture (WGC) could not share DirectX swapchain textures for individual `window:HWND` handles. Capturing the desktop surface (`screen:0`) bypasses this limitation.
* **Root Cause 3 (Unsubscribed Stream Race Condition):** In `FloatingPipWidgetWindow.jsx`, `hasFrames` was passed in the `useEffect` dependency array, causing the component to unsubscribe from the IPC frame stream on the very first frame received.

### C. The Infinite Recursive Optical Feedback Loop
* **Root Cause:** Presenting a desktop that displays the meeting stage creates an infinite geometric series ($f(x) = f(f(x))$). In modern meeting software (Google Meet, Zoom), the presenter's local stage must never render their own raw feed.

### D. Sidebar Clipping & Aspect Ratio Mismatch
* **Root Cause 1:** CSS `object-cover` was applied to the canvas, forcing Chromium to zoom into the video feed and crop the left and right margins (clipping the application sidebar).
* **Root Cause 2:** The PiP `BrowserWindow` was hardcoded to `320×220` (a `16:11` ratio) rather than native `16:9` (`320×180`).

### E. Clipped CSS Box Shadows
* **Root Cause:** Applying CSS `shadow-2xl` to a `100% width/height` element in a transparent Electron window caused the blurred box-shadow to bleed beyond the `320×180` window bounds. Windows DWM clipped the blur at the window boundary, producing a hard, dirty dark line at the right and bottom edges.

### F. Dragging Interception by Hover Overlay
* **Root Cause:** The hover action overlay (`absolute inset-0`) had `WebkitAppRegion: 'no-drag'`. When the user hovered over the widget to drag it, the overlay activated and disabled OS dragging across the entire window.

---

## 3. Detailed Iteration Log: What Failed vs. What Succeeded

| Attempt / Hypothesis | Implementation | Result | Why It Failed / Succeeded |
| :--- | :--- | :--- | :--- |
| **Attempt 1:** Add padding `p-2` for shadow clearance | Added padding around widget | ❌ Failed | Padding exposed the white `<body>` background. |
| **Attempt 2:** Set `transparent: true` only | Set Electron window flag | ❌ Failed | Windows DWM requires explicit hex alpha `backgroundColor: '#00000000'`. |
| **Attempt 3:** Hardcoded percentage crop (2.6% top, 5.5% bottom) | Sliced top/bottom across all streams | ❌ Failed | Sliced the green WGC capture border across the middle of the frame. |
| **Attempt 4:** CSS `object-cover` on Canvas | Set `object-cover` | ❌ Failed | Cropped out the left navigation sidebar. |
| **Attempt 5:** Fixed Aspect Ratio + Taskbar Crop + Presenter Slate | Locked to 16:9 (`320×180`), 5.5% taskbar crop, Google Meet slate | ✅ **Succeeded** | Zero letterboxing, no taskbar leakage, zero recursion. |
| **Attempt 6:** Remove CSS shadow + Isolate `no-drag` to Buttons | Cleaned canvas + button-only `no-drag` | ✅ **Succeeded** | Eliminated dirty edge lines and restored 100% drag responsiveness. |

---

## 4. Reusable Architectural Patterns & Code Snippets

### Pattern 1: Transparent, Frameless, Draggable Electron Window
```javascript
// electron/main.cjs
pipFloatingWindow = new BrowserWindow({
  width: 320,
  height: 180, // Exact 16:9 ratio
  x: screenWidth - 320 - 24,
  y: screenHeight - 180 - 24,
  frame: false,
  transparent: true,
  backgroundColor: '#00000000',
  alwaysOnTop: true,
  resizable: false,
  skipTaskbar: true,
  hasShadow: false,
  webPreferences: {
    preload: path.join(__dirname, 'preload.cjs'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  }
});
```

### Pattern 2: Selective Webkit Drag/No-Drag Hierarchy
```jsx
// Drag region across 100% of container and canvas, no-drag isolated to buttons
<div style={{ WebkitAppRegion: 'drag' }} className="w-screen h-screen select-none overflow-hidden cursor-move">
  <canvas ref={canvasRef} style={{ WebkitAppRegion: 'drag' }} className="w-full h-full block bg-transparent" />
  
  {/* Hover Overlay with pointer-events-none on backdrop */}
  <div style={{ WebkitAppRegion: 'drag' }} className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
    <div style={{ WebkitAppRegion: 'no-drag' }} className="pointer-events-auto">
      <button style={{ WebkitAppRegion: 'no-drag' }} onClick={handleClose}>Close</button>
    </div>
  </div>
</div>
```

### Pattern 3: Google Meet Presenter Slate Pattern
```jsx
{screenShareStream ? (
  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white select-none p-6">
    <div className="flex flex-col items-center text-center max-w-md p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-2xl">
      <MonitorPlay size={30} className="text-violet-400 mb-4" />
      <h3 className="text-lg font-bold text-white mb-2">You are presenting to everyone</h3>
      <p className="text-xs text-zinc-400 mb-6">
        To avoid an infinite mirror effect, your screen is hidden here. Everyone in the meeting can see your live presentation.
      </p>
      <button onClick={stopPresenting} className="bg-rose-500 hover:bg-rose-600 px-5 py-2.5 rounded-xl font-bold text-xs">
        Stop presenting
      </button>
    </div>
  </div>
) : (
  <RemoteParticipantVideo />
)}
```

---

## 5. Key Learnings for Future Agentic & Human Engineers

1. **Never Apply CSS Box Shadows to Full-Bleed Transparent Windows:** Blurred box shadows bleed past the DOM bounds. On transparent windows, OS compositors (DWM) cannot draw outside the window rect, resulting in hard cut-off border lines.
2. **Keep `WebkitAppRegion: 'no-drag'` Exclusively on Leaf Buttons:** Putting `no-drag` on any container overlay completely kills native window dragging across the entire parent area.
3. **Isolate Presenter Viewports from Self-Captures:** Presenters must always be shown a dedicated status slate rather than their own raw screen stream to prevent optical recursion.
4. **Account for Windows Taskbar in Desktop Streams:** Desktop stream captures include the bottom ~48px (4.5%–5.5%) taskbar. Applying an automatic bottom crop buffer delivers clean, isolated application window playback.
