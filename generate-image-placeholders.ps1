# Script para generar placeholders SVG para las imágenes del menú
$menuImagesPath = ".\public\menu-images"

# Array de nombres de imágenes que se necesitan
$imageNames = @(
    "19_Camarones_Mazuhi.jpg",
    "19_Chiles_Mazuhi.jpg",
    "19_Crab_Balls.jpg",
    "19_Kushiagues_de_Queso.jpg",
    "19_Tostada_Tunita.jpg",
    "20_Gohan_Especial.jpg",
    "20_Gohan_Especial_Mixto.jpg",
    "20_Gohan_Especial_Proteina.jpg",
    "20_Yakimeshi.jpg",
    "20_Yakimeshi_Especial.jpg",
    "20_Yakimeshi_Especial_Mixto.jpg",
    "20_Yakimonchis.jpg",
    "21_Apolo.jpg",
    "21_Avocado.jpg",
    "21_Bandera_Roll.jpg",
    "21_California.jpg",
    "21_California_Especial.jpg",
    "21_Fit_Roll.jpg",
    "21_Gusano.jpg",
    "21_Philadelphia.jpg",
    "Arroz_Blanco.svg",
    "Arroz_Integral.svg",
    "Arroz_con_Vegetales.svg"
)

# Crear cada placeholder SVG
foreach ($imageName in $imageNames) {
    $filePath = "$menuImagesPath\$imageName"
    
    if (-not (Test-Path $filePath)) {
        # Cambiar extensión a SVG si es JPG
        if ($imageName -like "*.jpg") {
            $svgName = $imageName -replace "\.jpg$", ".svg"
            $filePath = "$menuImagesPath\$svgName"
        }
        
        # Contenido del SVG placeholder
        $svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#grad1)"/>
  
  <!-- Sushi/Food Icon -->
  <g transform="translate(200, 180)">
    <!-- Plate -->
    <circle cx="0" cy="0" r="80" fill="none" stroke="#f97316" stroke-width="3" opacity="0.6"/>
    
    <!-- Sushi rice -->
    <ellipse cx="0" cy="-10" rx="50" ry="35" fill="#ffd89b" opacity="0.7"/>
    
    <!-- Sushi roll -->
    <rect x="-35" y="5" width="70" height="30" rx="5" fill="#c42127" opacity="0.8"/>
    
    <!-- Rice on top -->
    <circle cx="-20" cy="0" r="6" fill="#ffd89b" opacity="0.7"/>
    <circle cx="0" cy="0" r="6" fill="#ffd89b" opacity="0.7"/>
    <circle cx="20" cy="0" r="6" fill="#ffd89b" opacity="0.7"/>
  </g>
  
  <!-- Text -->
  <text x="200" y="380" text-anchor="middle" font-size="16" fill="#9ca3af" font-family="Arial, sans-serif" opacity="0.7">$([IO.Path]::GetFileNameWithoutExtension($imageName))</text>
</svg>
"@
        
        Set-Content -Path $filePath -Value $svgContent -Encoding UTF8
        Write-Host "✓ Created: $filePath"
    } else {
        Write-Host "✓ Already exists: $filePath"
    }
}

Write-Host "`nAll placeholder images generated successfully!"
