# Google Sheets Menu Synchronization

## 📋 Overview

El sistema POS está completamente integrado con Google Sheets para sincronización bidireccional del menú. Esto permite:

- ✅ Actualizar el menú desde Google Sheets
- ✅ Sincronización automática de cambios
- ✅ Control de inventario desde el dashboard
- ✅ Atributos de productos (vegetariano, picante, destacado, etc.)

## 🔧 Configuración

### 1. Credenciales necesarias

Las credenciales están almacenadas en `.env.local` (protegido en .gitignore):

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=mazuhisushi@rich-surge-477017-s3.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=1zQ8GWmW72NrhspyhF93ZKBnD1TSvnm69O2Gv2EECCUY
```

### 2. Estructura del Google Sheet

El Google Sheet debe tener las siguientes pestañas (sheet names):

- **Entradas**
- **Arroces**
- **Rollos_Naturales**
- **Rollos_Empanizados**
- **Rollos_Especiales**
- **Rollos_Horneados**
- **Bebidas**
- **Postres**
- **Extras**

### 3. Columnas requeridas en cada pestaña

Cada pestaña debe tener las siguientes columnas (A-J):

| Col | Nombre | Tipo | Descripción |
|-----|--------|------|-------------|
| A | Nombre | Text | Nombre del producto |
| B | Descripción | Text | Descripción del producto |
| C | Precio | Number | Precio en formato decimal |
| D | Imagen URL | Text | URL de la imagen del producto |
| E | Nuevo | Boolean | TRUE/FALSE o SI/NO |
| F | Vegetariano | Boolean | TRUE/FALSE o SI/NO |
| G | Picante | Boolean | TRUE/FALSE o SI/NO |
| H | Favorito | Boolean | TRUE/FALSE o SI/NO |
| I | Destacado | Boolean | TRUE/FALSE o SI/NO |
| J | Promo Miércoles | Boolean | TRUE/FALSE o SI/NO |

## 📡 Endpoints de sincronización

### POST /api/menu/sync

Sincroniza el menú desde Google Sheets a la base de datos local.

**Requiere:**
- Autenticación (token JWT en cookie)
- Rol de admin

**Respuesta exitosa:**
```json
{
  "message": "Menú sincronizado exitosamente",
  "success": true
}
```

**Respuesta con error de credenciales:**
```json
{
  "message": "Menú sincronizado exitosamente (usando base de datos local)",
  "success": true,
  "warning": "Google Sheets no está configurado"
}
```

## 🎯 Uso desde el Dashboard

### 1. Acceder a la página del Menú

```
https://operacion.mazuhi.com/pos/dashboard/menu
```

### 2. Sincronizar con Google Sheets

Haz clic en el botón "Sincronizar con Google Sheets" en la parte superior derecha.

### 3. Gestionar productos

- **Editar**: Haz clic en "Editar" para modificar nombre, precio, descripción, imagen
- **Sin Stock**: Marca temporalmente un producto como no disponible
- **Restaurar**: Reactiva un producto marcado como sin stock

## 🔄 Flujo de sincronización

### 1. Sincronización Google Sheets → Base de datos

```
[Google Sheets] 
    ↓
[googleapis Node.js client]
    ↓
[app/api/menu/sync/route.ts]
    ↓
[lib/menuSync.ts]
    ↓
[SQLite Database]
```

### 2. Lectura del menú para mostrar

```
[SQLite Database]
    ↓
[app/api/menu/route.ts]
    ↓
[Frontend (app/dashboard/menu/page.tsx)]
    ↓
[Renderizado de tabla]
```

## 📁 Archivos relevantes

### Backend
- `lib/googleSheets.ts` - Cliente de Google Sheets
- `lib/menuSync.ts` - Lógica de sincronización
- `lib/getEnv.ts` - Carga de credenciales desde .env.local
- `app/api/menu/sync/route.ts` - Endpoint POST de sincronización
- `app/api/menu/route.ts` - Endpoint GET para obtener menú

### Frontend
- `app/dashboard/menu/page.tsx` - Página principal del menú (client-side)

### Configuración
- `.env.local` - Credenciales (no commiteado, protegido en .gitignore)
- `.env.example` - Ejemplo de configuración

## 🐛 Solución de problemas

### "Google Sheets no está configurado"

**Solución:** Verifica que `.env.local` contenga:
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SHEET_ID=...
```

### Error al sincronizar: "Item no encontrado"

**Causa:** La estructura del Google Sheet no coincide con lo esperado.

**Solución:**
1. Verifica los nombres de las pestañas (sheets)
2. Asegúrate de que la primera fila contenga headers (A1 debe ser "Nombre")
3. Verifica que los datos estén en columnas A-J

### La sincronización tarda mucho

**Nota:** La sincronización con Google Sheets puede tardar 10-30 segundos dependiendo de:
- Cantidad de productos
- Velocidad de conexión a internet
- Límites de rate limiting de Google Sheets API

### Los cambios no aparecen en el dashboard

**Solución:**
1. Recarga la página del dashboard
2. Haz clic nuevamente en "Sincronizar con Google Sheets"
3. Revisa la consola del navegador para errores

## 🔐 Seguridad

### Credenciales

- Todas las credenciales se almacenan en `.env.local` (no commiteado)
- El `GOOGLE_PRIVATE_KEY` nunca se expone al cliente
- Las operaciones de sincronización requieren rol de admin

### Autorización

```typescript
// Solo admin puede sincronizar
if (!user || user.rol !== 'admin') {
  return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
}
```

## 🚀 Próximas mejoras

- [ ] Sincronización automática en intervalos regulares
- [ ] Webhook desde Google Sheets para actualizaciones en tiempo real
- [ ] Historial de cambios del menú
- [ ] Validación de precios antes de sincronizar
- [ ] Backup automático del menú antes de sincronizar

## 📞 Soporte

Para preguntas o problemas de integración con Google Sheets, contacta al equipo de desarrollo.
