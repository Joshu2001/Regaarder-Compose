# SYSTEM ARCHITECTURE SPECIFICATION & MASTER CREATION PROMPT: REGAARDER VIDEO STUDIO ENGINE (REGAARDER AUTOMATED CINEMA SYSTEM - RACS)

> **Document Type:** Production Architecture Blueprint & Self-Contained System Prompt  
> **Target Audience:** Principal AI Software Architect / Senior Graphics & Video Systems Engineer  
> **Objective:** Build an autonomous, end-to-end AI Video Editing Engine & MCP Server that takes raw narrative text, generated/provided visual assets, and voiceover audio, and automatically synthesizes high-end YouTube documentaries in the **Magnates Media & Regaarder Executive Aesthetic** without manual timeline editing.

---

## PART 1: THE MASTER INITIALIZATION PROMPT
*(Copy and paste the block below into your AI agent or engineering environment to construct the entire system from scratch).*

```markdown
You are the Principal Software Architect and Lead Motion Graphics Engineer tasked with building "Regaarder Video Studio" (RACS), an autonomous AI-native video generation and documentary assembly engine packaged as an MCP (Model Context Protocol) server and Python/Node.js pipeline.

Your objective is to solve the fundamental flaw of generative video: standard tools create generic slideshows, static pans, or noisy military HUDs. You will build an autonomous documentary director that replicates the cinematic, high-tension storytelling of Magnates Media combined with the Apple/Regaarder executive design architecture (diffused frosted glass, restrained typography, zero-pill geometry, and tactile sound design).

The engine must operate on zero manual timeline work:
Input: [Script Text / Transcript] + [Images / Video Clips / AI Prompts] + [Voiceover / Audio Track].
Output: Production-ready 1080p/4K 60FPS MP4 video rendered directly to disk, fully timed, graded, scored, and typeset.

Follow the architectural specifications, core modules, and aesthetic directives outlined below without deviation.
```

---

## PART 2: CORE SYSTEM ARCHITECTURE & COMPONENTS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REGAARDER VIDEO STUDIO ENGINE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [ INPUTS ]                                                                │
│   • Script JSON / SRT timestamps                                            │
│   • Images / Video B-Roll / Screen Captures                                 │
│   • Voiceover Audio / Music Tracks                                          │
│                                                                             │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. NARRATIVE & PACING ANALYZER (AI Brain)                           │   │
│   │ • Semantic stress-word detection ("forces", "monopoly", "trillion") │   │
│   │ • Shot archetype allocation (The Trap, Macro-Micro, Wall of Evidence)│  │
│   │ • Beat-to-frame duration mapping                                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. 2.5D CINEMATIC COMPOSITOR (Pillow / OpenCV / FFmpeg GL)          │   │
│   │ • Mesh parallax (depth estimation & layer separation)               │   │
│   │ • Camera rigs: Parallax Push, Crash-Zoom, Tilt-Drift, Shudder       │   │
│   │ • Optical artifacts: Anamorphic streaks, lens dust, bokeh blur      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. TYPOGRAPHIC KINETIC PLAQUE ENGINE                                │   │
│   │ • Regaarder Frosted Glass Lower Thirds (backdrop-blur, no pills)    │   │
│   │ • Auto-wrapping & text overflow prevention                          │   │
│   │ • Color hierarchy: Silver Platinum, Crimson Alert, Sovereign Gold   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. TACTILE AUDIO SYNTHESIZER & DUCKER                               │   │
│   │ • Voiceover ducking with sidechain compression                      │   │
│   │ • Sub-bass foundation drone (40–50Hz analog sine)                   │   │
│   │ • Mechanical clunks, shutter snaps, and whoosh risers               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   [ OUTPUT ]                                                                │
│   • Broadcast-Ready H.264 / ProRes 422 60FPS Video File                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 3: WHAT DOES NOT EXIST IN STANDARD SOFTWARE (THE SECRET SAUCE)

Standard software (Premiere Pro, DaVinci Resolve, CapCut, Runway) requires manual keyframing, timeline cutting, and subjective eye judgment. This engine must programmatically automate 5 proprietary mechanisms:

### 1. Macro-to-Micro Human Crash Zoom
* **The Problem:** Standard software simply cuts between photos or uses a slow Ken Burns zoom.
* **The RACS Solution:** An automated progressive zoom from a planetary or corporate macro view directly into micro-human details (e.g., zooming from a global network into the eye of an individual in a crowd of millions), featuring:
  * Non-linear exponential acceleration curve ($Zoom(t) = Zoom_{base} \cdot t^{0.35}$).
  * Dynamic shallow depth-of-field focus pull (the foreground and background blur out using optical Gaussian bokeh while the target subject stays tack-sharp).
  * Shutter-flash transition frames (2 frames of white exposure pop + whoosh audio).

### 2. Semantic Stress-Word Synchronizer
* **The Problem:** Captions in CapCut/Premiere are either static chunks or uniform word-by-word karaoke bars without dramatic hierarchy.
* **The RACS Solution:** The engine analyzes the voiceover waveform or syllable timing to detect rhetorical gravity:
  * **Crimson Threat Words** (*"forces"*, *"tracks"*, *"bottleneck"*, *"chokehold"*): Trigger an immediate **camera recoil shudder** ($wiggle(t) \cdot e^{-12t}$), a red metallic foil gradient, and a 50Hz sub-bass impact hit.
  * **Sovereign Gold Words** (*"trillion"*, *"1.4 billion"*, *"empire"*, *"market cap"*): Trigger an anamorphic horizontal lens flare sweep and a golden foil sheen.
  * **Neutral Narrative Words:** Remain in calm, dignified Silver Platinum (`#E2E8F0`).

### 3. The Regaarder Frosted Glass Plaque (Anti-Clutter Guarantee)
* **The Problem:** AI video generators place text directly over messy backgrounds or use ugly, dated solid black rectangular boxes.
* **The RACS Solution:** A mathematically pure, Apple-grade frosted glass lower-third plaque:
  * Surface: `rgba(15, 23, 42, 0.82)` with deep Gaussian backdrop filtration.
  * Border: `1.5px` border with `rgba(255, 255, 255, 0.14)`.
  * Geometry: Strict `rounded-xl` (16px–18px) rectangular outline. **Never render pills or ellipses.**
  * Dynamic bounding box calculation: The plaque width dynamically recalculates to fit the sentence with exactly `48px` of horizontal padding, guaranteeing zero text clipping.

### 4. Banning the "Military HUD / Sniper Reticle" Fallacy
* **The Problem:** When instructed to make things "high tech", AI defaults to sci-fi video game UI: green/red crosshairs, target brackets, coordinate grids, and terminal code.
* **The RACS Solution:** Strict stylistic filter that rejects military tropes in favor of **character-driven documentary cinematography**:
  * Use optical vignette falloff rather than target brackets.
  * Use soft circular spotlight masks (`radial-gradient`) to guide viewer attention.
  * Use clean typography and metric pill callouts rather than raw terminal stdout logs.

### 5. Multi-Layer Tactile Audio Architecture
* **The Problem:** Audio in AI video is either absent or consists of a disjointed background song that competes with the speech.
* **The RACS Solution:** A dedicated audio sub-synthesizer:
  * Generates an ominous, tension-building 40–50Hz low-frequency drone.
  * Injects sub-bass booms (`80Hz → 30Hz exponential pitch drop`) on dramatic interruptions.
  * Sidechains and ducks ambient audio by `-14dB` whenever voiceover is active.

---

## PART 4: MCP (MODEL CONTEXT PROTOCOL) TOOL INTERFACE SPECIFICATION

The engine must expose the following MCP tools so any LLM agent can direct the video editor seamlessly:

### Tool 1: `create_documentary_scene`
* **Purpose:** Render a single high-definition scene with full parallax, typography, and sound.
* **Parameters:**
  ```json
  {
    "script_line": "It forces unprompted updates in the middle of your work.",
    "duration_seconds": 5.5,
    "archetype": "interruption_trap | surveillance_dossier | hardware_choke | macro_micro_crowd | market_titan",
    "visual_assets": ["path/to/desktop.png", "path/to/windows_update.png"],
    "voiceover_audio_path": "path/to/voice.wav",
    "stress_words": [
      { "word": "forces", "accent": "crimson", "trigger_time": 0.95, "camera_shake": true },
      { "word": "unprompted", "accent": "gold", "trigger_time": 1.45, "camera_shake": false }
    ],
    "output_file": "C:/Users/user/Downloads/shot_01.mp4"
  }
  ```

### Tool 2: `stitch_documentary_timeline`
* **Purpose:** Take multiple rendered shots, apply seamless documentary transitions (J-cuts, L-cuts, whoosh glitches), add a master audio score, and produce the final full-length documentary.
* **Parameters:**
  ```json
  {
    "scene_files": ["shot_01.mp4", "shot_02.mp4", "shot_03.mp4", "shot_04.mp4"],
    "background_music_path": "path/to/dark_documentary_drone.mp3",
    "master_output_path": "C:/Users/user/Downloads/Regaarder_Files_Why_Everyone_Hates_Microsoft.mp4"
  }
  ```

### Tool 3: `generate_documentary_asset`
* **Purpose:** When the user does not provide an image or clip, generate the exact Magnates-style asset via local or API image models (Flux, Midjourney, Stable Diffusion, or Web Canvas rasterization) using the codified channel prompts.

---

## PART 5: IMPLEMENTATION STACK & DEPENDENCIES

To build this engine without requiring Adobe Creative Cloud or paid subscriptions, use this open-source stack:
1. **FFmpeg 7.0+ (with libx264, aac, filter_complex, and lavfi):** Master compositing, hardware-accelerated video encoding, audio mixing, and stream generation.
2. **Python 3.10+ (Pillow, NumPy, SciPy):** High-resolution frame-by-frame raster manipulation, camera parallax math, optical bloom, and typography layout.
3. **Web Audio API / NumPy Audio Synthesis:** Procedural generation of sub-bass booms, analog synth tension drones, and cinematic whooshes.
4. **Model Context Protocol (MCP) Python SDK:** Standardized server endpoints enabling seamless agent control.

---

## PART 6: HOW TO USE THIS PROMPT
1. Save this document as `REGAARDER_VIDEO_STUDIO_SPEC.md`.
2. Provide this file to your development agent or coding workspace.
3. Instruct the agent: *"Build the Regaarder Video Studio engine according to this specification, implement the MCP server, and verify the pipeline by rendering the complete sequence for 'Why Everyone Hates Microsoft'."*
