# Chrome Web Store Listing & Distribution Specifications

## 1. Store Metadata & Copywriting

### Extension Name
**Meneur Web Experience — Executive Command Deck**

### Short Title (Max 12 Characters)
**Meneur**

### Summary / Meta Description (Max 132 Characters)
Elevate your workspace with Meneur: schedule management, intentional tab archiving, and contextual focus from a sleek browser dock.

---

### Detailed Description (Markdown / Plain Text Format for Store)

```markdown
Elevate your workspace with the Meneur Web Experience. Bridge real-time schedule management, intentional tab archiving, and contextual focus directly from a sleek, executive-tier browser dock.

---

### Executive Features

⚡ **Sidebar Command Deck**
Access your daily timetable, priority directives, and active time-blocks in a persistent, unobtrusive side panel without leaving your active tab. Toggle anytime with `Cmd/Ctrl+Shift+E` or through the browser action button.

🛡️ **Contextual Focus Enforcement**
Automatically filter low-priority domains and suppress feed distractions during active deep-work blocks to protect your cognitive momentum. Distracting social media feeds and news aggregates are seamlessly intercepted, with quiet in-page status notifications.

📥 **Instant Directive Capture**
Turn research, articles, or emails directly into actionable calendar directives or scheduled tasks with quick inline highlights and global hotkeys (`Cmd/Ctrl+Shift+D`). Directives are anchored to your active calendar block and synced with the universal task queue.

🗂️ **Workspace Tab & Session Archiving**
Automatically group and save active tab sessions tied to specific calendar blocks, allowing you to launch or restore full research workspaces with a single click. Never lose research context between focus switches.

---

### Designed for Cognitive Momentum
• Executive Apple-tier minimalist aesthetic
• Zero telemetry, zero third-party trackers, zero data selling
• Ultra-fast local in-memory state with encrypted credential vaulting
• Works offline and syncs seamlessly with Regaarder Compose
```

---

## 2. Chrome Web Store Single Purpose Description

> "Meneur provides an executive browser side-dock that bridges calendar schedule blocks, intentional tab session archiving, contextual distraction filtering, and instant web-to-task directive capture."

---

## 3. Permission Justifications (Mandatory for Review)

| Permission | Purpose & Technical Justification |
| :--- | :--- |
| `storage` | Required to store user focus rules, custom domain filters, active timetable states, and archived tab session records locally on the user's device (`chrome.storage.local`). |
| `tabs` | Required to query active tab titles and URLs when grouping tabs for Workspace Tab Archiving and when restoring multi-tab research sessions. |
| `activeTab` | Required to access the currently active tab's selected text and page URL when the user triggers the Instant Directive Capture shortcut (`Cmd/Ctrl+Shift+D`). |
| `declarativeNetRequest` | Required for zero-latency, local client-side suppression of user-designated distraction domains (e.g. twitter.com, reddit.com) exclusively during active deep-work calendar blocks. |
| `contextMenus` | Required to add the right-click "Capture into Meneur Directive" action to the browser context menu for selected text. |
| `<all_urls>` (Host Permission) | Required to inject the lightweight `contentScript.js` across research articles, documentation portals, and web tools to support in-page highlight selection capture and display the focus shield toast banner. |

---

## 4. Privacy & Data Handling Disclosures

- **User Data Collection:** None. Meneur does not collect, transmit, or monetize any personally identifiable information (PII), browsing history, or keystrokes.
- **Remote Code:** Zero remote code. All scripts (`background.js`, `contentScript.js`, `popup.js`) are bundled locally within the extension package in compliance with Manifest V3 policies.
- **Analytics & Tracking:** None. No third-party analytics libraries or tracking pixels are included.
- **Network Requests:** All state mutations, focus evaluations, and tab groupings run client-side on the device.

---

## 5. Store Asset Inventory

| Asset Name | Dimensions | Purpose | Location |
| :--- | :---: | :--- | :--- |
| `icon16.png` | 16 × 16 px | Favicon / toolbar icon | `extension/icons/icon16.png` |
| `icon32.png` | 32 × 32 px | Windows taskbar / high-DPI display | `extension/icons/icon32.png` |
| `icon48.png` | 48 × 48 px | Chrome Extensions management page | `extension/icons/icon48.png` |
| `icon128.png` | 128 × 128 px | Chrome Web Store installation & detail | `extension/icons/icon128.png` |
| `promo_small_440x280.png` | 440 × 280 px | Small Promo Tile on Chrome Web Store | `extension/store_assets/promo_small_440x280.png` |
| `marquee_1400x560.png` | 1400 × 560 px | Marquee Large Promo Tile on Store Header | `extension/store_assets/marquee_1400x560.png` |
| `screenshot1_command_deck_1280x800.png` | 1280 × 800 px | Store Screenshot 1: Sidebar Command Deck | `extension/store_assets/screenshot1_command_deck_1280x800.png` |
| `screenshot2_focus_shield_1280x800.png` | 1280 × 800 px | Store Screenshot 2: Contextual Focus Shield | `extension/store_assets/screenshot2_focus_shield_1280x800.png` |
| `screenshot3_directive_capture_1280x800.png` | 1280 × 800 px | Store Screenshot 3: Instant Directive Capture | `extension/store_assets/screenshot3_directive_capture_1280x800.png` |
| `screenshot4_tab_archiving_1280x800.png` | 1280 × 800 px | Store Screenshot 4: Workspace Tab Archiving | `extension/store_assets/screenshot4_tab_archiving_1280x800.png` |
