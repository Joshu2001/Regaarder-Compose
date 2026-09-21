import os
import subprocess
import tempfile
from PIL import Image

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BUILD_DIR = r"C:\Users\user\Downloads\Project MOAT\Regaarder Compose\build"
ELECTRON_ICONS_DIR = r"C:\Users\user\Downloads\Project MOAT\Regaarder Compose\electron\icons"
USER_DATA_ICONS_DIR = os.path.expandvars(r"%APPDATA%\regaarder-compose\icons")

os.makedirs(BUILD_DIR, exist_ok=True)
os.makedirs(ELECTRON_ICONS_DIR, exist_ok=True)
os.makedirs(USER_DATA_ICONS_DIR, exist_ok=True)

# SVG templates matching the exact dimensional-2D shapes in AppNativeSvgIcon.jsx
SVG_TEMPLATES = {
    "doc": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" fill="none">
  <defs>
    <linearGradient id="docBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#6D28D9" />
    </linearGradient>
    <linearGradient id="docFoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C4B5FD" />
      <stop offset="100%" stop-color="#A78BFA" />
    </linearGradient>
    <linearGradient id="docBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5B21B6" />
      <stop offset="100%" stop-color="#4C1D95" />
    </linearGradient>
  </defs>
  <path d="M4 22H20C21.1 22 22 21.1 22 20V4L16 1.5H4C2.9 1.5 2 2.4 2 3.5V20C2 21.1 2.9 22 4 22Z" fill="#0F172A" opacity="0.12" transform="translate(0, 1)" />
  <path d="M4.5 1.5H15.5L21.5 7.5V20.5C21.5 21.6 20.6 22.5 19.5 22.5H4.5C3.4 22.5 2.5 21.6 2.5 20.5V3.5C2.5 2.4 3.4 1.5 4.5 1.5Z" fill="url(#docBodyGrad)" />
  <path d="M20.5 7.5V20.5C20.5 21.1 20 21.6 19.4 21.6H20C21 21.2 21.5 20.2 21.5 19.2V7.5H20.5Z" fill="url(#docBevelGrad)" opacity="0.6" />
  <path d="M5 2.2H15C15.3 2.2 15.6 2.4 15.8 2.6L20.8 7.6C21 7.8 21.1 8 21.1 8.3V8.8C20.8 8.4 20.5 8 20 7.7L15.3 3C15.1 2.8 14.8 2.7 14.5 2.7H5C3.8 2.7 2.9 3.4 2.6 4.3C2.8 3.1 3.8 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.45" />
  <path d="M15.5 1.5V6C15.5 6.8 16.2 7.5 17 7.5H21.5L15.5 1.5Z" fill="url(#docFoldGrad)" />
  <path d="M15 7.5L21 7.5L15.5 8.2Z" fill="#4C1D95" opacity="0.4" />
  <rect x="6" y="10" width="10.5" height="2" rx="1" fill="#FFFFFF" />
  <rect x="6" y="13.5" width="8.5" height="1.6" rx="0.8" fill="#DDD6FE" opacity="0.9" />
  <rect x="6" y="16.5" width="6" height="1.4" rx="0.7" fill="#DDD6FE" opacity="0.75" />
</svg>""",

    "sheet": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" fill="none">
  <defs>
    <linearGradient id="sheetBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="sheetBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#065F46" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
  </defs>
  <rect x="2.5" y="3" width="19" height="19" rx="5" fill="#0F172A" opacity="0.12" />
  <rect x="1.5" y="1.5" width="21" height="20.5" rx="5" fill="url(#sheetBodyGrad)" />
  <path d="M17.5 1.7C20 2 22 3.8 22.3 6.5V16.8C22.3 19.5 20.3 21.6 17.6 22H19C21 21.5 22.5 19.8 22.5 17.5V6C22.5 3.5 20.5 1.8 18 1.7H17.5Z" fill="url(#sheetBevelGrad)" opacity="0.55" />
  <path d="M5 2.2H19C20.5 2.2 21.8 3.2 22 4.6C21.6 3.5 20.4 2.7 19 2.7H5C3.6 2.7 2.4 3.5 2 4.6C2.2 3.2 3.5 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.4" />
  <g transform="translate(5, 5)">
    <rect x="0.5" y="1" width="13.5" height="13.5" rx="2.5" fill="#064E3B" opacity="0.45" />
    <rect x="0" y="0" width="14" height="14" rx="2.5" fill="#FFFFFF" />
    <rect x="0" y="0" width="14" height="4.5" rx="2.5" fill="#D1FAE5" />
    <rect x="0" y="2" width="14" height="2.5" fill="#D1FAE5" />
    <line x1="0" y1="4.5" x2="14" y2="4.5" stroke="#10B981" stroke-width="0.8" opacity="0.7" />
    <line x1="0" y1="9.2" x2="14" y2="9.2" stroke="#047857" stroke-width="0.65" opacity="0.25" />
    <line x1="4.8" y1="0" x2="4.8" y2="14" stroke="#047857" stroke-width="0.75" opacity="0.3" />
    <line x1="9.5" y1="4.5" x2="9.5" y2="14" stroke="#047857" stroke-width="0.65" opacity="0.25" />
    <rect x="1.2" y="5.7" width="2.5" height="2.5" rx="0.5" fill="#10B981" />
    <rect x="5.8" y="10.2" width="2.6" height="2.6" rx="0.5" fill="#34D399" opacity="0.7" />
  </g>
</svg>""",

    "deck": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" fill="none">
  <defs>
    <linearGradient id="deckBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F97316" />
      <stop offset="100%" stop-color="#C2410C" />
    </linearGradient>
    <linearGradient id="deckBackSlideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFEDD5" />
      <stop offset="100%" stop-color="#FED7AA" />
    </linearGradient>
    <linearGradient id="deckBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9A3412" />
      <stop offset="100%" stop-color="#7C2D12" />
    </linearGradient>
  </defs>
  <rect x="2" y="4" width="20" height="17" rx="4" fill="#0F172A" opacity="0.12" />
  <rect x="4.5" y="2" width="17" height="12" rx="3" fill="url(#deckBackSlideGrad)" />
  <rect x="4.5" y="2" width="17" height="12" rx="3" stroke="#EA580C" stroke-width="0.5" opacity="0.5" />
  <rect x="1.5" y="4.5" width="21" height="15.5" rx="3.5" fill="url(#deckBodyGrad)" />
  <path d="M18 4.7C20.5 5 22 6.5 22.3 8.5V17C22.3 19 20.5 20 18.5 20H19.5C21.5 19.5 22.5 18 22.5 16V8C22.5 6 21 4.8 18.5 4.7H18Z" fill="url(#deckBevelGrad)" opacity="0.55" />
  <path d="M4 5.2H20C21.2 5.2 22 5.9 22.2 7C21.8 6.1 20.8 5.6 19.5 5.6H4C2.7 5.6 1.7 6.1 1.3 7C1.5 5.9 2.5 5.2 4 5.2Z" fill="#FFFFFF" opacity="0.4" />
  <g transform="translate(4, 7)">
    <rect x="0" y="0" width="16" height="10.5" rx="1.8" fill="#FFFFFF" />
    <rect x="1.5" y="1.5" width="5.5" height="1.4" rx="0.7" fill="#F97316" />
    <rect x="2" y="5.5" width="2.2" height="3.5" rx="0.5" fill="#FED7AA" />
    <rect x="5.2" y="4" width="2.2" height="5" rx="0.5" fill="#FB923C" />
    <rect x="8.4" y="2.5" width="2.2" height="6.5" rx="0.5" fill="#EA580C" />
    <line x1="11.8" y1="4" x2="14.5" y2="4" stroke="#F97316" stroke-width="0.8" stroke-linecap="round" opacity="0.8" />
    <line x1="11.8" y1="6" x2="14.5" y2="6" stroke="#C2410C" stroke-width="0.8" stroke-linecap="round" opacity="0.5" />
    <line x1="11.8" y1="8" x2="13.8" y2="8" stroke="#C2410C" stroke-width="0.8" stroke-linecap="round" opacity="0.5" />
  </g>
</svg>""",

    "whiteboard": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" fill="none">
  <defs>
    <linearGradient id="boardBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="boardBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E40AF" />
      <stop offset="100%" stop-color="#172554" />
    </linearGradient>
  </defs>
  <path d="M4 15L1.5 22.5M20 15L22.5 22.5" stroke="#93C5FD" stroke-width="1.8" stroke-linecap="round" />
  <line x1="12" y1="16" x2="12" y2="23" stroke="#60A5FA" stroke-width="1.4" stroke-linecap="round" />
  <rect x="2.5" y="3" width="19" height="14" rx="3.5" fill="#0F172A" opacity="0.12" />
  <rect x="1.5" y="1.5" width="21" height="15" rx="3.5" fill="url(#boardBodyGrad)" />
  <path d="M17.5 1.7C20 2 22 3.2 22.3 5V13C22.3 14.8 20.5 16 18.5 16.5H19C21 16 22.5 14.8 22.5 13V5C22.5 3.2 21 2 18 1.7H17.5Z" fill="url(#boardBevelGrad)" opacity="0.55" />
  <rect x="8.5" y="0.5" width="7" height="2.2" rx="1.1" fill="#BFDBFE" />
  <rect x="9" y="1" width="6" height="1" rx="0.5" fill="#1D4ED8" opacity="0.4" />
  <path d="M4 2.2H19C20.5 2.2 21.8 2.8 22 3.8C21.6 3 20.4 2.5 19 2.5H4C2.6 2.5 1.4 3 1 3.8C1.2 2.8 2.5 2.2 4 2.2Z" fill="#FFFFFF" opacity="0.4" />
  <g transform="translate(3.5, 3.5)">
    <rect x="0" y="0" width="17" height="11" rx="2" fill="#FFFFFF" />
    <path d="M2.5 8L6.5 4L11 6.5L14.5 3" stroke="#2563EB" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="2.5" cy="8" r="1.1" fill="#3B82F6" />
    <circle cx="6.5" cy="4" r="1.3" fill="#1D4ED8" />
    <circle cx="11" cy="6.5" r="1.1" fill="#60A5FA" />
    <circle cx="14.5" cy="3" r="1.3" fill="#1D4ED8" />
    <rect x="4" y="9.5" width="9" height="1" rx="0.5" fill="#DBEAFE" />
  </g>
</svg>""",

    "room": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" fill="none">
  <defs>
    <linearGradient id="roomBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C3AED" />
      <stop offset="100%" stop-color="#5B21B6" />
    </linearGradient>
    <linearGradient id="roomLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#4C1D95" />
    </linearGradient>
    <linearGradient id="roomBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4C1D95" />
      <stop offset="100%" stop-color="#2E1065" />
    </linearGradient>
  </defs>
  <rect x="2.5" y="3" width="19" height="19" rx="5.5" fill="#0F172A" opacity="0.12" />
  <rect x="1.5" y="1.5" width="21" height="20.5" rx="5.5" fill="url(#roomBodyGrad)" />
  <path d="M17.5 1.7C20 2 22 3.8 22.3 6.5V16.8C22.3 19.5 20.3 21.6 17.6 22H19C21 21.5 22.5 19.8 22.5 17.5V6C22.5 3.5 20.5 1.8 18 1.7H17.5Z" fill="url(#roomBevelGrad)" opacity="0.55" />
  <path d="M5 2.2H19C20.5 2.2 21.8 3.2 22 4.6C21.6 3.5 20.4 2.7 19 2.7H5C3.6 2.7 2.4 3.5 2 4.6C2.2 3.2 3.5 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.4" />
  <g transform="translate(5, 5)">
    <rect x="0.5" y="1" width="14" height="13.5" rx="2.5" fill="#2E1065" opacity="0.45" />
    <rect x="4" y="0.5" width="10" height="9" rx="2.2" fill="#C4B5FD" opacity="0.85" />
    <rect x="0" y="4" width="11" height="9.5" rx="2.2" fill="#FFFFFF" />
    <circle cx="5.5" cy="8.7" r="2.8" fill="url(#roomLensGrad)" />
    <circle cx="4.8" cy="8" r="0.9" fill="#FFFFFF" opacity="0.9" />
    <circle cx="9.2" cy="5.8" r="0.9" fill="#10B981" />
  </g>
</svg>"""
}

RESOLUTIONS = [256, 128, 64, 48, 32, 24, 20, 16]

def render_svg_to_png(svg_content, out_png_path):
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(f"""<!DOCTYPE html>
<html>
<head>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: 256px; height: 256px; background: transparent; overflow: hidden; }}
  svg {{ width: 256px; height: 256px; display: block; }}
</style>
</head>
<body>
{svg_content}
</body>
</html>""")
        html_path = f.name

    try:
        cmd = [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--force-device-scale-factor=1",
            "--default-background-color=00000000",
            "--window-size=256,256",
            f"--screenshot={out_png_path}",
            html_path
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    finally:
        if os.path.exists(html_path):
            os.remove(html_path)

for name, svg in SVG_TEMPLATES.items():
    print(f"Rendering dimensional 2D {name}...")
    temp_png = os.path.join(BUILD_DIR, f"{name}_temp256.png")
    render_svg_to_png(svg, temp_png)

    master_img = Image.open(temp_png).convert("RGBA")

    # Generate multi-resolution images
    bitmaps = [master_img.resize((res, res), Image.Resampling.LANCZOS) for res in RESOLUTIONS]

    # Save 256px PNG
    build_png = os.path.join(BUILD_DIR, f"{name}.png")
    master_img.save(build_png, "PNG")

    # Save multi-res ICO to build, electron/icons, and active AppData icons
    build_ico = os.path.join(BUILD_DIR, f"{name}.ico")
    electron_ico = os.path.join(ELECTRON_ICONS_DIR, f"{name}.ico")
    user_data_ico = os.path.join(USER_DATA_ICONS_DIR, f"{name}.ico")

    bitmaps[0].save(build_ico, format="ICO", bitmap_format="bmp", append_images=bitmaps[1:])
    bitmaps[0].save(electron_ico, format="ICO", bitmap_format="bmp", append_images=bitmaps[1:])
    bitmaps[0].save(user_data_ico, format="ICO", bitmap_format="bmp", append_images=bitmaps[1:])

    os.remove(temp_png)
    print(f"  -> Generated {name}.ico ({build_ico}, {electron_ico}, {user_data_ico})")

print("All native Windows icons regenerated to Dimensional 2D successfully!")
