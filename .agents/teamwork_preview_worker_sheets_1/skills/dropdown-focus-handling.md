---
name: dropdown-focus-handling
description: Guidelines and troubleshooting steps for handling dropdown focus, click-outside closures, event handling in React, text alignment contrast, and selection/caret management for absolute overlays.
---

# Dropdown Focus, Click-Outside, and Text Caret Troubleshooting Guide

This guide details architectural solutions, patterns, and lessons learned from addressing overlapping event handler bugs, focus-theft, dynamic dropdown auto-dismissal, and caret placement issues.

## 1. Click-Outside Dropdown Dismissal Bugs
### Symptom
A custom dropdown or toolbar selector immediately closes upon activation (looks like it doesn't open at all), even on a blank screen with no other active elements.

### Diagnosis
- The layout usually attaches a global `document` or `window` click/pointer listener to detect clicks outside the dropdown element (to auto-dismiss it).
- A reference container (`ref={menuRef}`) wraps only a subset of the buttons/menus. If a button trigger or a dropdown menu is rendered outside the DOM subtree of `menuRef`, the outside-click listener evaluates `!menuRef.current.contains(event.target)` as `true` and immediately closes the dropdown.

### Architecture Fix
1. **Extend the Ref Wrapper**: Ensure the `ref` wrapper wraps the *entire sibling container* holding all associated buttons, formatting options, and dropdown elements.
2. **Prevent Event Bubbling strategically**: For dropdown triggers, use pointer event interception to avoid triggering other document-level focus switches.

---

## 2. Touch-Safe React Dropdowns & Focus Retention
### Symptom
Tapping styling controls (buttons, menus) on a toolbar causes the active text editor input/textarea to lose focus or dismiss its selection, forcing the user to click the text area again to resume typing.

### Design Pattern
- Standard `onClick` events trigger *after* browser focus is shifted to the clicked button.
- To prevent focus theft, use `onPointerDown` combined with `e.preventDefault()`. This stops the browser from focusing the button or changing selection states, while executing the styling action.
- Ensure all interactive options in the dropdown also use `onPointerDown` with `e.preventDefault()` to maintain the caret focus context on the editor.

---

## 3. Caret / Cursor Positioning on Programmatic Focus
### Symptom
When programmatically focusing a textarea or input containing default placeholder text (like `"New Text"`), the text cursor/caret defaults to the beginning of the text (`|New Text`) instead of the end (`New Text|`), which is counter-intuitive for typing.

### Focus Correction Pattern
- When executing `.focus()`, immediately read the input's current value length and set the selection range to place the caret at the end of the text.

```javascript
if (isTextarea) {
  element.focus();
  const len = element.value.length;
  element.setSelectionRange(len, len);
}
```

---

## 4. Visibility and Contrast for Overlaid Text
### Symptom
Adding text overlay to colored shapes (such as purple circles or dark grey boxes) renders the text or caret invisible, making it look like the shape is uneditable or behind the graphic layer.

### Solution
- Ensure the default state mapping of new shapes configures a high-contrast combination:
  - Background fill: `#8b5cf6` (solid purple) -> Text color: `#ffffff` (white).
  - Background fill: `#f3f4f6` (light grey) -> Text color: `#000000` (black).
- Never initialize text color to match the background color of the shape overlay, as it obscures the cursor and the input placeholder.
