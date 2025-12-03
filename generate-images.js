#!/usr/bin/env node

/**
 * Script para crear imágenes placeholder para el menú
 * Ejecutar: npm run generate-images
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'public', 'menu-images');

// Crear directorio si no existe
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Colores para diferentes categorías
const CATEGORY_COLORS = {
  'Rollos Naturales': '#E74C3C',
  'Rollos Especiales': '#9B59B6',
  'Rollos Empanizados': '#F39C12',
  'Rollos Horneados': '#D4A574',
  'Entradas': '#3498DB',
  'Arroces': '#F1C40F',
  'Bebidas': '#2ECC71',
  'Postres': '#E67E22',
};

const MENU_ITEMS = {
  'Rollos Naturales': [
    'California Roll',
    'Vegetariano Roll',
    'Atún Roll',
    'Salmón Roll',
  ],
  'Rollos Especiales': [
    'Dragon Roll',
    'Rainbow Roll',
    'Spicy Tuna Roll',
    'Philadelphia Roll',
  ],
  'Rollos Empanizados': [
    'California Tempura',
    'Ebi Tempura Roll',
    'Spicy Shrimp Tempura',
  ],
  'Rollos Horneados': [
    'Baked Salmon Roll',
    'Dynamite Roll',
    'Spicy Baked Scallop',
  ],
  'Entradas': [
    'Edamame',
    'Gyoza',
    'Tempura de Camarón',
    'Sopa Miso',
  ],
  'Arroces': [
    'Arroz Blanco',
    'Arroz Integral',
    'Arroz con Vegetales',
  ],
  'Bebidas': [
    'Agua Mineral',
    'Refresco',
    'Té Verde',
    'Cerveza Japonesa',
  ],
  'Postres': [
    'Helado de Té Verde',
    'Dorayaki',
    'Mochi',
  ],
};

// Usar Canvas para generar imágenes SVG (más ligero que PNG)
function generateSVG(itemName, color) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${color}"/>
  <rect x="10" y="10" width="180" height="180" fill="none" stroke="white" stroke-width="2"/>
  <circle cx="100" cy="80" r="35" fill="white" opacity="0.3"/>
  <text x="100" y="130" font-size="14" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">
    <tspan x="100" dy="0">${itemName}</tspan>
  </text>
</svg>`;
}

console.log('🖼️  Generando imágenes placeholder...\n');

let count = 0;
Object.entries(MENU_ITEMS).forEach(([category, items]) => {
  const color = CATEGORY_COLORS[category] || '#95A5A6';
  console.log(`📁 ${category}:`);

  items.forEach((item) => {
    const filename = `${item.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
    const filepath = path.join(IMAGES_DIR, filename);
    const svg = generateSVG(item, color);

    fs.writeFileSync(filepath, svg);
    console.log(`  ✓ ${filename}`);
    count++;
  });

  console.log();
});

console.log(`✨ Se crearon ${count} imágenes placeholder en ${IMAGES_DIR}`);
