---
name: worktree-sync-debugging
description: Post-mortem and reusable checklist for when UI changes are not visible in the user's browser despite being committed. Covers the dual-directory trap (git worktrees vs actual project folder), multi-branch divergence, Vite hot-reload failures, and the definitive fix strategy.
---

# Worktree / Project Directory Sync Debugging

## Overview

This skill documents the root cause analysis and resolution for a class of bugs where an AI agent makes file changes, commits them, pushes them, and confirms success — yet the user reports seeing **no changes whatsoever** in their browser. This is one of the most deceptive failure modes because every individual step (edit, commit, push) succeeds, yet the end result is invisible.

---

## Root Cause: The Dual-Directory Trap

### The Core Problem
The Antigravity agent operates inside a **git worktree** — a separate checked-out copy of the repository managed by the agent system. This worktree lives at a path like:

```
C:\Users\user\.gemini\antigravity\worktrees\[Project Name]\[worktree-branch]\[Project Folder]\
```

The user actual project — the one their dev server (npm run dev) is watching — lives at an entirely different path:

```
C:\Users\user\Downloads\[Project Name]\[Project Folder]\
```

These are **two completely independent directories on disk**. They share the same Git remote (e.g., GitHub), but they are NOT the same files. Editing the worktree does not touch the user project folder in any way.

### Why It Is Invisible
- The user Vite dev server watches Downloads/... for file changes.
- The agent edits worktrees/...
- No files in Downloads/... ever change, so Vite never hot-reloads, and the user sees nothing.

---

## Chronological Failure Log

### Attempt 1 — Edit + Commit + Push (Failed)
**What I did:** Made changes to App.jsx in the worktree, committed, and pushed to the remote branch swift-axis-dips-23h46.

**Why it failed:** The user dev server was watching a completely different directory. The remote push did nothing to the user local Downloads folder.

**Lesson:** Pushing to a remote branch does not update the user local working directory unless they explicitly pull.

---

### Attempt 2 — Tell the User to git pull (Failed)
**What I did:** Instructed the user to run git fetch origin and git reset --hard origin/swift-axis-dips-23h46.

**Why it failed:** The user Downloads project was on the main branch. They were not tracking swift-axis-dips-23h46. Running git reset --hard against a branch they were not on would have been destructive and confusing, and the user did not follow through with these exact commands.

**Lesson:** Never assume the user local project is on the same branch as the agent worktree. Always verify with git branch --show-current in the user project folder before giving git instructions.

---

### Attempt 3 — git pull origin swift-axis-dips-23h46 --ff-only from Downloads (Partially Failed)
**What I did:** Ran git pull origin swift-axis-dips-23h46 --ff-only from within the user Downloads project directory.

**What appeared to succeed:** The pull completed, showing ~242 files being created/updated.

**Why it still failed:** The Downloads project was on the main branch, which had diverged significantly from swift-axis-dips-23h46. While new files from the worktree branch were added to the working tree, the src/App.jsx in the Downloads project was NOT the same file as the one in the worktree. The branches had divergent histories for App.jsx, and the fast-forward did not cleanly overwrite it as expected.

Verification confirmed this: git branch --show-current showed main, and reading App.jsx lines 2018-2037 showed NO modal state variables — meaning the worktree version of App.jsx was never actually placed in the Downloads folder.

**Lesson:** When branches diverge, git pull --ff-only from a different branch is not reliable for ensuring a specific file is updated. Switch to direct file copy immediately.

---

### Attempt 4 — Touching App.jsx to Force Hot-Reload (Failed)
**What I did:** Updated the LastWriteTime timestamp of the Downloads App.jsx using PowerShell to trick Vite into re-reading it.

**Why it failed:** The file content had not actually changed (it was still the old version). Touching a file only triggers hot-reload if the file watcher detects a change AND the content differs from the compiled bundle. Since the content was identical to what Vite had already compiled, no reload happened.

**Lesson:** Touching a file only works if the file content was already correct. If the content is wrong, you must fix the content first.

---

### Attempt 5 — Investigating Multiple Dev Servers (Investigated, Not the Fix)
**What I discovered:** Two node processes running — PID 24708 (serving Downloads on port 5173) and PID 9128 (serving the worktree on port 5174). The user browser was open on 5173, which was serving stale code.

**Why this was not the fix:** Even if we killed the 5174 server, the 5173 server was still serving from Downloads with the wrong App.jsx. The underlying file discrepancy was still the actual problem.

**Lesson:** Multiple dev servers running simultaneously is a warning sign. Always identify which PID owns which port and which directory it is serving from early in debugging.

---

## The Fix — Direct File Copy

**Command used (PowerShell):**
```powershell
Copy-Item "C:\Users\user\.gemini\antigravity\worktrees\Project MOAT\swift-axis-dips-23h46\Regaarder Compose\src\App.jsx" `
  -Destination "C:\Users\user\Downloads\Project MOAT\Regaarder Compose\src\App.jsx" `
  -Force
```

**Why it worked:** This bypasses all Git complexity entirely. It directly writes the correct file content from the worktree to the exact path that the user Vite server is watching. Vite detects the file change via its filesystem watcher, hot-reloads the module, and the browser updates immediately.

**Verification:** Reading the destination App.jsx at lines 2030-2040 confirmed the NotesModal, SummaryModal, and other modal components were now present.

---

## Reusable Diagnostic Checklist

When a user says "I do not see any changes," immediately run through this checklist BEFORE making any more edits:

### Step 1 — Identify The User Real Project Path
```powershell
wmic process where "name='node.exe'" get ProcessId,CommandLine
```
Look for the path in the CommandLine. Compare it against the agent worktree path. If they differ, you are in the dual-directory trap.

### Step 2 — Confirm Which Branch The User Project Is On
```powershell
# Run from the USER project folder (e.g. Downloads), NOT the worktree
git branch --show-current
```
If it is main and the agent is on a feature branch, the user will never see changes via a normal pull.

### Step 3 — Check If The Key Code Actually Exists In The User File
```powershell
Select-String -Path "src\App.jsx" -Pattern "YOUR_KEY_STATE_VARIABLE"
```
Run this from the user project folder. If it returns no results, the file is wrong regardless of what Git says.

### Step 4 — Check For Multiple Dev Servers
```powershell
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in @(5173, 5174, 3000)} | Select-Object LocalPort, OwningProcess
```
Multiple ports = multiple servers. Use wmic to map each PID to its working directory.

### Step 5 — Apply The Fix: Direct File Copy
Skip Git entirely. Copy the specific file directly:
```powershell
Copy-Item "[WORKTREE_PATH]\src\App.jsx" -Destination "[USER_PROJECT_PATH]\src\App.jsx" -Force
```
Vite will hot-reload automatically. This is always the fastest and most reliable fix.

---

## Key Architectural Lessons

1. **Always confirm the user project root early.** At the start of any session, run git branch --show-current and check for node.exe processes in the user actual project folder.

2. **The worktree is not the user project.** The agent workspace is a separate git worktree. Edits there are invisible to the user dev server unless explicitly synced.

3. **Git operations across diverged branches are unreliable for single-file surgery.** Use Copy-Item (PowerShell) or cp (bash) for a guaranteed sync of a single file.

4. **Multiple Vite servers equals guaranteed confusion.** One will be serving stale code. Identify which port the user browser is on and ensure that server is watching the right directory.

5. **Verify file content, not Git status.** git status can show a clean tree while the file content is still wrong. Always check a key identifier string in the actual destination file.

6. **When git pull does not update a specific file**, the branches have diverged for that file. Do NOT keep retrying git operations. Switch to direct file copy immediately.

7. **Touching a file only works if the content is already correct.** It triggers the watcher, not a rewrite. Fix content first, then touch if needed.
