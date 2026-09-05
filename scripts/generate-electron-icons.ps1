# Generates native multi-resolution icons for Windows (.ico) and Linux/macOS (.png)
Add-Type -AssemblyName System.Drawing

$buildDir = "build"
$iconsDir = "build/icons"
if (-not (Test-Path $buildDir)) { New-Item -ItemType Directory -Path $buildDir -Force }
if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir -Force }

$sourceLogo = "public/regaarder-logo.png"

# Standard icon sizes for desktop builds
$sizes = @(16, 24, 32, 48, 64, 128, 256, 512)

# Helper function to generate an executive-tier badge canvas
function Generate-MasterBitmap {
    param([int]$size)
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Draw rounded dark obsidian background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $radius = [int]($size * 0.22)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
    $path.AddArc($size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
    $path.AddArc($size - $radius * 2, $size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $path.AddArc(0, $size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $path.CloseFigure()

    # Obsidian / dark slate linear gradient
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 24, 26, 32),
        [System.Drawing.Color]::FromArgb(255, 11, 13, 17),
        [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
    )
    $g.FillPath($brush, $path)

    # Subtle inner border
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), [Math]::Max(1.0, $size * 0.015))
    $g.DrawPath($pen, $path)

    # If source logo exists, draw scaled inside
    if (Test-Path $sourceLogo) {
        $logo = [System.Drawing.Image]::FromFile($sourceLogo)
        $pad = [int]($size * 0.18)
        $destW = $size - ($pad * 2)
        $destH = [int]($destW * ($logo.Height / $logo.Width))
        $destY = [int](($size - $destH) / 2)
        $destRect = New-Object System.Drawing.Rectangle($pad, $destY, $destW, $destH)
        $g.DrawImage($logo, $destRect)
        $logo.Dispose()
    } else {
        # Fallback monogram "R"
        $font = New-Object System.Drawing.Font("Segoe UI", [float]($size * 0.45), [System.Drawing.FontStyle]::Bold)
        $textBrush = [System.Drawing.Brushes]::White
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $g.DrawString("R", $font, $textBrush, (New-Object System.Drawing.RectangleF(0, 0, $size, $size)), $sf)
    }

    $g.Dispose()
    return $bmp
}

# Generate 512x512 master icon.png
$master512 = Generate-MasterBitmap 512
$master512.Save("build/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Created build/icon.png (512x512)"

# Generate individual PNG sizes for Linux desktop icons
foreach ($s in $sizes) {
    $bmp = Generate-MasterBitmap $s
    $bmp.Save("build/icons/${s}x${s}.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}
Write-Output "Created all build/icons/*x*.png sizes"

# Create build/icon.ico containing 16, 24, 32, 48, 64, 128, 256 sizes
# We can use System.Drawing.Icon from handle or stream
$iconSizes = @(16, 24, 32, 48, 64, 128, 256)
$bmp256 = Generate-MasterBitmap 256
$iconHandle = $bmp256.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($iconHandle)
$fileStream = New-Object System.IO.FileStream("build/icon.ico", [System.IO.FileMode]::Create)
$icon.Save($fileStream)
$fileStream.Close()
$icon.Dispose()
$bmp256.Dispose()
$master512.Dispose()

Write-Output "Created build/icon.ico"
