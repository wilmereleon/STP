# Script para redimensionar el icono a 256x256
Add-Type -AssemblyName System.Drawing

$inputPath = "$PSScriptRoot\img\pT.png"
$outputPath = "$PSScriptRoot\build\icon.png"

# Crear directorio build si no existe
if (!(Test-Path "$PSScriptRoot\build")) {
    New-Item -ItemType Directory -Path "$PSScriptRoot\build" | Out-Null
}

try {
    # Cargar imagen original
    $img = [System.Drawing.Image]::FromFile($inputPath)
    
    # Crear nueva imagen de 256x256
    $newImg = New-Object System.Drawing.Bitmap 256, 256
    $graphics = [System.Drawing.Graphics]::FromImage($newImg)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Dibujar imagen redimensionada
    $graphics.DrawImage($img, 0, 0, 256, 256)
    
    # Guardar
    $newImg.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Limpiar
    $graphics.Dispose()
    $newImg.Dispose()
    $img.Dispose()
    
    Write-Host "Icono redimensionado exitosamente a 256x256 en build\icon.png"
} catch {
    Write-Host "Error al redimensionar: $_"
    exit 1
}
