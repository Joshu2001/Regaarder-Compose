# Toolbar Hierarchy & Progressive Disclosure Logic

## Architectural Purpose & Core Thesis
Modern executive-tier interfaces (such as Apple Numbers, Linear, and Figma) reject cluttered, always-on ribbons that compete with the user's focus. However, blindly hiding controls frustrates users if high-frequency editing tools are buried alongside low-frequency administrative buttons.

To achieve an uncompromising, breathable visual environment while preserving immediate muscle memory, all top-bar controls are strictly bifurcated into **In-Flow Editing Tools** and **Peripheral / Administrative Actions**.

---

## 1. The Two Control Tiers

### Tier 1: In-Flow Editing Tools (Always Visible)
These are primary creation, navigation, and error-recovery controls that users interact with continuously during active work.
* **Branded Home Tab**: Provides instant spatial grounding and a zero-friction path back to the workspace dashboard.
* **Document Tabs**: Contextual awareness of open files, inline renaming, and tab switching styled as elevated cards with soft diffusion shadows (`shadow-[0_1px_3px_rgba(0,0,0,0.08)]`).
* **Undo & Redo**:
  * **Why Always Visible**: Undo and Redo are continuous safety nets. When entering formulas, moving cells, or typing paragraphs, users need instant feedback on whether a mutation can be reverted (`canUndo` / `canRedo`). Hiding them forces users to blindly guess state or hover just to check if an edit was registered.

### Tier 2: Peripheral & Administrative Actions (Disappear on Work / Reveal on Header Hover)
These are milestone, collaborative, and global configuration actions that occur at the boundaries of a work session.
* **Export Dropdown**: Document export occurs when work is finalized. It has zero utility while typing into a cell or writing a paragraph.
* **Share Button**: Inviting collaborators or copying share links is an infrequent, deliberate milestone action. A prominent colored pill draws persistent, unnecessary visual weight during creative focus.
* **Search (Workspace ⌘K)**: Global workspace searching is primarily triggered via keyboard shortcut or intentional navigation, not cell editing.
* **Edit Replay**: Historical audit and version scrubbing are used for post-mortem review, not typing flow.
* **System Utilities**:
  * Dark Mode Toggle
  * User Profile & Account Status
  * Settings Gear
  * Notifications Bell *(with an intelligent exception for unread alerts)*

---

## 2. Dynamic Interaction Rules

### In-Place Opacity Transitions (Zero Layout Shift)
* Secondary/peripheral controls must transition in-place using CSS opacity:
  ```css
  opacity-0 pointer-events-none group-hover/header:opacity-100 group-hover/header:pointer-events-auto transition-opacity duration-200
  ```
* **Strict Prohibition of DOM Collapsing**: Never conditionally unmount (`&&`) or collapse widths (`w-0`) on hover. Hiding must preserve physical DOM width so adjacent elements never jump, shift, or jitter when the cursor approaches.

### Intelligent Visibility Overrides (State Persistence)
The peripheral group automatically breaks through the hidden state (`opacity-100 pointer-events-auto`) under any of the following conditions:
1. **Active Popover/Menu**: If the user clicked Export, Share, Profile, Notifications, or Replay, the toolbar stays fully visible even if the mouse temporarily moves outside the header.
2. **Unread Notifications**: If `notifications.some(n => n.unread)` is true, the notification indicator remains visible to alert the user of critical incoming events.

---

## 3. Platform-Wide Application Matrix

| Control | State During In-Grid Editing | State on Header Hover | State on Active Dropdown |
| :--- | :--- | :--- | :--- |
| **Home Tab (Brand Logo)** | Visible (100%) | Visible (100%) | Visible (100%) |
| **Document Tabs** | Visible (100%) | Visible (100%) | Visible (100%) |
| **Undo / Redo** | **Visible (100%)** | **Visible (100%)** | **Visible (100%)** |
| **Export** | **Hidden (0%)** | **Visible (100%)** | **Visible (if open)** |
| **Share** | **Hidden (0%)** | **Visible (100%)** | **Visible (if open)** |
| **Search (⌘K)** | Hidden (0%) | Visible (100%) | Visible (100%) |
| **Edit Replay** | Hidden (0%) | Visible (100%) | Visible (if open) |
| **Dark Mode** | Hidden (0%) | Visible (100%) | Visible (100%) |
| **Profile** | Hidden (0%) | Visible (100%) | Visible (if open) |
| **Notifications** | Hidden (0%) *(Unless Unread)* | Visible (100%) | Visible (if open) |
| **Settings** | Hidden (0%) | Visible (100%) | Visible (if open) |

---

## 4. Workspaces Governed
This directive applies identically across all workspace modes:
1. **Sheets**
2. **Compose (Docs)**
3. **Deck (Slides)**
4. **Whiteboard**
5. **Research Browser**
