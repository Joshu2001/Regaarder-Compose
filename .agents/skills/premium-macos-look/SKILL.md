---
name: premium-macos-look
description: Rules and architectural principles for creating a premium, macOS-style glassmorphism interface (like the Room UI) using Tailwind CSS.
---

# Premium macOS-style Interface Design Guidelines

This document outlines the specific Tailwind CSS classes and structural patterns required to achieve the "premium, macOS-like" glassmorphism UI seen in the Room (Meeting) experience.

## 1. Glassmorphic Containers

To create premium frosted-glass containers, you must combine translucent backgrounds, heavy backdrop blurs, and subtle white borders.

**Standard Window Container:**
`bg-white/70 backdrop-blur-[60px] border border-white/60 shadow-[0_32px_120px_rgba(0,0,0,0.04)]`

**Floating Toolbar / Dock:**
`bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_24px_80px_rgba(0,0,0,0.05)]`

**Dark Floating Elements (e.g. video feeds, thumbnails):**
`bg-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-white/10`

---

## 2. Radii & Soft Corners

A hallmark of modern Apple-style UI is extremely soft, generous corner radii. Do not use standard `rounded-lg` or `rounded-xl` for major structural elements.

*   **Main Application Windows:** `rounded-[40px]`
*   **Large Floating Panels / Video Canvas:** `rounded-[32px]`
*   **Medium Cards / Toolbars:** `rounded-[32px]` or `rounded-[24px]`
*   **Buttons inside Toolbars:** `rounded-full`

---

## 3. Shadows & Depth

Shadows must be deeply diffused with a high spread and low opacity to mimic ambient lighting, rather than harsh directional light.

*   **Window Ambient Shadow:** `shadow-[0_32px_120px_rgba(0,0,0,0.04)]`
*   **Deep Floating Shadow (Dark mode elements):** `shadow-[0_32px_100px_rgba(0,0,0,0.08)]`
*   **Actionable Hover States:** Translate elements up slightly (`hover:-translate-y-1`) and increase shadow intensity (`hover:shadow-xl`).

---

## 4. Backgrounds & Environments

Solid backgrounds feel flat. Use subtle radial gradients and mesh meshes to give the backdrop environment depth.

*   **Background Environment Pattern:** 
    `bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFFDFB] via-[#F9F8F6] to-[#F1F0EE]`
*   **Subtle Overlays:** Add an absolute positioned div with `bg-black/[0.025] pointer-events-none` over the background to act as a slight vignette.

---

## 5. Micro-Animations

Smooth transitions are critical for a premium feel.
*   **Global Transitions:** Add `transition-all duration-500` to major layout containers (e.g., entering fullscreen, expanding panels).
*   **Hover States:** Ensure buttons and interactive elements have `transition-all` and react smoothly (e.g. `hover:bg-violet-50 text-violet-500`).
*   **Pulse Effects:** Use tailored pulse animations for active indicators (e.g. `animate-[pulse_0.8s_infinite_alternate]`).
