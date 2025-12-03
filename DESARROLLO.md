# 📋 POS de Ventas - Plan de Desarrollo

## 🎯 Objetivo
Crear un sistema de punto de venta (POS) rápido y eficiente para administración de pedidos, con autenticación de roles (Mesero/Caja) y gestión de precios.

---

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 14+ (React)
- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite
- **Autenticación**: JWT o sesiones
- **Estilos**: Tailwind CSS
- **UI Components**: Shadcn/ui o componentes personalizados

---

## 🎨 Paleta de Colores
*Basada en `image.png`*

| Color | Hex | Uso |
|-------|-----|-----|
| **Primario** | `#1F2937` | Fondos oscuros, navbar |
| **Secundario** | `#3B82F6` | Botones, acciones |
| **Acento** | `#F59E0B` | Alertas, destacados |
| **Éxito** | `#10B981` | Confirmaciones, ventas |
| **Error** | `#EF4444` | Errores, cancelaciones |
| **Fondo** | `#F9FAFB` | Background principal |
| **Texto** | `#111827` | Texto principal |

---

## 📁 Estructura del Proyecto

```
pos/
├── app/
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Home/Login
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx        # Página de login
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Layout dashboard
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── pedidos/
│   │   │   ├── page.tsx        # Listar pedidos
│   │   │   ├── [id]/page.tsx   # Detalle pedido
│   │   │   └── nuevo/page.tsx  # Crear pedido
│   │   ├── caja/
│   │   │   ├── page.tsx        # Control de caja
│   │   │   └── cierre/page.tsx # Cierre de caja
│   │   ├── precios/
│   │   │   └── page.tsx        # Gestión de precios
│   │   └── reportes/
│   │       └── page.tsx        # Reportes
│   └── api/
│       ├── auth/
│       │   └── route.ts        # Login endpoint
│       ├── pedidos/
│       │   ├── route.ts        # GET/POST pedidos
│       │   └── [id]/route.ts   # GET/PUT/DELETE pedido
│       ├── precios/
│       │   └── route.ts        # GET/POST precios
│       └── caja/
│           └── route.ts        # Operaciones de caja
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── pedidos/
│   │   ├── PedidoForm.tsx
│   │   ├── PedidoList.tsx
│   │   └── PedidoDetail.tsx
│   ├── caja/
│   │   ├── CajaControl.tsx
│   │   └── CierreCaja.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── lib/
│   ├── db.ts                   # Conexión SQLite
│   ├── auth.ts                 # Lógica de autenticación
│   └── utils.ts                # Funciones auxiliares
├── styles/
│   └── globals.css             # Estilos globales
├── database/
│   └── schema.sql              # Schema SQLite
├── .env.local                  # Variables de entorno
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js

```

---

## 📊 Modelos de Base de Datos

### 1. **Usuarios**
```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol TEXT NOT NULL, -- 'mesero', 'caja', 'admin'
  nombre TEXT NOT NULL,
  estado BOOLEAN DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. **Productos**
```sql
CREATE TABLE productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  stock INTEGER DEFAULT 0,
  estado BOOLEAN DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **Pedidos**
```sql
CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_pedido TEXT UNIQUE NOT NULL,
  usuario_id INTEGER NOT NULL,
  mesa TEXT, -- Número de mesa (si aplica)
  estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'completado', 'cancelado'
  total DECIMAL(10,2) NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);
```

### 4. **Detalles de Pedidos**
```sql
CREATE TABLE detalle_pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL,
  producto_id INTEGER NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY(pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY(producto_id) REFERENCES productos(id)
);
```

### 5. **Caja**
```sql
CREATE TABLE caja (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre DATETIME,
  monto_inicial DECIMAL(10,2) DEFAULT 0,
  monto_final DECIMAL(10,2),
  estado TEXT DEFAULT 'abierta', -- 'abierta', 'cerrada'
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);
```

### 6. **Transacciones**
```sql
CREATE TABLE transacciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caja_id INTEGER NOT NULL,
  pedido_id INTEGER,
  tipo TEXT NOT NULL, -- 'venta', 'ajuste', 'devolución'
  monto DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(caja_id) REFERENCES caja(id),
  FOREIGN KEY(pedido_id) REFERENCES pedidos(id)
);
```

---

## 🚀 Fases de Desarrollo

### **Fase 1: Setup Inicial** ✅ COMPLETADO
- [x] Crear proyecto Next.js
- [x] Instalar dependencias (sqlite3, tailwind, jwt, etc.)
- [x] Configurar SQLite
- [x] Crear estructura de carpetas
- [x] Configurar variables de entorno

### **Fase 2: Autenticación** ✅ COMPLETADO
- [x] Crear tabla de usuarios
- [x] Implementar página de login
- [x] Crear API de autenticación
- [x] Implementar middleware de protección
- [x] Crear sistema de roles (mesero/caja)

### **Fase 3: Dashboard Principal** ✅ COMPLETADO
- [x] Crear layout general
- [x] Navbar con usuario actual
- [x] Sidebar con navegación
- [x] Página principal con resumen

### **Fase 4: Gestión de Pedidos** ✅ COMPLETADO
- [x] Crear tabla de productos (datos iniciales basados en menú sushi)
- [x] Página de crear nuevo pedido
- [x] Formulario de productos con categorías
- [x] Listar pedidos
- [x] Ver detalle de pedido (pendiente)
- [x] Editar/Cancelar pedido (pendiente)

### **Fase 5: Control de Caja** ✅ COMPLETADO
- [x] Página de apertura de caja
- [x] Dashboard de caja (ventas del día)
- [x] Listar transacciones
- [x] Cierre de caja
- [x] Reportes diarios

### **Fase 6: Gestión de Precios** ✅ COMPLETADO
- [x] CRUD de productos
- [x] Gestión de precios
- [x] Control de stock

### **Fase 7: Mejoras y Pulido**
- [ ] Reportes avanzados
- [ ] Búsqueda y filtros
- [ ] Exportar datos
- [ ] Optimizaciones
- [ ] Tests

---

## 🔐 Funcionalidades por Rol

### **Mesero**
- Crear pedidos
- Ver sus pedidos
- No puede acceder a caja
- No puede ver reportes

### **Caja**
- Ver todos los pedidos
- Procesar pagos
- Abrir/cerrar caja
- Ver transacciones
- Reportes de venta

### **Admin** (opcional para después)
- Acceso a todo
- Gestionar usuarios
- Gestionar precios
- Reportes completos

---

## 📝 Próximos Pasos

1. **✅ COMPLETADO**: Setup inicial, autenticación, dashboard, pedidos, caja y precios
2. **Paso 1**: Instalar Node.js (si no está instalado)
3. **Paso 2**: Ejecutar `npm install` para instalar dependencias
4. **Paso 3**: Ejecutar `npm run db:init` para inicializar BD con productos sushi
5. **Paso 4**: Ejecutar `npm run dev` para probar el sistema
6. **Paso 5**: Probar APIs con curl (login, pedidos, productos, caja)
7. **Paso 6**: Próxima fase - Mejoras y reportes avanzados

---

## 🎨 Configuración de Tailwind

Agregar en `tailwind.config.js`:

```javascript
colors: {
  primary: '#1F2937',
  secondary: '#3B82F6',
  accent: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  light: '#F9FAFB',
  dark: '#111827',
}
```

---

## 💡 Tips Rápidos
- Usar componentes reutilizables para ahorrar tiempo
- Empezar con datos mock antes de conectar BD
- Hacer commits frecuentes
- Priorizar funcionalidad sobre diseño (se mejora después)

¡Vamos a construir este POS! 🚀
