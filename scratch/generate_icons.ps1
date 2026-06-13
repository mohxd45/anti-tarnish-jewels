[Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null

$sourcePath = "C:\Users\LG GRAM\.gemini\antigravity\brain\bddb60b8-c32e-4523-adfa-ed6057e5bfa9\media__1780901611632.png"
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source image not found at $sourcePath"
    exit 1
}

# Ensure destination directories exist
$publicDir = Join-Path $pwd "public"
if (-not (Test-Path $publicDir)) {
    New-Item -ItemType Directory -Force -Path $publicDir | Out-Null
    Write-Host "Created public directory"
}
$appDir = Join-Path $pwd "app"

# Load source image
$src = [System.Drawing.Image]::FromFile($sourcePath)

# 1. Crop AT monogram (centering on a 600x600 region)
$cropX = 212
$cropY = 150
$cropW = 600
$cropH = 600

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$croppedBmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($croppedBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Save cropped base image temporarily
$tempCropFile = Join-Path $pwd "scratch/cropped_temp.png"
$croppedBmp.Save($tempCropFile, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedBmp.Dispose()
$src.Dispose()

# Helper function to resize the cropped base
function Resize-Crop($targetPath, $width, $height) {
    $baseImg = [System.Drawing.Image]::FromFile($tempCropFile)
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($baseImg, 0, 0, $width, $height)
    $g.Dispose()
    
    # Save image
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $baseImg.Dispose()
    Write-Host "Generated: $targetPath ($width x $height)"
}

# Generate all required sizes
# App Dir Icons
Resize-Crop (Join-Path $appDir "favicon.ico") 32 32
Resize-Crop (Join-Path $appDir "icon.png") 512 512
Resize-Crop (Join-Path $appDir "apple-icon.png") 180 180

# Public Dir Icons
Resize-Crop (Join-Path $publicDir "favicon-16x16.png") 16 16
Resize-Crop (Join-Path $publicDir "favicon-32x32.png") 32 32
Resize-Crop (Join-Path $publicDir "android-chrome-192x192.png") 192 192
Resize-Crop (Join-Path $publicDir "android-chrome-512x512.png") 512 512
Resize-Crop (Join-Path $publicDir "apple-touch-icon.png") 180 180

# Clean up temp file
if (Test-Path $tempCropFile) {
    Remove-Item $tempCropFile -Force
}

Write-Host "Favicons and app icons generation completed successfully!"
