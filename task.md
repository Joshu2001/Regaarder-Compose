# Slash Commands (/) and AI Preview Blocks Implementation

- `[x]` Define slash menu popover state and UI in `src/App.jsx`
- `[x]` Implement editor event listener for keydown `/` and popover rendering coordinates
- `[x]` Implement popover list navigation (Up/Down arrow keys, Enter to select, Escape to close)
- `[x]` Implement in-line prompt input box rendering (`inline-ai-prompt-box`) at text cursor
- `[x]` Implement AI generation router (`handleAIBlockSubmit`) for Table, Bullet points, SVG Graphs, Images, Translate, and Proofread
- `[x]` Implement inline SVG chart builder (`renderSvgChart`) to draw bar, line, and pie charts based on Gemini-returned datasets
- `[x]` Implement preview container wrapping and the Review/Action Banner (`Accept`, `Retry`, `Delete`, `Export`)
- `[x]` Implement refinement / retry execution using the inline banner text input
- `[x]` Implement export HTML sanitization to strip preview containers and action banners
- `[x]` Add vertical scrollbar/scroller height limits and styling to slash menu dropdown
- `[x]` Implement selection preservation to prevent deletion of highlighted text when tapping `/`
- `[x]` Implement selection typing/backspacing safe-capture event filters for slash menu filtering
- `[x]` Implement HTML-preserving DOM clones and full hierarchy restorations for cancelled/deleted selections
- `[x]` Implement block element paragraph routing fallback and empty document error toast validation
- `[x]` Normalize markdown code fences across all text generation models (Translate/Proofread)
- `[x]` Test and build the application
- `[x]` Commit and push to GitHub
