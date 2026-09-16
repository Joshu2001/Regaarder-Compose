import os
from PIL import Image, ImageDraw

build_dir = r"C:\Users\user\Downloads\Project MOAT\Regaarder Compose\build"
os.makedirs(build_dir, exist_ok=True)

SIZE = 256

def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def create_doc_icon():
    # Documents: Rich Purple (#8B5CF6 / #7C3AED)
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    margin = 16
    radius = 54
    draw_rounded_rect(draw, [margin, margin, SIZE - margin, SIZE - margin], radius, fill=(124, 58, 237, 255))
    draw_rounded_rect(draw, [margin + 4, margin + 4, SIZE - margin - 4, margin + 28], radius=24, fill=(167, 139, 250, 70))
    
    # White folded page
    px0, py0, px1, py1 = 64, 52, 192, 204
    fold_size = 38
    
    sheet_pts = [
        (px0, py0),
        (px1 - fold_size, py0),
        (px1, py0 + fold_size),
        (px1, py1),
        (px0, py1)
    ]
    draw.polygon(sheet_pts, fill=(255, 255, 255, 255))
    
    fold_pts = [
        (px1 - fold_size, py0),
        (px1 - fold_size, py0 + fold_size),
        (px1, py0 + fold_size)
    ]
    draw.polygon(fold_pts, fill=(221, 214, 254, 255))
    draw.line([(px1 - fold_size, py0), (px1 - fold_size, py0 + fold_size), (px1, py0 + fold_size)], fill=(167, 139, 250, 255), width=2)
    
    # Composition text lines
    line_color = (124, 58, 237, 240)
    draw.rounded_rectangle([84, 114, 172, 126], radius=6, fill=line_color)
    draw.rounded_rectangle([84, 142, 172, 154], radius=6, fill=line_color)
    draw.rounded_rectangle([84, 170, 142, 182], radius=6, fill=line_color)
    
    return img

def create_sheet_icon():
    # Sheets: Emerald Green (#10B981 / #059669)
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    margin = 16
    radius = 54
    draw_rounded_rect(draw, [margin, margin, SIZE - margin, SIZE - margin], radius, fill=(5, 150, 105, 255))
    draw_rounded_rect(draw, [margin + 4, margin + 4, SIZE - margin - 4, margin + 28], radius=24, fill=(110, 231, 183, 70))
    
    # White Grid Canvas
    gx0, gy0, gx1, gy1 = 56, 56, 200, 200
    draw.rounded_rectangle([gx0, gy0, gx1, gy1], radius=16, fill=(255, 255, 255, 255))
    
    # Grid header band
    draw.rounded_rectangle([gx0, gy0, gx1, gy0 + 42], radius=16, fill=(16, 185, 129, 255))
    draw.rectangle([gx0, gy0 + 26, gx1, gy0 + 42], fill=(16, 185, 129, 255))
    
    border_color = (5, 150, 105, 220)
    cx1 = 104
    cx2 = 152
    draw.line([(cx1, gy0 + 42), (cx1, gy1)], fill=border_color, width=4)
    draw.line([(cx2, gy0 + 42), (cx2, gy1)], fill=border_color, width=4)
    
    ry1 = 132
    ry2 = 166
    draw.line([(gx0, ry1), (gx1, ry1)], fill=border_color, width=4)
    draw.line([(gx0, ry2), (gx1, ry2)], fill=border_color, width=4)
    
    draw.rounded_rectangle([gx0, gy0, gx1, gy1], radius=16, outline=border_color, width=4)
    return img

def create_deck_icon():
    # Presentation Deck: Vibrant Orange (#F97316 / #EA580C)
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    margin = 16
    radius = 54
    draw_rounded_rect(draw, [margin, margin, SIZE - margin, SIZE - margin], radius, fill=(234, 88, 12, 255))
    draw_rounded_rect(draw, [margin + 4, margin + 4, SIZE - margin - 4, margin + 28], radius=24, fill=(253, 186, 116, 70))
    
    # White Slide Screen Frame
    sx0, sy0, sx1, sy1 = 52, 54, 204, 168
    draw.rounded_rectangle([sx0, sy0, sx1, sy1], radius=16, fill=(255, 255, 255, 255))
    
    # Graphic block + bullets
    draw.rounded_rectangle([72, 74, 114, 116], radius=8, fill=(249, 115, 22, 255))
    bar_color = (251, 146, 60, 240)
    draw.rounded_rectangle([126, 80, 184, 92], radius=6, fill=bar_color)
    draw.rounded_rectangle([126, 104, 184, 116], radius=6, fill=bar_color)
    draw.rounded_rectangle([72, 134, 184, 146], radius=6, fill=(203, 213, 225, 255))
    
    # Easel Stand
    draw.line([(128, 168), (128, 194)], fill=(255, 255, 255, 255), width=8)
    draw.line([(96, 212), (128, 192), (160, 212)], fill=(255, 255, 255, 255), width=8)
    return img

def create_whiteboard_icon():
    # Whiteboard: Creative Azure / Blue (#0284C7 / #0369A1)
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    margin = 16
    radius = 54
    draw_rounded_rect(draw, [margin, margin, SIZE - margin, SIZE - margin], radius, fill=(2, 132, 199, 255))
    draw_rounded_rect(draw, [margin + 4, margin + 4, SIZE - margin - 4, margin + 28], radius=24, fill=(125, 211, 252, 70))
    
    # Whiteboard Canvas Frame
    wx0, wy0, wx1, wy1 = 52, 52, 204, 172
    draw.rounded_rectangle([wx0, wy0, wx1, wy1], radius=16, fill=(255, 255, 255, 255))
    draw.rounded_rectangle([wx0 + 20, wy1 - 8, wx1 - 20, wy1 + 4], radius=4, fill=(186, 230, 253, 255))
    
    # Connected nodes
    node_fill = (2, 132, 199, 255)
    line_col = (14, 165, 233, 255)
    draw.ellipse([72, 72, 102, 102], fill=node_fill)
    draw.ellipse([154, 72, 184, 102], fill=node_fill)
    draw.ellipse([113, 120, 143, 150], fill=(245, 158, 11, 255))
    
    draw.line([(102, 87), (154, 87)], fill=line_col, width=6)
    draw.line([(87, 102), (115, 126)], fill=line_col, width=6)
    draw.line([(169, 102), (141, 126)], fill=line_col, width=6)
    
    draw.line([(80, 172), (64, 212)], fill=(255, 255, 255, 255), width=8)
    draw.line([(176, 172), (192, 212)], fill=(255, 255, 255, 255), width=8)
    return img

generators = {
    "doc": create_doc_icon,
    "sheet": create_sheet_icon,
    "deck": create_deck_icon,
    "whiteboard": create_whiteboard_icon
}

ico_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]

for name, gen in generators.items():
    img_256 = gen()
    png_path = os.path.join(build_dir, f"{name}.png")
    img_256.save(png_path, format="PNG")
    
    ico_path = os.path.join(build_dir, f"{name}.ico")
    img_256.save(ico_path, format="ICO", sizes=ico_sizes)
    print(f"Generated {name}.ico and {name}.png")

print("All icons successfully generated!")
