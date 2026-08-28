# Postmortem: Floating PiP Window Taskbar Cropping & Geometry Alignment

**Date:** August 28, 2026  
**Status:** Resolved & Production-Ready  
**Components:** `FloatingPipWidgetWindow.jsx`, `main.cjs`, `App.jsx`  
**Authors:** Principal Software Architect / Antigravity AI  

---

## 1. Executive Summary & Root Cause Analysis

When streaming external applications into the floating Picture-in-Picture (PiP) widget on Windows 10/11:
1. **Geometric Aspect Ratio Mismatch:** The floating PiP window was initially sized to `320×220` (16:11), whereas desktop displays and modern video streams adhere to `16:9` (1920×1080 / 2560×1440). This caused letterbox gap artifacts in the bottom corners.
2. **OS Chrome Leakage (Windows Taskbar):** Capturing the uncropped desktop display stream included the bottom 40–48px Windows taskbar, causing the bottom edges of the canvas to display residual OS chrome instead of cleanly filling the floating window with the target application.
3. **DirectComposition Cross-Process Blackouts:** On Windows, capturing hardware-accelerated GUI windows (such as Electron, VS Code, or Antigravity) via Chromium's `desktopCapturer` (`window:HWND`) produces black frames when GPU acceleration is disabled. Capturing the desktop surface (`screen:...`) eliminates blackouts, but requires precise OS window bounding box cropping (`GetWindowRect`) and taskbar suppression.

---

## 2. Architectural Solution

### A. 16:9 Native Geometry Locking
The Electron `BrowserWindow` configuration for `pipFloatingWindow` in `main.cjs` was updated to exact 16:9 dimensions (`320×180`) with `backgroundColor: '#00000000'` and zero frame borders.

### B. Dynamic Taskbar & Window Coordinate Cropping
In `App.jsx`, the frame pump evaluates native window coordinates (`cropBoundsRef.current`) or cleanly crops the bottom 4.5% taskbar height, preventing taskbar pollution and filling the canvas 100% edge-to-edge.

### C. Pure Frameless Video Surface
In `FloatingPipWidgetWindow.jsx`, all background layers, border frames, and `object-cover` distortions were removed. The canvas draws 100% edge-to-edge with glass controls appearing strictly on hover.

---

## 3. Verification & Results

- **Zero Corner Gaps:** The bottom corners no longer reveal letterbox strips or transparent background bleed.
- **No Taskbar Leak:** The bottom Windows taskbar is completely eliminated from the stream.
- **Full Sidebar Visibility:** The full horizontal width—including application sidebars—renders without clipping.
- **Zero Hall-of-Mirrors Loop:** Presenting inside the active Room renders the "You are presenting" slate, and auto-destroys the desktop PiP window on navigation.
