import os
from PIL import Image, ImageDraw

build_dir = r"C:\Users\user\Downloads\Project MOAT\Regaarder Compose\build"
electron_icons_dir = r"C:\Users\user\Downloads\Project MOAT\Regaarder Compose\electron\icons"
os.makedirs(build_dir, exist_ok=True)
os.makedirs(electron_icons_dir, exist_ok=True)

# Semantic Colors (Exact brand constants)
DOC_BG = (139, 92, 246, 255)       # Purple #8B5CF6 / #7C3AED
SHEET_BG = (16, 185, 129, 255)     # Green #10B981
DECK_BG = (249, 115, 22, 255)      # Orange #F97316
WHITEBOARD_BG = (59, 130, 246, 255)# Blue #3B82F6
ROOM_BG = (124, 58, 237, 255)      # Purple #7C3AED

def render_icon(name, size):
    """
    Renders an icon at exact target resolution.
    At small sizes (16, 20, 24, 32px for Windows Explorer context menus),
    we use simplified, high-contrast, pixel-aligned primitives that match
    Regaarder's exact symbol shapes without blurry subpixel collapse.
    At larger sizes (48, 64, 128, 256px), full geometry is rendered.
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 1. Base Squircle Badge
    # Corner radius scales cleanly (2px at 16px, 3px at 24px, 4px at 32px, up to 48px at 256px)
    if size <= 20:
        pad = 1
        r = 3
    elif size <= 32:
        pad = 2
        r = 5
    elif size <= 64:
        pad = 4
        r = 10
    elif size <= 128:
        pad = 10
        r = 24
    else:
        pad = 24
        r = 48

    bg_color = {
        "doc": DOC_BG,
        "sheet": SHEET_BG,
        "deck": DECK_BG,
        "whiteboard": WHITEBOARD_BG,
        "room": ROOM_BG
    }[name]

    draw.rounded_rectangle([pad, pad, size - pad - 1, size - pad - 1], radius=r, fill=bg_color)
    
    # 2. Draw Symbol matching Regaarder icon grammar
    if name == "doc":
        # Document: Clean white page with corner fold and text lines
        if size == 16:
            # 16x16: 8x11 page at (4, 2)
            draw.rectangle([4, 2, 8, 13], fill=(255, 255, 255, 255))
            draw.rectangle([8, 5, 11, 13], fill=(255, 255, 255, 255))
            # Fold corner:
            draw.rectangle([9, 2, 11, 4], fill=(221, 214, 254, 255))
            # 2 High-contrast document lines:
            draw.line([(5, 7), (9, 7)], fill=bg_color, width=1)
            draw.line([(5, 9), (9, 9)], fill=bg_color, width=1)
            draw.line([(5, 11), (8, 11)], fill=bg_color, width=1)
        elif size <= 32:
            x0, y0, x1, y1 = int(size * 0.28), int(size * 0.22), int(size * 0.72), int(size * 0.78)
            fold = max(3, int(size * 0.14))
            sheet_pts = [(x0, y0), (x1 - fold, y0), (x1, y0 + fold), (x1, y1), (x0, y1)]
            draw.polygon(sheet_pts, fill=(255, 255, 255, 255))
            fold_pts = [(x1 - fold, y0), (x1 - fold, y0 + fold), (x1, y0 + fold)]
            draw.polygon(fold_pts, fill=(221, 214, 254, 255))
            
            # Content lines
            line_w = max(1, int(size * 0.04))
            line_x0 = x0 + max(2, int(size * 0.08))
            line_x1 = x1 - max(2, int(size * 0.08))
            y_start = y0 + fold + max(2, int(size * 0.06))
            gap = max(2, int(size * 0.10))
            draw.line([(line_x0, y_start), (line_x1, y_start)], fill=bg_color, width=line_w)
            draw.line([(line_x0, y_start + gap), (line_x1, y_start + gap)], fill=bg_color, width=line_w)
            draw.line([(line_x0, y_start + gap * 2), (line_x0 + int((line_x1 - line_x0)*0.6), y_start + gap * 2)], fill=bg_color, width=line_w)
        else:
            px0, py0, px1, py1 = int(size * 0.30), int(size * 0.25), int(size * 0.70), int(size * 0.75)
            fold = int(size * 0.12)
            sheet_pts = [(px0, py0), (px1 - fold, py0), (px1, py0 + fold), (px1, py1), (px0, py1)]
            draw.polygon(sheet_pts, fill=(255, 255, 255, 255))
            fold_pts = [(px1 - fold, py0), (px1 - fold, py0 + fold), (px1, py0 + fold)]
            draw.polygon(fold_pts, fill=(221, 214, 254, 255))
            draw.line([(px1 - fold, py0), (px1 - fold, py0 + fold), (px1, py0 + fold)], fill=(167, 139, 250, 255), width=max(1, int(size*0.01)))
            line_h = max(2, int(size * 0.035))
            r_l = max(1, int(line_h / 2))
            lx0, lx1 = int(size * 0.37), int(size * 0.63)
            draw.rounded_rectangle([lx0, int(size * 0.46), lx1, int(size * 0.46) + line_h], radius=r_l, fill=bg_color)
            draw.rounded_rectangle([lx0, int(size * 0.54), lx1, int(size * 0.54) + line_h], radius=r_l, fill=bg_color)
            draw.rounded_rectangle([lx0, int(size * 0.62), int(size * 0.55), int(size * 0.62) + line_h], radius=r_l, fill=bg_color)

    elif name == "sheet":
        # Sheet: Grid table with header bar
        if size == 16:
            draw.rectangle([3, 3, 12, 12], fill=(255, 255, 255, 255))
            draw.rectangle([3, 3, 12, 5], fill=(5, 150, 105, 255))
            draw.line([(7, 6), (7, 12)], fill=(16, 185, 129, 255), width=1)
            draw.line([(3, 9), (12, 9)], fill=(16, 185, 129, 255), width=1)
        elif size <= 32:
            x0, y0, x1, y1 = int(size * 0.25), int(size * 0.25), int(size * 0.75), int(size * 0.75)
            r_box = max(2, int(size * 0.08))
            draw.rounded_rectangle([x0, y0, x1, y1], radius=r_box, fill=(255, 255, 255, 255))
            hdr_h = max(3, int((y1 - y0) * 0.32))
            draw.rounded_rectangle([x0, y0, x1, y0 + hdr_h], radius=r_box, fill=(5, 150, 105, 255))
            draw.rectangle([x0, y0 + int(hdr_h / 2), x1, y0 + hdr_h], fill=(5, 150, 105, 255))
            mid_x = (x0 + x1) // 2
            mid_y = y0 + hdr_h + (y1 - (y0 + hdr_h)) // 2
            draw.line([(mid_x, y0 + hdr_h), (mid_x, y1)], fill=(16, 185, 129, 255), width=max(1, int(size*0.04)))
            draw.line([(x0, mid_y), (x1, mid_y)], fill=(16, 185, 129, 255), width=max(1, int(size*0.04)))
        else:
            gx0, gy0, gx1, gy1 = int(size * 0.26), int(size * 0.26), int(size * 0.74), int(size * 0.74)
            r_box = max(4, int(size * 0.05))
            draw.rounded_rectangle([gx0, gy0, gx1, gy1], radius=r_box, fill=(255, 255, 255, 255))
            hdr_h = int((gy1 - gy0) * 0.28)
            draw.rounded_rectangle([gx0, gy0, gx1, gy0 + hdr_h], radius=r_box, fill=(5, 150, 105, 255))
            draw.rectangle([gx0, gy0 + int(hdr_h * 0.5), gx1, gy0 + hdr_h], fill=(5, 150, 105, 255))
            grid_line = (16, 185, 129, 220)
            col1 = gx0 + int((gx1 - gx0) * 0.33)
            col2 = gx0 + int((gx1 - gx0) * 0.66)
            row1 = gy0 + hdr_h + int((gy1 - (gy0 + hdr_h)) * 0.5)
            lw = max(1, int(size * 0.016))
            draw.line([(col1, gy0 + hdr_h), (col1, gy1)], fill=grid_line, width=lw)
            draw.line([(col2, gy0 + hdr_h), (col2, gy1)], fill=grid_line, width=lw)
            draw.line([(gx0, row1), (gx1, row1)], fill=grid_line, width=lw)
            draw.rounded_rectangle([gx0, gy0, gx1, gy1], radius=r_box, outline=(5, 150, 105, 255), width=max(1, int(size*0.012)))

    elif name == "deck":
        # Presentation / Deck: Matches canonical Regaarder DeckIcon
        # SVG grammar:
        # - Stacked background slide frame (top-right offset, opacity/tinted)
        # - Primary foreground slide frame (left-bottom offset, crisp white)
        # - 3 stepped metric chart bars (ascending heights)
        if size == 16:
            # Back slide frame (top right: 7,2 to 14,8)
            draw.rectangle([7, 2, 14, 8], outline=(254, 215, 170, 255), width=1)
            # Front slide frame (left bottom: 2,5 to 11,13)
            draw.rectangle([2, 5, 11, 13], fill=(255, 255, 255, 255))
            # 3 stepped metric bars
            draw.line([(4, 11), (4, 9)], fill=bg_color, width=1)
            draw.line([(6, 11), (6, 8)], fill=bg_color, width=1)
            draw.line([(8, 11), (8, 7)], fill=bg_color, width=1)
        elif size <= 32:
            # Back slide frame
            bx0, by0, bx1, by1 = int(size * 0.38), int(size * 0.18), int(size * 0.84), int(size * 0.58)
            r_back = max(1, int(size * 0.06))
            draw.rounded_rectangle([bx0, by0, bx1, by1], radius=r_back, outline=(254, 215, 170, 220), width=max(1, int(size*0.04)))
            # Front slide frame
            fx0, fy0, fx1, fy1 = int(size * 0.16), int(size * 0.34), int(size * 0.72), int(size * 0.82)
            r_front = max(2, int(size * 0.07))
            draw.rounded_rectangle([fx0, fy0, fx1, fy1], radius=r_front, fill=(255, 255, 255, 255))
            # 3 stepped metric bars
            base_y = fy1 - max(2, int((fy1 - fy0) * 0.18))
            bw = max(1, int(size * 0.04))
            bar1_x = fx0 + int((fx1 - fx0) * 0.26)
            bar2_x = fx0 + int((fx1 - fx0) * 0.50)
            bar3_x = fx0 + int((fx1 - fx0) * 0.74)
            h1 = int((fy1 - fy0) * 0.30)
            h2 = int((fy1 - fy0) * 0.45)
            h3 = int((fy1 - fy0) * 0.60)
            draw.line([(bar1_x, base_y), (bar1_x, base_y - h1)], fill=bg_color, width=bw)
            draw.line([(bar2_x, base_y), (bar2_x, base_y - h2)], fill=bg_color, width=bw)
            draw.line([(bar3_x, base_y), (bar3_x, base_y - h3)], fill=bg_color, width=bw)
        else:
            # 48px - 256px
            # Canonical DeckIcon: back slide path d="M9 4.5h9.5A1.5 1.5 0 0 1 20 6v7.5"
            # front slide rect x="3.5" y="8" width="13.5" height="11.5" rx="1.75"
            # lines at 6.5 (15->12), 9.5 (15->13.5), 12.5 (15->11)
            scale = size / 24.0
            # Back slide frame
            bx0, by0, bx1, by1 = int(9 * scale), int(4.5 * scale), int(20 * scale), int(14.5 * scale)
            r_back = max(2, int(1.5 * scale))
            lw_back = max(2, int(1.4 * scale))
            draw.rounded_rectangle([bx0, by0, bx1, by1], radius=r_back, outline=(254, 215, 170, 200), width=lw_back)
            
            # Front slide frame
            fx0, fy0, fx1, fy1 = int(3.5 * scale), int(8 * scale), int(17.5 * scale), int(19.8 * scale)
            r_front = max(3, int(1.8 * scale))
            draw.rounded_rectangle([fx0, fy0, fx1, fy1], radius=r_front, fill=(255, 255, 255, 255))
            
            # Stepped bars
            bar_w = max(2, int(1.5 * scale))
            draw.line([(int(6.8 * scale), int(17 * scale)), (int(6.8 * scale), int(13.2 * scale))], fill=bg_color, width=bar_w)
            draw.line([(int(10.5 * scale), int(17 * scale)), (int(10.5 * scale), int(11.4 * scale))], fill=bg_color, width=bar_w)
            draw.line([(int(14.2 * scale), int(17 * scale)), (int(14.2 * scale), int(9.6 * scale))], fill=bg_color, width=bar_w)

    elif name == "whiteboard":
        # Whiteboard: Matches canonical Regaarder WhiteboardIcon
        # SVG grammar:
        # - Canvas board frame: rect x="3.5" y="3.5" width="17" height="13.5" rx="2"
        # - Stand / easel feet: path d="M7.5 17L6 20.5M16.5 17L18 20.5"
        # - Creative mark: angled stroke to focal node: path d="M7.5 12.5L12.5 7.5", circle cx="15.5" cy="7.5" r="1.25"
        if size == 16:
            # 16x16: Canvas frame at (2, 2) to (13, 11)
            draw.rectangle([2, 2, 13, 11], fill=(255, 255, 255, 255))
            # Stand feet (angled out)
            draw.point([(3, 12)], fill=(255, 255, 255, 255))
            draw.point([(2, 13)], fill=(255, 255, 255, 255))
            draw.point([(12, 12)], fill=(255, 255, 255, 255))
            draw.point([(13, 13)], fill=(255, 255, 255, 255))
            # Creative angled gesture mark & focal node
            draw.line([(4, 9), (8, 5)], fill=bg_color, width=1)
            draw.rectangle([9, 4, 11, 6], fill=bg_color)
        elif size <= 32:
            scale = size / 24.0
            # Canvas frame
            bx0, by0, bx1, by1 = int(3.5 * scale), int(3.5 * scale), int(20.5 * scale), int(17 * scale)
            r_frame = max(2, int(2 * scale))
            draw.rounded_rectangle([bx0, by0, bx1, by1], radius=r_frame, fill=(255, 255, 255, 255))
            # Easel feet
            lw_feet = max(1, int(1.4 * scale))
            draw.line([(int(7.5 * scale), int(17 * scale)), (int(6 * scale), int(21 * scale))], fill=(255, 255, 255, 255), width=lw_feet)
            draw.line([(int(16.5 * scale), int(17 * scale)), (int(18 * scale), int(21 * scale))], fill=(255, 255, 255, 255), width=lw_feet)
            # Creative angled stroke + focal node circle
            stroke_w = max(1, int(1.4 * scale))
            draw.line([(int(7.5 * scale), int(12.5 * scale)), (int(12.5 * scale), int(7.5 * scale))], fill=bg_color, width=stroke_w)
            nr = max(1, int(1.4 * scale))
            cx, cy = int(15.5 * scale), int(7.5 * scale)
            draw.ellipse([cx - nr, cy - nr, cx + nr, cy + nr], fill=bg_color)
        else:
            # 48px - 256px
            scale = size / 24.0
            # Canvas board frame
            bx0, by0, bx1, by1 = int(3.5 * scale), int(3.5 * scale), int(20.5 * scale), int(17 * scale)
            r_frame = max(3, int(2 * scale))
            draw.rounded_rectangle([bx0, by0, bx1, by1], radius=r_frame, fill=(255, 255, 255, 255))
            
            # Easel stand feet
            lw_feet = max(2, int(1.6 * scale))
            draw.line([(int(7.5 * scale), int(17 * scale)), (int(5.5 * scale), int(21 * scale))], fill=(255, 255, 255, 255), width=lw_feet)
            draw.line([(int(16.5 * scale), int(17 * scale)), (int(18.5 * scale), int(21 * scale))], fill=(255, 255, 255, 255), width=lw_feet)
            
            # Creative gesture line (M7.5 12.5L12.5 7.5)
            lw_stroke = max(2, int(1.6 * scale))
            draw.line([(int(7.5 * scale), int(12.5 * scale)), (int(12.5 * scale), int(7.5 * scale))], fill=bg_color, width=lw_stroke)
            
            # Focal node circle (circle cx="15.5" cy="7.5" r="1.25")
            nr = max(2, int(1.5 * scale))
            cx, cy = int(15.5 * scale), int(7.5 * scale)
            draw.ellipse([cx - nr, cy - nr, cx + nr, cy + nr], fill=bg_color)

    elif name == "room":
        # Room: Dual overlapping camera / presence frames
        if size == 16:
            draw.rectangle([3, 3, 9, 8], fill=(196, 181, 253, 220))
            draw.rectangle([6, 6, 12, 11], fill=(255, 255, 255, 255))
            draw.point([(8, 8)], fill=bg_color)
            draw.point([(10, 8)], fill=bg_color)
        elif size <= 32:
            draw.rounded_rectangle([int(size * 0.20), int(size * 0.22), int(size * 0.58), int(size * 0.56)], radius=2, fill=(196, 181, 253, 220))
            draw.rounded_rectangle([int(size * 0.40), int(size * 0.42), int(size * 0.78), int(size * 0.76)], radius=2, fill=(255, 255, 255, 255))
            cam_x0, cam_y0 = int(size * 0.48), int(size * 0.52)
            draw.rectangle([cam_x0, cam_y0, cam_x0 + max(2, int(size*0.12)), cam_y0 + max(2, int(size*0.08))], fill=bg_color)
            draw.polygon([(cam_x0 + max(2, int(size*0.12)) + 1, cam_y0), (cam_x0 + max(2, int(size*0.18)), cam_y0 - 1), (cam_x0 + max(2, int(size*0.18)), cam_y0 + max(2, int(size*0.09))), (cam_x0 + max(2, int(size*0.12)) + 1, cam_y0 + max(2, int(size*0.07)))], fill=bg_color)
        else:
            draw.rounded_rectangle([int(size * 0.28), int(size * 0.29), int(size * 0.60), int(size * 0.56)], radius=max(2, int(size*0.04)), fill=(196, 181, 253, 220))
            draw.rounded_rectangle([int(size * 0.40), int(size * 0.41), int(size * 0.72), int(size * 0.68)], radius=max(2, int(size*0.04)), fill=(255, 255, 255, 255))
            cam_box = [int(size * 0.47), int(size * 0.49), int(size * 0.59), int(size * 0.60)]
            draw.rounded_rectangle(cam_box, radius=2, fill=bg_color)
            draw.polygon([(cam_box[2], int(size * 0.52)), (cam_box[2] + int(size * 0.06), int(size * 0.48)), (cam_box[2] + int(size * 0.06), int(size * 0.61)), (cam_box[2], int(size * 0.57))], fill=bg_color)

    return img

RESOLUTIONS = [256, 128, 64, 48, 32, 24, 20, 16]
NAMES = ["doc", "sheet", "deck", "whiteboard", "room"]

for name in NAMES:
    # Generate tailored bitmap for each resolution
    bitmaps = [render_icon(name, res) for res in RESOLUTIONS]
    
    # Save highest resolution as PNG
    png_path = os.path.join(build_dir, f"{name}.png")
    bitmaps[0].save(png_path, format="PNG")
    
    # Save multi-resolution ICO containing individually tuned pixel representations
    ico_path = os.path.join(build_dir, f"{name}.ico")
    electron_ico_path = os.path.join(electron_icons_dir, f"{name}.ico")
    
    # In PIL, save the first image and append the others
    bitmaps[0].save(
        ico_path,
        format="ICO",
        bitmap_format="bmp",
        append_images=bitmaps[1:]
    )
    bitmaps[0].save(
        electron_ico_path,
        format="ICO",
        bitmap_format="bmp",
        append_images=bitmaps[1:]
    )
    print(f"Generated optimized multi-resolution {name}.ico with {len(RESOLUTIONS)} tuned levels ({RESOLUTIONS})")

print("All optimized Regaarder icons generated successfully!")
