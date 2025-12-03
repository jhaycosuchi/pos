# Gestión del Menú - Google Sheets Integration

## 🍽️ Funcionalidad del Menú

El sistema POS ahora incluye una **gestión completa del menú** integrada con Google Sheets, permitiendo actualizar precios y productos en tiempo real desde una interfaz web elegante.

## 🔗 Integración con Google Sheets

### **Credenciales Configuradas**
- **Service Account**: `mazuhisushi@rich-surge-477017-s3.iam.gserviceaccount.com`
- **Spreadsheet ID**: `1zQ8GWmW72NrhspyhF93ZKBnD1TSvnm69O2Gv2EECCUY`
- **Alcance**: Lectura y escritura en Google Sheets

### **Estructura de Hojas**
```
📊 Spreadsheet: Mazuhi Sushi Menu
├── 🍜 Entradas
├── 🍚 Arroces
├── 🍱 Rollos_Naturales
├── 🍣 Rollos_Empanizados
├── 🎯 Rollos_Especiales
├── 🔥 Rollos_Horneados
├── 🥤 Bebidas
├── 🍰 Postres
└── 🧂 Extras
```

## 🎨 Interfaz de Gestión

### **Página Principal del Menú** (`/menu`)
- **Selector de Categorías**: Botones para navegar entre categorías
- **Vista por Categoría**: Tabla completa con todos los items
- **Estadísticas**: Conteo de items por categoría
- **Búsqueda Visual**: Iconos y etiquetas para características

### **Modal de Edición/Agregar**
- **Campos Completos**: Nombre, descripción, precio, imagen
- **Etiquetas Interactivas**: Vegetariano, picante, favorito, etc.
- **Validación**: Campos requeridos y formato correcto
- **Vista Previa**: Imágenes y características en tiempo real

## ⚡ Funcionalidades CRUD

### **Crear Items**
```typescript
POST /api/menu
{
  "categoryName": "Rollos_Naturales",
  "item": {
    "nombre": "California Roll",
    "descripcion": "Roll con aguacate, pepino y cangrejo",
    "precio": 85.00,
    "vegetariano": false,
    "picante": false,
    "favorito": true
  }
}
```

### **Leer Menú**
```typescript
GET /api/menu
// Retorna array completo de categorías con items
```

### **Actualizar Items**
```typescript
PUT /api/menu
{
  "categoryName": "Rollos_Naturales",
  "itemName": "California Roll",
  "updates": {
    "precio": 90.00,
    "favorito": true
  }
}
```

### **Eliminar Items**
```typescript
DELETE /api/menu
{
  "categoryName": "Rollos_Naturales",
  "itemName": "California Roll"
}
// Marca precio como $0 (efectivamente lo elimina)
```

## 🏷️ Sistema de Etiquetas

### **Características Disponibles**
- **🆕 Nuevo**: `nuevo` - Items recientemente agregados
- **🌱 Vegetariano**: `vegetariano` - Apto para vegetarianos
- **🔥 Picante**: `picante` - Nivel de picante alto
- **⭐ Favorito**: `favorito` - Más populares
- **🎯 Destacado**: `destacado` - Aparece en promociones
- **🥳 Miércoles**: `promomiercoles` - Promoción semanal

### **Visualización**
- **Iconos Lucide**: Cada etiqueta tiene su icono correspondiente
- **Colores Distintivos**: Verde para veg, rojo para picante, etc.
- **Filtros**: Fácil identificación visual

## 🔐 Permisos por Rol

| Rol | Ver Menú | Editar Menú | Eliminar Items |
|-----|----------|-------------|----------------|
| 👑 Admin | ✅ | ✅ | ✅ |
| 💰 Caja | ❌ | ❌ | ❌ |
| 👨‍🍳 Mesero | ❌ | ❌ | ❌ |

## 💾 Sistema de Cache

### **Configuración**
- **Duración**: 10 minutos
- **Alcance**: Todo el menú completo
- **Actualización**: Automática al modificar items

### **Beneficios**
- **Performance**: Carga rápida del menú
- **Actualización**: Cambios visibles en tiempo real
- **Confiabilidad**: Fallback si falla Google Sheets

## 🎯 Casos de Uso

### **Actualización de Precios**
1. Ir a `/menu`
2. Seleccionar categoría
3. Click en "✏️ Editar" del item
4. Modificar precio
5. Guardar cambios
6. **Automático**: Se actualiza en Google Sheets

### **Agregar Nuevo Item**
1. Click en "➕ Agregar Item"
2. Llenar formulario completo
3. Seleccionar etiquetas
4. Subir imagen URL
5. **Resultado**: Nuevo item en Google Sheets

### **Gestión de Etiquetas**
1. Editar item existente
2. Marcar/desmarcar checkboxes
3. **Efecto**: Cambia apariencia en la app

## 🔄 Sincronización

### **Flujo de Datos**
```
Google Sheets ←→ API Cache ←→ Interfaz Web
       ↑              ↑              ↑
   Manual        10 min       Instantáneo
  Updates       Refresh       Updates
```

### **Actualización Manual**
- Editar directamente en Google Sheets
- Esperar hasta 10 minutos
- O reiniciar servidor para forzar refresh

## 📊 Estadísticas y Métricas

### **Dashboard del Menú**
- **Total Items**: Conteo por categoría
- **Precios**: Rango de precios
- **Etiquetas**: Distribución de características
- **Imágenes**: Porcentaje con imagen

## 🚨 Manejo de Errores

### **Conexión a Google Sheets**
- **Reintentos**: Hasta 3 intentos automáticos
- **Fallback**: Cache local si falla la conexión
- **Logs**: Errores detallados en consola

### **Validación de Datos**
- **Campos Requeridos**: Nombre, descripción, precio
- **Formatos**: URL válidas, precios numéricos
- **Límites**: Longitud máxima de textos

## 🎨 Diseño y UX

### **Iconos Lucide React**
- **Utensils**: 🍽️ Menú principal
- **Sparkles**: ✨ Nuevo
- **Leaf**: 🌱 Vegetariano
- **Flame**: 🔥 Picante
- **Star**: ⭐ Favorito

### **Interfaz Moderna**
- **Responsive**: Funciona en móvil y desktop
- **Accesible**: Labels y tooltips
- **Intuitiva**: Flujo lógico de navegación

## 🔧 Configuración Técnica

### **Variables de Entorno**
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=mazuhisushi@...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEET_ID=1zQ8GWmW72NrhspyhF93ZKBnD1TSvnm69O2Gv2EECCUY
```

### **Dependencias**
```json
{
  "googleapis": "^118.0.0",
  "lucide-react": "^0.263.1"
}
```

## 📈 Próximas Funcionalidades

- [ ] **Búsqueda Avanzada**: Filtrar por etiquetas
- [ ] **Importación Masiva**: CSV a Google Sheets
- [ ] **Historial de Cambios**: Tracking de modificaciones
- [ ] **Imágenes**: Upload directo desde interfaz
- [ ] **Promociones**: Sistema de descuentos integrado

---

**Estado**: ✅ **Completamente Funcional**
**Última Actualización**: Noviembre 2025
**Versión**: 1.0.0