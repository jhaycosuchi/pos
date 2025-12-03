import { getDb } from './db';
import { getMenu, MenuItem, MenuCategory } from './googleSheets';
import * as fs from 'fs';
import * as path from 'path';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'menu-images');

// Asegurar que el directorio de imágenes existe
function ensureImagesDir() {
  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
      console.log(`Directorio de imágenes creado: ${IMAGES_DIR}`);
    }
  } catch (error) {
    console.error(`Error creando directorio de imágenes: ${error}`);
  }
}

ensureImagesDir();

export async function downloadImage(url: string, filename: string): Promise<string | null> {
  try {
    // Asegurar que el directorio existe
    ensureImagesDir();
    
    const localPath = path.join(IMAGES_DIR, filename);

    // Si la imagen ya existe, devolver la ruta
    if (fs.existsSync(localPath)) {
      console.log(`Imagen existente: ${filename}`);
      return `/menu-images/${filename}`;
    }

    console.log(`Descargando imagen desde: ${url}`);

    // Usar fetch para descargar la imagen
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Error descargando ${url}: ${response.status}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0) {
      console.error(`Imagen vacía: ${url}`);
      return null;
    }

    fs.writeFileSync(localPath, Buffer.from(buffer));
    console.log(`Imagen guardada en: ${localPath}`);
    
    return `/menu-images/${filename}`;
  } catch (error) {
    console.error(`Error descargando imagen ${filename} desde ${url}:`, error);
    return null;
  }
}

export async function syncMenuFromGoogleSheets(): Promise<void> {
  const db = getDb();

  try {
    console.log('Iniciando sincronización completa de menú desde Google Sheets...');
    
    // Deshabilitar FK constraints temporalmente para el sync
    db.pragma('foreign_keys = OFF');
    
    // Crear tablas si no existen
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS menu_categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT UNIQUE NOT NULL,
          orden INTEGER DEFAULT 0,
          activo BOOLEAN DEFAULT 1,
          creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      db.prepare(`
        CREATE TABLE IF NOT EXISTS menu_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          categoria_id INTEGER NOT NULL,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          precio DECIMAL(10,2) NOT NULL,
          imagen_url TEXT,
          imagen_local TEXT,
          nuevo BOOLEAN DEFAULT 0,
          vegetariano BOOLEAN DEFAULT 0,
          picante BOOLEAN DEFAULT 0,
          favorito BOOLEAN DEFAULT 0,
          destacado BOOLEAN DEFAULT 0,
          promomiercoles BOOLEAN DEFAULT 0,
          activo BOOLEAN DEFAULT 1,
          ultima_sync DATETIME DEFAULT CURRENT_TIMESTAMP,
          creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
          actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(categoria_id) REFERENCES menu_categorias(id),
          UNIQUE(categoria_id, nombre)
        )
      `).run();
    } catch (tableError) {
      console.log('Tablas ya existen');
    }
    
    // Obtener menú desde Google Sheets
    const googleMenu = await getMenu();
    console.log(`Menú obtenido con ${googleMenu.length} categorías`);

    let totalItems = 0;
    let itemsConImagen = 0;
    let itemsEliminados = 0;

    // Paso 1: Limpiar todas las categorías y items existentes
    console.log('🧹 Limpiando items antiguos...');
    db.prepare('DELETE FROM menu_items').run();
    db.prepare('DELETE FROM menu_categorias').run();
    console.log('✓ Items y categorías limpios');

    // Paso 2: Procesar cada categoría desde Google Sheets
    for (const category of googleMenu) {
      console.log(`Procesando categoría: ${category.nombre}`);
      
      // Insertar categoría
      db.prepare(
        `INSERT INTO menu_categorias (nombre, activo)
         VALUES (?, 1)`
      ).run(category.nombre);

      // Obtener el ID de la categoría
      const categoriaRow = db.prepare(
        `SELECT id FROM menu_categorias WHERE nombre = ?`
      ).get(category.nombre) as any;
      
      const categoriaId = categoriaRow?.id;
      
      if (!categoriaId) {
        console.error(`✗ No se pudo obtener ID para la categoría: ${category.nombre}`);
        continue;
      }
      
      console.log(`Categoría ${category.nombre} guardada con ID ${categoriaId}`);

      // Procesar items de la categoría
      for (const item of category.items) {
        let imagenLocal = null;

        // Descargar imagen si existe
        if (item.imagen_url && item.imagen_url.trim()) {
          try {
            itemsConImagen++;
            const filename = `${categoriaId}_${item.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
            console.log(`  - Descargando imagen para: ${item.nombre}`);
            imagenLocal = await downloadImage(item.imagen_url, filename);
            if (imagenLocal) {
              console.log(`    ✓ Imagen descargada exitosamente`);
            } else {
              console.log(`    ✗ No se pudo descargar la imagen`);
            }
          } catch (error) {
            console.warn(`  ✗ Error descargando imagen para ${item.nombre}:`, error);
          }
        }

        // Insertar item
        db.prepare(
          `INSERT INTO menu_items (
            categoria_id, nombre, descripcion, precio, imagen_url, imagen_local,
            nuevo, vegetariano, picante, favorito, destacado, promomiercoles,
            activo, ultima_sync, actualizado_en
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`
        ).run(
            categoriaId,
            item.nombre,
            item.descripcion,
            item.precio,
            item.imagen_url || null,
            imagenLocal,
            item.nuevo ? 1 : 0,
            item.vegetariano ? 1 : 0,
            item.picante ? 1 : 0,
            item.favorito ? 1 : 0,
            item.destacado ? 1 : 0,
            item.promomiercoles ? 1 : 0
          );
        
        totalItems++;
      }
    }

    // Reabilitar FK constraints
    db.pragma('foreign_keys = ON');

    console.log(`✓ Sincronización completada:`);
    console.log(`  📊 Total de items: ${totalItems}`);
    console.log(`  🖼️  Items con imágenes: ${itemsConImagen}`);
    console.log(`  🗂️  Categorías: ${googleMenu.length}`);

  } catch (error) {
    // Reabilitar FK constraints en caso de error
    db.pragma('foreign_keys = ON');
    console.error('✗ Error sincronizando menú:', error);
    throw error;
  }
}

export async function getMenuFromDatabase(): Promise<MenuCategory[]> {
  const db = getDb();

  try {
    // Obtener categorías activas
    const categorias = db.prepare(
      'SELECT * FROM menu_categorias WHERE activo = 1 ORDER BY orden, nombre'
    ).all();

    const menu: MenuCategory[] = [];

    for (const categoria of categorias as any[]) {
      // Obtener items activos de la categoría
      const items = db.prepare(
        `SELECT nombre, descripcion, precio, imagen_url, imagen_local,
                nuevo, vegetariano, picante, favorito, destacado, promomiercoles
         FROM menu_items
         WHERE categoria_id = ? AND disponible = 1 AND precio > 0
         ORDER BY nombre`
      ).all(categoria.id);

      // Convertir items al formato esperado
      const menuItems: MenuItem[] = (items as any[]).map((item: any) => ({
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        imagen_url: item.imagen_local || item.imagen_url, // Preferir imagen local
        nuevo: item.nuevo === 1,
        vegetariano: item.vegetariano === 1,
        picante: item.picante === 1,
        favorito: item.favorito === 1,
        destacado: item.destacado === 1,
        promomiercoles: item.promomiercoles === 1,
      }));

      if (menuItems.length > 0) {
        menu.push({
          nombre: categoria.nombre,
          items: menuItems
        });
      }
    }

    return menu;

  } catch (error) {
    console.error('Error obteniendo menú desde base de datos:', error);
    throw error;
  }
}

export async function getMenuItemCount(): Promise<number> {
  const db = getDb();

  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM menu_items WHERE disponible = 1').get() as any;
    return result?.count || 0;
  } catch (error) {
    console.error('Error obteniendo conteo de items:', error);
    return 0;
  }
}