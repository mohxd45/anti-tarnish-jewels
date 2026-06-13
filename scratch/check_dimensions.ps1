[Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null
$img = [System.Drawing.Image]::FromFile("C:\Users\LG GRAM\.gemini\antigravity\brain\bddb60b8-c32e-4523-adfa-ed6057e5bfa9\media__1780901611632.png")
Write-Host "Width:" $img.Width
Write-Host "Height:" $img.Height
$img.Dispose()
