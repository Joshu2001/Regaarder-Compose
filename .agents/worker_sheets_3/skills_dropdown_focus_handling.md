# Dropdown Focus, Click-Outside, and Text Caret Troubleshooting Guide

Source: c:\Users\user\Downloads\Project MOAT\.agents\skills\dropdown-focus-handling\SKILL.md

Core Methodology:
- Use onPointerDown with e.preventDefault() and e.stopPropagation() on dropdown menu items to avoid losing input focus or triggering outside click / focus shift.
- Strict key interception (preventDefault + stopPropagation) for open menus to prevent leakage to underlying inputs.
