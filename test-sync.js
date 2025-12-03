#!/usr/bin/env node

/**
 * Script de prueba para verificar la sincronización de imágenes
 * Ejecutar: node test-sync.js
 */

const path = require('path');
const fs = require('fs');

async function testSync() {
  console.log('=== Test de Sincronización de Imágenes ===\n');

  try {
    // Verificar directorio de imágenes
    const imagesDir = path.join(process.cwd(), 'public', 'menu-images');
    console.log(`📁 Directorio de imágenes: ${imagesDir}`);
    
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      console.log(`✓ Directorio existe con ${files.length} archivos\n`);
      
      if (files.length > 0) {
        console.log('Archivos:');
        files.forEach(file => {
          const filePath = path.join(imagesDir, file);
          const stats = fs.statSync(filePath);
          console.log(`  - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        });
      }
    } else {
      console.log('✗ Directorio NO existe (será creado en la primera sincronización)\n');
    }

    // Verificar base de datos
    console.log('\n📦 Verificando base de datos...');
    const dbPath = path.join(process.cwd(), 'database', 'pos.db');
    
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`✓ Base de datos encontrada (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      console.log('✗ Base de datos NO encontrada');
    }

    // Información de variables de entorno
    console.log('\n🔑 Variables de entorno requeridas:');
    const requiredEnvs = [
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_SHEET_ID'
    ];

    requiredEnvs.forEach(env => {
      const value = process.env[env];
      if (value) {
        const displayValue = env === 'GOOGLE_PRIVATE_KEY' ? '[REDACTADO]' : value.substring(0, 30) + '...';
        console.log(`  ✓ ${env}: ${displayValue}`);
      } else {
        console.log(`  ✗ ${env}: NO CONFIGURADO`);
      }
    });

    console.log('\n✓ Test de verificación completado');
    console.log('\nPasos para sincronizar manualmente:');
    console.log('1. Abre http://localhost:3000/dashboard/menu');
    console.log('2. Haz click en "Sincronizar con Google Sheets"');
    console.log('3. Espera a que se complete la sincronización');
    console.log('4. Las imágenes deberían aparecer en la tabla');

  } catch (error) {
    console.error('✗ Error durante la verificación:', error);
    process.exit(1);
  }
}

testSync();
