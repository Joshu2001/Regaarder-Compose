# Original User Request

## Initial Request — 2026-06-22T03:44:38Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Redesign the "Data" tab in the Regaarder Sheets application to act as an AI-powered "Omni-Import" hub, prioritizing unstructured data intake over manual spreadsheet editing.

Working directory: c:\Users\user\Downloads\Project MOAT\Regaarder Compose
Integrity mode: development

## Requirements

### R1. Core Layout (Three-Zone Structure)
Implement the central AI import portal as the primary focus, replacing the immediate empty spreadsheet view. Below it, implement a "Quick Creation Row" for AI-generated templates and a "Recent Data Sources" list showing origin files (e.g., .pdf, .mp4, .png).

### R2. Context-Aware AI Sidebar
Replace generic assistant actions in the sidebar with context-aware states:
- Default state: "Import Data", "Generate Sheet", "Build Dashboard", "Ask Questions", "Find Insights"
- Column selected state: "Analyze Data", "Create Formula", "Detect Trends", "Forecast", "Clean Data", "Find Duplicates", "Visualize"
- Multiple datasets state: "Connect Sources", "Match Records", "Merge Tables", "Find Relationships", "Build Database"

### R3. Premium Empty State
Never show an empty spreadsheet grid or "Enter values..." as the primary first-run experience. Instead, show an actionable "What would you like to analyze?" area with actions (Drop files, Paste content, Upload documents, Ask AI) and example prompts (e.g., "Turn this SOP into a tracker", "Create a CRM from this PDF").

### R4. Data Relationships (Signature Feature)
When multiple files are uploaded (e.g., Customers.csv, Orders.xlsx), simulate an AI detection flow that prompts: "I found matching customer IDs across your files. Connect datasets?" Enable one-click relational data building without manual VLOOKUPs or SQL.

### R5. Visual Design Direction
- **Source of Truth:** Use Regaarder's existing spacing, typography, color tokens, and component systems. Do NOT recreate Excel or ribbon-heavy desktop software.
- **Aesthetic Benchmark:** Closer to Notion AI, Linear, Arc Browser, Figma, and Airtable AI.
- **Minimal Surface Noise:** Avoid heavy borders, dense toolbars, excessive separators. Prefer whitespace, soft elevation, and progressive disclosure.
- **Premium AI Experience:** Use subtle shadows, gentle gradients, and smooth micro-interactions. Avoid neon/gaming aesthetics.
- **Visual Hierarchy:** 1. Omni-Import Portal -> 2. AI Suggestions -> 3. Recent Sources -> 4. Templates -> 5. Spreadsheet Workspace.

## Acceptance Criteria

### UI & Layout
- [ ] A first-time user sees the Omni-Import Hub (Drag & Drop, Paste, Upload) instead of a blank spreadsheet grid.
- [ ] The visual hierarchy exactly follows: AI Import Portal -> AI Suggestions -> Recent Sources -> Templates -> Spreadsheet Workspace.
- [ ] The AI Sidebar dynamically updates its options exactly matching the specified states (Default, Column Selected, Multiple Datasets).

### Quality & Verification
- [ ] The code is implemented using existing Regaarder CSS classes and design tokens without introducing conflicting third-party aesthetics.
- [ ] The application successfully builds (`npm run build`) and runs locally without breaking existing routing or state logic.
- [ ] The visual design actively avoids traditional spreadsheet ribbons, achieving the sleekness of modern tools like Notion AI or Linear.

## Follow-up — 2026-06-23T15:28:57Z

# Teamwork Project Prompt

Debug and fix the shape picker modal in the "sheets" view so it displays correctly when a shape is pressed. Investigate the root cause (errors, bugs), rewrite the component if necessary, and finally commit and push the changes.

Working directory: c:/Users/user/Downloads/Project MOAT
Integrity mode: development

## Requirements

### R1. Fix Shape Picker Modal Display
Investigate why the shape picker modal is not displaying in the sheets view when a shape is clicked. Resolve the underlying errors or bugs, or rewrite the modal from scratch if the current implementation is fundamentally flawed.

### R2. Commit and Push Changes
Once the issue is fixed and verified, commit the changes to the repository and push them.

### R3. Automated Verification
Since there are no existing tests, write a quick automated test (e.g., React Testing Library or Playwright) or a programmatic script to verify that clicking a shape successfully renders the shape picker modal in the DOM without errors.

## Acceptance Criteria

### Functionality
- [ ] The shape picker modal correctly renders when a shape is clicked in the sheets view.
- [ ] No console errors occur during the modal opening process.

### Verification
- [ ] An automated test or script is provided and passes, proving the modal renders on click.
- [ ] The fix is committed and pushed to the repository.
