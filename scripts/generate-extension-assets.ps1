# scripts/generate-extension-assets.ps1
# Generates executive-tier icons, store promo tiles, marquee banners, and screenshots
# for Chrome Web Store distribution.

Add-Type -AssemblyName System.Drawing

$baseDir = Split-Path -Parent $PSScriptRoot
$iconsDir = Join-Path $baseDir "extension\icons"
$storeDir = Join-Path $baseDir "extension\store_assets"

if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null }
if (-not (Test-Path $storeDir)) { New-Item -ItemType Directory -Path $storeDir -Force | Out-Null }

# ── 1. GENERATE EXTENSION ICONS (16, 32, 48, 128) ────────────────────────────
$sizes = @(16, 32, 48, 128)
foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($s, $s)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $rect = New-Object System.Drawing.Rectangle(0, 0, $s, $s)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 124, 58, 237),
        [System.Drawing.Color]::FromArgb(255, 67, 56, 202),
        45.0
    )
    
    $radius = [Math]::Max(2, [int]($s * 0.22))
    $diameter = $radius * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $diameter, $diameter, 180, 90)
    $path.AddArc($s - $diameter, 0, $diameter, $diameter, 270, 90)
    $path.AddArc($s - $diameter, $s - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc(0, $s - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    
    $g.FillPath($brush, $path)
    
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 255, 255, 255), [Math]::Max(1.0, [float]($s * 0.04)))
    $g.DrawPath($pen, $path)

    # Scaled Lightning Zap Glyph
    $zapPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $w = $s * 1.0
    $h = $s * 1.0
    $p1 = New-Object System.Drawing.PointF([float]($w * 0.54), [float]($h * 0.18))
    $p2 = New-Object System.Drawing.PointF([float]($w * 0.28), [float]($h * 0.52))
    $p3 = New-Object System.Drawing.PointF([float]($w * 0.48), [float]($h * 0.52))
    $p4 = New-Object System.Drawing.PointF([float]($w * 0.44), [float]($h * 0.82))
    $p5 = New-Object System.Drawing.PointF([float]($w * 0.72), [float]($h * 0.46))
    $p6 = New-Object System.Drawing.PointF([float]($w * 0.52), [float]($h * 0.46))
    
    $zapPath.AddPolygon(@($p1, $p2, $p3, $p4, $p5, $p6))
    $zapBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPath($zapBrush, $zapPath)

    $fileName = "icon" + $s + ".png"
    $outPath = Join-Path $iconsDir $fileName
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Created $fileName"
}

# ── 2. GENERATE SMALL PROMO TILE (440x280) ──────────────────────────────────
$promoSmallPath = Join-Path $storeDir "promo_small_440x280.png"
$bmpSmall = New-Object System.Drawing.Bitmap(440, 280)
$gSmall = [System.Drawing.Graphics]::FromImage($bmpSmall)
$gSmall.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gSmall.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Dark executive background
$bgRect = New-Object System.Drawing.Rectangle(0, 0, 440, 280)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bgRect,
    [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
    [System.Drawing.Color]::FromArgb(255, 10, 15, 30),
    90.0
)
$gSmall.FillRectangle($bgBrush, $bgRect)

# Ambient violet glow
$glowRect = New-Object System.Drawing.Rectangle(120, -50, 200, 200)
$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowPath.AddEllipse($glowRect)
$pbg = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
$pbg.CenterColor = [System.Drawing.Color]::FromArgb(70, 124, 58, 237)
$pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 15, 23, 42))
$gSmall.FillPath($pbg, $glowPath)

# Logo Icon in center
$iconRect = New-Object System.Drawing.Rectangle(192, 45, 56, 56)
$iconBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $iconRect,
    [System.Drawing.Color]::FromArgb(255, 124, 58, 237),
    [System.Drawing.Color]::FromArgb(255, 67, 56, 202),
    45.0
)
$iconPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$iconPath.AddArc(192, 45, 20, 20, 180, 90)
$iconPath.AddArc(228, 45, 20, 20, 270, 90)
$iconPath.AddArc(228, 81, 20, 20, 0, 90)
$iconPath.AddArc(192, 81, 20, 20, 90, 90)
$iconPath.CloseFigure()
$gSmall.FillPath($iconBrush, $iconPath)

# Zap glyph in icon
$z1 = New-Object System.Drawing.PointF(223, 56)
$z2 = New-Object System.Drawing.PointF(207, 74)
$z3 = New-Object System.Drawing.PointF(219, 74)
$z4 = New-Object System.Drawing.PointF(217, 90)
$z5 = New-Object System.Drawing.PointF(233, 71)
$z6 = New-Object System.Drawing.PointF(221, 71)
$zapSmallPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$zapSmallPath.AddPolygon(@($z1, $z2, $z3, $z4, $z5, $z6))
$gSmall.FillPath([System.Drawing.Brushes]::White, $zapSmallPath)

# Title Text
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 19, [System.Drawing.FontStyle]::Bold)
$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$gSmall.DrawString("Meneur Web Experience", $fontTitle, [System.Drawing.Brushes]::White, [float]220, [float]118, $sfCenter)

# Subtitle Text
$fontSub = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
$brushSub = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 148, 163, 184))
$gSmall.DrawString("Executive Browser Command Deck", $fontSub, $brushSub, [float]220, [float]152, $sfCenter)

# Feature Badges
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 167, 139, 250))
$gSmall.DrawString("Focus Shield  •  Instant Directive Capture  •  Tab Archiving", $fontBadge, $badgeBrush, [float]220, [float]196, $sfCenter)

$bmpSmall.Save($promoSmallPath, [System.Drawing.Imaging.ImageFormat]::Png)
$gSmall.Dispose()
$bmpSmall.Dispose()
Write-Output "Created promo_small_440x280.png"

# ── 3. GENERATE MARQUEE BANNER (1400x560) ───────────────────────────────────
$marqueePath = Join-Path $storeDir "marquee_1400x560.png"
$bmpMarquee = New-Object System.Drawing.Bitmap(1400, 560)
$gMarquee = [System.Drawing.Graphics]::FromImage($bmpMarquee)
$gMarquee.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gMarquee.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Deep executive space background
$mRect = New-Object System.Drawing.Rectangle(0, 0, 1400, 560)
$mBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $mRect,
    [System.Drawing.Color]::FromArgb(255, 11, 15, 25),
    [System.Drawing.Color]::FromArgb(255, 17, 24, 39),
    45.0
)
$gMarquee.FillRectangle($mBrush, $mRect)

# Ambient glow accents
$glow1 = New-Object System.Drawing.Rectangle(850, 40, 500, 500)
$gp1 = New-Object System.Drawing.Drawing2D.GraphicsPath
$gp1.AddEllipse($glow1)
$pbg1 = New-Object System.Drawing.Drawing2D.PathGradientBrush($gp1)
$pbg1.CenterColor = [System.Drawing.Color]::FromArgb(50, 124, 58, 237)
$pbg1.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 11, 15, 25))
$gMarquee.FillPath($pbg1, $gp1)

# Left column: Executive typography
$fontBrand = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$brandBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 167, 139, 250))
$gMarquee.DrawString("REGAARDER COMPOSE  |  CHROME WEB STORE", $fontBrand, $brandBrush, [float]80, [float]80)

$fontMTitle = New-Object System.Drawing.Font("Segoe UI", 36, [System.Drawing.FontStyle]::Bold)
$gMarquee.DrawString("Meneur Web Experience", $fontMTitle, [System.Drawing.Brushes]::White, [float]80, [float]115)

$fontMDesc = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Regular)
$descBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 156, 163, 175))
$gMarquee.DrawString("Bridge real-time schedule management, intentional tab archiving,`nand contextual focus directly from a sleek browser dock.", $fontMDesc, $descBrush, [float]80, [float]190)

# Feature bullet badges
$pills = @(
    "⚡  Sidebar Command Deck",
    "🛡️  Contextual Focus Shield",
    "📥  Instant Directive Capture (Cmd+Shift+D)",
    "🗂️  Workspace Tab Archiving"
)
$yPill = 280
foreach ($pill in $pills) {
    $pillRect = New-Object System.Drawing.Rectangle(80, $yPill, 360, 36)
    $pillBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 255, 255, 255))
    $gMarquee.FillRectangle($pillBg, $pillRect)
    $pillPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), 1.0)
    $gMarquee.DrawRectangle($pillPen, $pillRect)
    
    $pillFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $gMarquee.DrawString($pill, $pillFont, [System.Drawing.Brushes]::White, [float]95, [float]($yPill + 8))
    $yPill += 48
}

# Right column: Mockup of the Command Deck Sidebar
$deckRect = New-Object System.Drawing.Rectangle(850, 70, 470, 420)
$deckBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 24, 24, 27))
$gMarquee.FillRectangle($deckBg, $deckRect)
$deckPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 124, 58, 237), 1.5)
$gMarquee.DrawRectangle($deckPen, $deckRect)

# Deck Header
$deckHRect = New-Object System.Drawing.Rectangle(850, 70, 470, 50)
$deckHBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 39, 39, 42))
$gMarquee.FillRectangle($deckHBrush, $deckHRect)
$dTitleFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$gMarquee.DrawString("Meneur Command Deck", $dTitleFont, [System.Drawing.Brushes]::White, [float]870, [float]85)

# 4 Non-pill tabs in mockup
$tabNames = @("Timetable", "Focus", "Capture", "Archives")
$xTab = 870
for ($i = 0; $i -lt 4; $i++) {
    $tRect = New-Object System.Drawing.Rectangle($xTab, 135, 100, 30)
    if ($i -eq 1) {
        $tBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 124, 58, 237))
        $gMarquee.FillRectangle($tBrush, $tRect)
        $tTextBrush = [System.Drawing.Brushes]::White
    } else {
        $tBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 39, 39, 42))
        $gMarquee.FillRectangle($tBrush, $tRect)
        $tTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 161, 161, 170))
    }
    $tPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 255, 255, 255), 1.0)
    $gMarquee.DrawRectangle($tPen, $tRect)
    
    $tFont = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $sfTab = New-Object System.Drawing.StringFormat
    $sfTab.Alignment = [System.Drawing.StringAlignment]::Center
    $gMarquee.DrawString($tabNames[$i], $tFont, $tTextBrush, [float]($xTab + 50), [float]142, $sfTab)
    $xTab += 108
}

# Focus Shield Status Card
$cardRect = New-Object System.Drawing.Rectangle(870, 180, 430, 80)
$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 24, 40, 30))
$gMarquee.FillRectangle($cardBrush, $cardRect)
$cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 34, 197, 94), 1.0)
$gMarquee.DrawRectangle($cardPen, $cardRect)

$cardFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$gMarquee.DrawString("🛡️  Focus Shield: Active", $cardFont, [System.Drawing.Brushes]::White, [float]890, [float]195)
$cardDescFont = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
$cDescBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 187, 247, 208))
$gMarquee.DrawString("8 distraction domains suppressed during Deep Work Block", $cardDescFont, $cDescBrush, [float]890, [float]225)

# Blocked Sites Sample
$sFont = New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Regular)
$sBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 244, 63, 94))
$gMarquee.DrawString("✕  twitter.com (Suppressed)", $sFont, $sBrush, [float]890, [float]280)
$gMarquee.DrawString("✕  youtube.com (Suppressed)", $sFont, $sBrush, [float]890, [float]305)
$gMarquee.DrawString("✕  reddit.com (Suppressed)", $sFont, $sBrush, [float]890, [float]330)

$bmpMarquee.Save($marqueePath, [System.Drawing.Imaging.ImageFormat]::Png)
$gMarquee.Dispose()
$bmpMarquee.Dispose()
Write-Output "Created marquee_1400x560.png"

# ── 4. GENERATE 4 STORE SCREENSHOTS (1280x800) ──────────────────────────────
$screenshots = @(
    @{
        File = "screenshot1_command_deck_1280x800.png"
        Title = "Sidebar Command Deck & Live Timetable"
        Subtitle = "Access daily timetable and active time-blocks in a persistent, unobtrusive dock"
        Tab = "Timetable"
        CardTitle = "Current Block: Deep Work — Infrastructure Strategy (09:00 - 11:30)"
        Detail1 = "• Directive: Deploy ZK-Token Verification Engine"
        Detail2 = "• Directive: Finalize Q3 Cloud Compute Budget"
        Detail3 = "• Context: 4 Research Tabs Anchored"
    },
    @{
        File = "screenshot2_focus_shield_1280x800.png"
        Title = "Contextual Focus Shield & Feed Distraction Suppression"
        Subtitle = "Automatically filter low-priority domains during active deep-work blocks"
        Tab = "Focus Shield"
        CardTitle = "Focus Shield Status: ENFORCING (Deep Work Mode)"
        Detail1 = "• Suppressed: youtube.com, twitter.com, reddit.com"
        Detail2 = "• In-Page Toast: Notification on suppressed navigation attempts"
        Detail3 = "• Rule Management: 1-click domain unblock or custom suppression"
    },
    @{
        File = "screenshot3_directive_capture_1280x800.png"
        Title = "Instant Directive Capture via Global Shortcut"
        Subtitle = "Turn research, articles, or emails into tasks with Cmd/Ctrl+Shift+D"
        Tab = "Quick Capture"
        CardTitle = "Web Highlight Ingestion -> Universal Task Queue"
        Detail1 = "• Highlighted Excerpt: 'TSMC 3nm Node Roadmap and Lead Times'"
        Detail2 = "• Source URL: https://semiconductor.example.com/roadmap"
        Detail3 = "• Action: Dispatched to Marcus Agent with P0 Priority"
    },
    @{
        File = "screenshot4_tab_archiving_1280x800.png"
        Title = "Workspace Tab & Context Session Archiving"
        Subtitle = "Save and restore entire multi-tab sessions tied to calendar blocks"
        Tab = "Tab Archives"
        CardTitle = "Session Archive: Q3 Strategic Hardware Architecture"
        Detail1 = "• Saved Tabs: 6 tabs preserved with URL and favicon state"
        Detail2 = "• Linked Block: block_deep_work_01 (09:00 - 11:30)"
        Detail3 = "• 1-Click Restore: Instantly re-launches complete research workspace"
    }
)

foreach ($sc in $screenshots) {
    $scPath = Join-Path $storeDir $sc.File
    $bmpSc = New-Object System.Drawing.Bitmap(1280, 800)
    $gSc = [System.Drawing.Graphics]::FromImage($bmpSc)
    $gSc.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gSc.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Dark background
    $scRect = New-Object System.Drawing.Rectangle(0, 0, 1280, 800)
    $scBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $scRect,
        [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
        [System.Drawing.Color]::FromArgb(255, 9, 14, 26),
        90.0
    )
    $gSc.FillRectangle($scBg, $scRect)

    # Top Header Banner
    $hdrFont = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)
    $gSc.DrawString($sc.Title, $hdrFont, [System.Drawing.Brushes]::White, [float]60, [float]40)
    
    $subFont = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Regular)
    $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
    $gSc.DrawString($sc.Subtitle, $subFont, $subBrush, [float]60, [float]82)

    # Mock browser window frame
    $frameRect = New-Object System.Drawing.Rectangle(60, 130, 1160, 620)
    $frameBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 24, 24, 27))
    $gSc.FillRectangle($frameBg, $frameRect)
    $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 63, 63, 70), 1.0)
    $gSc.DrawRectangle($framePen, $frameRect)

    # Browser tab bar mockup
    $barRect = New-Object System.Drawing.Rectangle(60, 130, 1160, 40)
    $barBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 39, 39, 42))
    $gSc.FillRectangle($barBg, $barRect)

    # Window control dots
    $gSc.FillEllipse([System.Drawing.Brushes]::Crimson, 80, 144, 12, 12)
    $gSc.FillEllipse([System.Drawing.Brushes]::Goldenrod, 98, 144, 12, 12)
    $gSc.FillEllipse([System.Drawing.Brushes]::SeaGreen, 116, 144, 12, 12)

    # Active page content mockup (left area)
    $pageRect = New-Object System.Drawing.Rectangle(80, 190, 750, 530)
    $pageBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 18, 18, 20))
    $gSc.FillRectangle($pageBg, $pageRect)
    $gSc.DrawRectangle($framePen, $pageRect)

    $pageTitleFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $gSc.DrawString("https://research.enterprise.io/market-brief", $pageTitleFont, [System.Drawing.Brushes]::White, [float]105, [float]215)
    
    $pLineFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
    $pLineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 161, 161, 170))
    $gSc.DrawString("Distributed Inference Architecture & Global Accelerator Allocations", $pLineFont, $pLineBrush, [float]105, [float]250)
    $gSc.DrawString("High performance nodes with hardware-enforced cryptographic integrity...", $pLineFont, $pLineBrush, [float]105, [float]280)

    # Right side: Meneur Command Deck Dock
    $dockRect = New-Object System.Drawing.Rectangle(850, 170, 370, 580)
    $dockBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 30, 30, 35))
    $gSc.FillRectangle($dockBg, $dockRect)
    $dockPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 124, 58, 237), 1.5)
    $gSc.DrawRectangle($dockPen, $dockRect)

    # Dock header
    $dhFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $gSc.DrawString("⚡ Meneur Command Deck", $dhFont, [System.Drawing.Brushes]::White, [float]870, [float]190)

    # Active Tab badge
    $activeTabBadge = New-Object System.Drawing.Rectangle(870, 225, 330, 32)
    $atbBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 124, 58, 237))
    $gSc.FillRectangle($atbBrush, $activeTabBadge)
    $atbFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $gSc.DrawString("Active View: " + $sc.Tab, $atbFont, [System.Drawing.Brushes]::White, [float]885, [float]231)

    # Feature Card in Dock
    $fcRect = New-Object System.Drawing.Rectangle(870, 275, 330, 250)
    $fcBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 39, 39, 45))
    $gSc.FillRectangle($fcBrush, $fcRect)
    $gSc.DrawRectangle($framePen, $fcRect)

    $fcTitleFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $gSc.DrawString($sc.CardTitle, $fcTitleFont, [System.Drawing.Brushes]::White, [float]885, [float]290)

    $detailFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Regular)
    $detBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 203, 213, 225))
    $gSc.DrawString($sc.Detail1, $detailFont, $detBrush, [float]885, [float]335)
    $gSc.DrawString($sc.Detail2, $detailFont, $detBrush, [float]885, [float]380)
    $gSc.DrawString($sc.Detail3, $detailFont, $detBrush, [float]885, [float]425)

    $bmpSc.Save($scPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $gSc.Dispose()
    $bmpSc.Dispose()
    Write-Output ("Created " + $sc.File)
}

Write-Output "All extension assets generated successfully."
