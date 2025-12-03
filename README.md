# POS - Sistema de Ventas

Sistema de punto de venta rápido y eficiente para administración de pedidos, con autenticación de roles (Mesero/Caja).

## 🚀 Inicio Rápido

### 1. Instalar Node.js
**IMPORTANTE**: Debes instalar Node.js primero.

**Opción A - Instalador oficial:**
- Ve a [https://nodejs.org/](https://nodejs.org/)
- Descarga la versión LTS (recomendada)
- Instala normalmente

**Opción B - Usando winget (Windows):**
```bash
winget install OpenJS.NodeJS.LTS
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Inicializar base de datos
```bash
npm run db:init
```

### 4. Ejecutar el proyecto
```bash
npm run dev
```

### 5. Acceder
- Abre [http://localhost:3000](http://localhost:3000)
- Usuario: `admin`
- Contraseña: `admin`

## ✅ Funcionalidades Implementadas

### 🔐 Autenticación
- Login con JWT
- Roles: mesero, caja, admin
- Middleware de protección
- Usuario por defecto: admin/admin

### 📊 Dashboard
- Estadísticas en tiempo real
- Navegación por sidebar
- Acciones rápidas
- Layout responsive

### 📦 Gestión de Pedidos
- **Productos**: 20+ productos de sushi organizados por categorías
- **Crear pedido**: Interfaz intuitiva con categorías
- **Lista de pedidos**: Tabla con filtros y estados
- **API REST**: Endpoints para productos y pedidos

### 🗄️ Base de Datos
- SQLite con schema completo
- Productos de ejemplo basados en menú real
- Relaciones entre pedidos y productos
- Sistema de números de pedido automático

## 🎨 Paleta de Colores

Basada en `image.png`:
- Primary: #1F2937
- Secondary: #3B82F6
- Accent: #F59E0B
- Success: #10B981
- Error: #EF4444

## 🔐 Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin
- **Rol**: admin

## 🎨 Paleta de Colores

Basada en `image.png`:
- Primary: #1F2937
- Secondary: #3B82F6
- Accent: #F59E0B
- Success: #10B981
- Error: #EF4444

## 📊 Próximos Pasos

1. ✅ Setup inicial completado
2. ✅ Autenticación implementada
3. 🔄 Próximo: Módulo de pedidos
4. 🔄 Próximo: Control de caja
5. 🔄 Próximo: Gestión de precios

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite
- **Estilos**: Tailwind CSS
- **Autenticación**: JWT

## 🧪 Testing y Verificación

### Verificar Instalación
```bash
# Verificar Node.js
node --version
npm --version

# Verificar que funciona
npm run dev
# Debería mostrar: Ready - started server on 0.0.0.0:3000
```

### Probar Funcionalidades
1. **Login**: Ir a `/login`, usar admin/admin
2. **Dashboard**: Ver estadísticas y navegación
3. **Nuevo Pedido**: Agregar productos, crear pedido
4. **Lista Pedidos**: Ver pedidos creados

### Verificar Base de Datos
```bash
# Ver productos
sqlite3 database/pos.db "SELECT categoria, COUNT(*) as count FROM productos GROUP BY categoria;"

# Ver pedidos
sqlite3 database/pos.db "SELECT numero_pedido, total FROM pedidos;"
```

¡El proyecto está listo para desarrollo! 🚀