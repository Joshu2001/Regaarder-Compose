# Postmortem: Compose Shapes Visibility and AI Bar Overlap Issue

## Incident Summary
Users reported that shapes inserted into the Compose editor were rendering invisibly. In addition, the Compose AI Bar was failing to hide when shape modification modals (like the Fill/Stroke selector) were open, leading to overlapping UI elements that obstructed the user's workflow. The shapes also contained default "New Text" which the user found undesirable.

## Root Cause Analysis
1. **Invisible Shapes in Compose Mode**: 
   When a user inserted a shape in Compose mode via the shape picker, the `newOverlays.push` logic was assigning the object a `type: 'shape'`. However, the React rendering engine down the tree strictly checked for `overlay.type === 'rectangle'` to render SVG shape graphics. Because of this type mismatch, the shape rendering logic was completely bypassed, and the application fell back to rendering `overlay.content` (which was empty text), causing the shape to appear invisible.
2. **AI Bar Overlap**: 
   The visibility conditions for the Compose AI Bar (`className` in `App.jsx`) were not comprehensive. While it checked for standard text-editor toolbars (`shapeToolbar?.open`, `shapeColorMenu?.open`), it failed to account for `selectedComposeOverlayId`. When an absolute-positioned Compose overlay was selected, its inline Style Panel opened, but the AI Bar remained visible underneath it.
3. **Default Text in Shapes**:
   The default template for inserted overlays in both Sheets and Compose included `content: 'New Text'` and a `placeholder="New Text"` attribute on the textareas rendering over the shapes.

## Resolution Steps
1. **Fixed Shape Type Mismatch**:
   - Modified `App.jsx` at the Compose shape insertion point (around line 28249). Changed `type: 'shape'` to `type: 'rectangle'`.
   - Added default fill (`#8b5cf6`) and color (`#ffffff`) properties to match the exact behavior seen in Sheets mode.
2. **Fixed AI Bar Context Awareness**:
   - Appended `|| selectedComposeOverlayId !== null` to the hiding logic of the Compose AI Bar so that it automatically disappears whenever a Compose overlay is actively selected and its Style Panel is visible.
3. **Removed Default Text**:
   - Removed `content: 'New Text'` from all shape creation initializations (Sheets mode, Compose mode, and freeform layers).
   - Removed the `placeholder="New Text"` string from the `<textarea>` elements wrapping the `rectangle` and `note` overlays so that no text appears unless the user explicitly starts typing.

## Preventative Measures
- When creating abstract UI components (like shape overlays), ensure that the data object structures created by action menus identically match the expected schema consumed by the React rendering loop.
- UI components designed to float (like the AI Bar) must aggregate all possible global modal/overlay active states in their conditional visibility checks.
