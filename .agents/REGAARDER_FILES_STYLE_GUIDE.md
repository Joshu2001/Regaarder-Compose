# Regaarder Files: Channel Identity & Editorial Style Bible

> **The Vision:** Marrying the psychological drama, 2.5D camera tension, and pacing of **Magnates Media** with the pristine executive restraint, frosted glass architecture, and refined typography of **Regaarder / Apple**.
> 
> *Tagline:* *"Where Corporate Empires Are Deconstructed."*

---

## 1. Visual Philosophy: The Synthesis

```
┌─────────────────────────────────────────────────────────────┐
│                       REGAARDER FILES                       │
├──────────────────────────────┬──────────────────────────────┤
│    MAGNATES MEDIA DNA        │        REGAARDER DNA         │
│  (Tension & Parallax)        │  (Beauty & Architecture)     │
├──────────────────────────────┼──────────────────────────────┤
│ • 2.5D Camera Drift & Push   │ • Frosted Glass Overlays     │
│ • Espionage / Dossier Motifs │ • Restrained Accent Color    │
│ • Tactile Impact Sound Design│ • Clean Rectangular Geometry │
│ • High-Stakes Kinetic Drama  │ • Official Spiral AI Icon    │
│ • Aggressive Focal Contrast  │ • Refined Serif Typography   │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 2. Typographic Identity & Kinetic Subtitles

### A. The Master Type Pairing
* **Primary Narration (The Voice of Authority):**  
  * **Font:** `Cinzel` / `Georgia Pro` / `Canela` (Bold Serif)
  * **Tracking:** `+60` to `+100` (Architectural letter-spacing, cinematic wide feel).
  * **Role:** Lower-third kinetic narration plaques and primary documentary chapter headings.
* **Technical HUD & Metadata (The Evidence):**  
  * **Font:** `JetBrains Mono` / `SF Mono` / `Consolas`
  * **Role:** System metrics, IP addresses, dates, timestamps, financial balances.
* **Secondary UI & Interface Labels:**  
  * **Font:** `Plus Jakarta Sans` / `Inter` / `Outfit`

### B. The Kinetic Color Hierarchy Rule
Never use arbitrary multi-color rainbow text. Every color has an intentional narrative meaning:

| Color Accent | Hex Code | Narrative Intent / Emotional Trigger |
| :--- | :--- | :--- |
| **Silver Platinum** | `#E2E8F0` | Neutral baseline narrative text (calm, objective). |
| **Regaarder Crimson** | `#EF4444` | Aggressive corporate greed, system failures, force, tracking, monopoly chokeholds. |
| **Sovereign Gold** | `#F59E0B` | Valuation milestones, $ billions/trillions, executive power, market capitalization. |
| **Electric Cyan / Violet** | `#7C3AED` / `#00F0FF` | Proprietary intelligence, algorithms, official Regaarder signatures. |

---

## 3. UI Chrome & The "Evidence Plaque" Mandate

In standard YouTube documentaries, editors use ugly semi-transparent black boxes or generic Premiere subtitle bars. **Regaarder Files bans generic subtitle boxes.**

### A. The Executive Evidence Plaque (Signature Lower-Third)
Every subtitle or key caption is housed inside a custom **Regaarder Diffused Glass Plaque**:
* **Surface:** `rgba(15, 23, 42, 0.82)` with `backdrop-filter: blur(24px) saturate(180%)`.
* **Border:** Clean `1.5px` border with `rgba(255, 255, 255, 0.14)`.
* **Geometry:** `rounded-xl` (14px–18px radius) — **strictly zero pills** (`rounded-full` is forbidden).
* **Lighting:** Diffused multi-layer drop shadow:
  ```css
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 16px 40px -8px rgba(0, 0, 0, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  ```

---

## 4. Camera, Motion & 2.5D Dimensionality

1. **The Inevitable Push-In (Z-Axis Drift):**
   * No shot ever sits completely stationary.
   * Every scene has an imperceptible `100% → 106%` slow camera push-in over 5 seconds to build subconscious tension.
2. **2.5D Parallax Offset:**
   * Break every asset into 3 discrete visual layers:
     * **Background:** Dark studio void, particle dust, anamorphic light streak.
     * **Midground (Hero):** The document, UI window, stock chart, or portrait.
     * **Foreground:** Floating HUD telemetry data, lens flares, glass reflections.
3. **The Interruption Shockwave (Decaying Camera Shake):**
   * On major plot turns or disruptive words (*"forces"*, *"crashes"*, *"hijacked"*), apply a momentary camera shudder:
     * Exponential decay: `wiggle(35, 14) * exp(-time * 10)` over 0.25 seconds.
     * Accompanied by a 2-frame subtle chromatic aberration / white glitch flash.

---

## 5. Lighting, Texture & Film Artifacts

* **Anamorphic Light Sweeps:**
  * Diagonal light streaks (`skewX(-24deg)`) sweeping smoothly across glass surfaces, giving the impression of physical optical lenses.
* **Atmospheric Film Dust:**
  * 30–40 tiny floating dust particles motes in the background void to prevent dead digital space.
* **Restrained Scanlines:**
  * Ultra-fine 1-pixel micro-scanlines (opacity 5–8%), giving a high-end monitor look without obscuring details.

---

## 6. Official Brand Signature: The Regaarder AI Glyph

Whenever AI, intelligence, proprietary analysis, or the "Regaarder Files" badge appears on screen:
* **The Mandate:** Strictly use the **official Regaarder Spiral Intelligence Icon** (`RegaarderAiIcon`).
* **Zero Generic Sparkles:** Never use generic 4-point stars or sparkles from generic icon packs. The circular spiral is the unified stamp of this channel.

---

## 7. Sound Design Architecture (The Invisible 70%)

A Magnates/Regaarder video is defined by tactile, weight-bearing audio:

```
[Audio Stack]
├── 1. The Sub-Bass Foundation: Low 40–55Hz analog synth drone (tension)
├── 2. The Narrative Impact: 80Hz sine drop + mechanical metallic clunk on red key words
├── 3. The Evidence Ticks: Short 900Hz triangle clicks on kinetic typography reveals
└── 4. Ambient Texture: Faint tape hiss or pink noise simulating high-end studio gear
```

---

## 8. Permanent Production Checklist for Every Scene

Before exporting any clip for *Regaarder Files*, run this 5-point verification:

- [ ] **1. Typography Check:** Is the narration in tracked serif (`Cinzel`/`Georgia`), with key words accented in Red (`#EF4444`) or Gold (`#F59E0B`)?
- [ ] **2. Glass Plaque Check:** Is the text contained in an executive frosted glass plaque with crisp rounded-rect borders (no pills, no text spillover)?
- [ ] **3. Motion Check:** Is the camera pushing in continuously with 2.5D depth?
- [ ] **4. Depth Check:** Does the scene have background particles, anamorphic flare, and vignette?
- [ ] **5. Sound Check:** Is there a sub-bass foundation and synchronized impact hits on key emphasis words?
