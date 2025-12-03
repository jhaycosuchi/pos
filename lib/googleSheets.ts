import { google } from 'googleapis';
import { getGoogleServiceAccountEmail, getGooglePrivateKey } from './getEnv';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/spreadsheets'
];

export interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  nuevo?: boolean;
  vegetariano?: boolean;
  picante?: boolean;
  favorito?: boolean;
  destacado?: boolean;
  promomiercoles?: boolean;
}

export interface MenuCategory {
  nombre: string;
  items: MenuItem[];
}

function getGoogleSheetsClient() {
  const email = getGoogleServiceAccountEmail();
  const key = getGooglePrivateKey();
  
  if (!email || !key) {
    throw new Error('Google Sheets credentials no disponibles');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
}

// Cache para el menú
let menuCache: MenuCategory[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

export const categoryNames = [
  'Entradas',
  'Arroces',
  'Rollos_Naturales',
  'Rollos_Empanizados',
  'Rollos_Especiales',
  'Rollos_Horneados',
  'Bebidas',
  'Postres',
  'Extras'
];

export async function getMenu(): Promise<MenuCategory[]> {
  // Verificar si el cache es válido
  if (menuCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return menuCache;
  }

  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID no está configurado');
    }

    const sheets = getGoogleSheetsClient();
    const categories: MenuCategory[] = [];

    for (const categoryName of categoryNames) {
      try {
        const range = `${categoryName}!A:J`; // Columnas A-J (10 columnas)

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        const rows = response.data.values || [];

        // Saltar la primera fila (headers)
        const items: MenuItem[] = rows.slice(1).map((row: any[]) => ({
          nombre: row[0] || '',
          descripcion: row[1] || '',
          precio: parseFloat(row[2]) || 0,
          imagen_url: row[3] || '',
          nuevo: row[4]?.toLowerCase() === 'true' || row[4]?.toLowerCase() === 'si',
          vegetariano: row[5]?.toLowerCase() === 'true' || row[5]?.toLowerCase() === 'si',
          picante: row[6]?.toLowerCase() === 'true' || row[6]?.toLowerCase() === 'si',
          favorito: row[7]?.toLowerCase() === 'true' || row[7]?.toLowerCase() === 'si',
          destacado: row[8]?.toLowerCase() === 'true' || row[8]?.toLowerCase() === 'si',
          promomiercoles: row[9]?.toLowerCase() === 'true' || row[9]?.toLowerCase() === 'si',
        })).filter(item => item.nombre && item.precio > 0);

        categories.push({
          nombre: categoryName.replace('_', ' '),
          items
        });

      } catch (error) {
        console.warn(`Error obteniendo categoría ${categoryName}:`, error);
        // Continuar con otras categorías
      }
    }

    // Actualizar cache
    menuCache = categories;
    cacheTimestamp = Date.now();

    return categories;

  } catch (error) {
    console.error('Error obteniendo menú:', error);
    throw new Error('No se pudo obtener el menú desde Google Sheets');
  }
}

export async function getPlatillosDestacados(): Promise<MenuItem[]> {
  const menu = await getMenu();
  const destacados: MenuItem[] = [];

  menu.forEach(category => {
    category.items.forEach(item => {
      if (item.destacado || item.favorito) {
        destacados.push({
          ...item,
          categoria: category.nombre
        } as MenuItem & { categoria: string });
      }
    });
  });

  return destacados;
}

export async function updateMenuItem(categoryName: string, itemName: string, updates: Partial<MenuItem>): Promise<void> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID no está configurado');
    }

    const sheets = getGoogleSheetsClient();

    // Primero obtener la fila del item
    const range = `${categoryName}!A:A`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === itemName);

    if (rowIndex === -1) {
      throw new Error('Item no encontrado');
    }

    // Actualizar la fila específica
    const updateRange = `${categoryName}!A${rowIndex + 1}:J${rowIndex + 1}`;
    const values = [
      updates.nombre || rows[rowIndex][0],
      updates.descripcion || rows[rowIndex][1],
      updates.precio?.toString() || rows[rowIndex][2],
      updates.imagen_url || rows[rowIndex][3],
      updates.nuevo ? 'TRUE' : 'FALSE',
      updates.vegetariano ? 'TRUE' : 'FALSE',
      updates.picante ? 'TRUE' : 'FALSE',
      updates.favorito ? 'TRUE' : 'FALSE',
      updates.destacado ? 'TRUE' : 'FALSE',
      updates.promomiercoles ? 'TRUE' : 'FALSE',
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    // Limpiar cache
    menuCache = null;

  } catch (error) {
    console.error('Error actualizando item del menú:', error);
    throw new Error('No se pudo actualizar el item del menú');
  }
}

export async function addMenuItem(categoryName: string, item: MenuItem): Promise<void> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID no está configurado');
    }

    const sheets = getGoogleSheetsClient();

    const range = `${categoryName}!A:J`;
    const values = [
      item.nombre,
      item.descripcion,
      item.precio.toString(),
      item.imagen_url || '',
      item.nuevo ? 'TRUE' : 'FALSE',
      item.vegetariano ? 'TRUE' : 'FALSE',
      item.picante ? 'TRUE' : 'FALSE',
      item.favorito ? 'TRUE' : 'FALSE',
      item.destacado ? 'TRUE' : 'FALSE',
      item.promomiercoles ? 'TRUE' : 'FALSE',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    // Limpiar cache
    menuCache = null;

  } catch (error) {
    console.error('Error agregando item al menú:', error);
    throw new Error('No se pudo agregar el item al menú');
  }
}