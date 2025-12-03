#!/usr/bin/env node

/**
 * Script para asociar imágenes con items del menú
 */

const db = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'pos.db');
const IMAGES_DIR = path.join(__dirname, 'public', 'menu-images');

const MENU_IMAGES = {
  'California Roll': 'California_Roll.svg',
  'Vegetariano Roll': 'Vegetariano_Roll.svg',
  'Atún Roll': 'At_n_Roll.svg',
  'Salmón Roll': 'Salm_n_Roll.svg',
  'Dragon Roll': 'Dragon_Roll.svg',
  'Rainbow Roll': 'Rainbow_Roll.svg',
  'Spicy Tuna Roll': 'Spicy_Tuna_Roll.svg',
  'Philadelphia Roll': 'Philadelphia_Roll.svg',
  'California Tempura': 'California_Tempura.svg',
  'Ebi Tempura Roll': 'Ebi_Tempura_Roll.svg',
  'Spicy Shrimp Tempura': 'Spicy_Shrimp_Tempura.svg',
  'Baked Salmon Roll': 'Baked_Salmon_Roll.svg',
  'Dynamite Roll': 'Dynamite_Roll.svg',
  'Spicy Baked Scallop': 'Spicy_Baked_Scallop.svg',
  'Edamame': 'Edamame.svg',
  'Gyoza': 'Gyoza.svg',
  'Tempura de Camarón': 'Tempura_de_Camar_n.svg',
  'Sopa Miso': 'Sopa_Miso.svg',
  'Arroz Blanco': 'Arroz_Blanco.svg',
  'Arroz Integral': 'Arroz_Integral.svg',
  'Arroz con Vegetales': 'Arroz_con_Vegetales.svg',
  'Agua Mineral': 'Agua_Mineral.svg',
  'Refresco': 'Refresco.svg',
  'Té Verde': 'T__Verde.svg',
  'Cerveza Japonesa': 'Cerveza_Japonesa.svg',
  'Helado de Té Verde': 'Helado_de_T__Verde.svg',
  'Dorayaki': 'Dorayaki.svg',
  'Mochi': 'Mochi.svg',
};

const database = new db.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a BD:', err);
    process.exit(1);
  }

  console.log('🖼️  Asociando imágenes con items del menú...\n');

  let updated = 0;

  Object.entries(MENU_IMAGES).forEach(([itemName, imageName]) => {
    const imagePath = `/menu-images/${imageName}`;

    database.run(
      `UPDATE menu_items SET imagen_local = ? WHERE nombre = ?`,
      [imagePath, itemName],
      function (err) {
        if (err) {
          console.error(`❌ Error actualizando "${itemName}":`, err);
        } else if (this.changes > 0) {
          console.log(`✓ ${itemName} → ${imageName}`);
          updated++;
        }

        if (updated === Object.entries(MENU_IMAGES).length) {
          console.log(`\n✨ Se actualizaron ${updated} items con imágenes`);
          database.close();
          process.exit(0);
        }
      }
    );
  });
});

database.on('error', (err) => {
  console.error('❌ Error en BD:', err);
  process.exit(1);
});
