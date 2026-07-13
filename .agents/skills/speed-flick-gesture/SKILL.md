---
name: speed-flick-gesture
description: Guidelines and specifications for the Apple-style speed flick gesture used to cycle participants in immersive media layouts.
---

# Speed Flick Gesture Implementation

## Overview
Instead of traditional click-and-drag mechanics, our media players utilize a pure **pointer-move speed flick gesture** to switch between active participants/media. It provides an immediate, premium, Apple-like feel by calculating distance over time directly from cursor movement without requiring a click.

## Thresholds
- **Distance**: The cursor must move a minimum of **60 pixels**.
- **Speed**: The movement must be executed at a speed greater than **2.0 pixels per millisecond** (which equates to > 2000px/s).
- This prevents accidental triggers when users are just browsing the interface with normal mouse movement.

## Behavior
- **Directional Triggers**: 
  - Flicking Right-to-Left triggers "Next".
  - Flicking Left-to-Right triggers "Previous".
- **Visual Feedback**: On a successful trigger, an array of particle trails (stars) are spawned from the cursor coordinate and animate outward to show the swipe direction.
- **Edge Boundary Rejection**: The cycle does NOT infinitely loop. If the user tries to flick past the start or the end of the participant list, they are met with a physical rejection bounce (using CSS `translate-x` and an `overflow-hidden` container) instead of an awkward dead stop.
- **Cursor State**: When in the expanded/immersive media view, the cursor defaults to `cursor-default` instead of a pointing hand, since the interaction relies on movement rather than clicking.

## Keyboard Fallback
- `ArrowRight` and `ArrowLeft` are supported globally when the immersive layout is active to allow for accessibility parity with the flick gesture.
