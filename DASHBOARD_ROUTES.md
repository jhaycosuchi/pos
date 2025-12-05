# Estructura del Dashboard - Guía de Rutas

## Resumen General

La estructura del dashboard ha sido reorganizada para mayor claridad y mejor navegación. Todas las rutas siguen un patrón lógico y consistente.

## Mapa de Rutas

### Dashboard Principal
- **URL**: `/dashboard`
- **Descripción**: Página principal del administrador con estadísticas y acceso rápido a todas las secciones
- **Contenido**:
  - Estadísticas generales (cuentas abiertas, pedidos hoy, productos activos, ventas)
  - Menú de navegación rápida a todas las secciones
  - Información del usuario logeado

### Sección: Cuentas
- **Listado de Cuentas**
  - URL: `/dashboard/cuentas`
  - Muestra todas las cuentas del restaurante
  - Botones de acción: Ver, Editar, Eliminar

- **Detalles de una Cuenta**
  - URL: `/dashboard/cuentas/[id]`
  - Ejemplo: `/dashboard/cuentas/5`
  - Muestra información completa de la cuenta
  - Lista todos los pedidos asociados a esa cuenta
  - Estadísticas de la cuenta (total, mesero, estado)

- **Detalles de un Pedido (desde Cuenta)**
  - URL: `/dashboard/cuentas/[id]/pedidos/[pedidoId]`
  - Ejemplo: `/dashboard/cuentas/5/pedidos/23`
  - Muestra información completa del pedido
  - Lista de items del pedido
  - Opciones para: cambiar estado, eliminar pedido
  - Botón para volver a la cuenta

### Sección: Pedidos
- **Listado de Todos los Pedidos**
  - URL: `/dashboard/pedidos`
  - Muestra todos los pedidos del sistema
  - Acceso directo a detalles de cada pedido

### Sección: Menú
- **Gestión de Menú**
  - URL: `/dashboard/menu`
  - Administrar productos y categorías
  - Control de disponibilidad de items

### Sección: Usuarios
- **Listado de Usuarios**
  - URL: `/dashboard/usuarios`
  - Ver todos los usuarios del sistema
  - Opciones para agregar, editar, eliminar

- **Editar Usuario**
  - URL: `/dashboard/usuarios/[id]/editar`
  - Formulario para modificar datos del usuario

- **Crear Nuevo Usuario**
  - URL: `/dashboard/usuarios/nuevo`
  - Formulario para crear un nuevo usuario

### Sección: Caja
- **Control de Caja**
  - URL: `/dashboard/caja`
  - Gestión de pagos y cierre de caja

### Sección: Reportes
- **Reportes y Análisis**
  - URL: `/dashboard/reportes`
  - Visualización de datos y estadísticas
  - Reportes de ventas, productos más vendidos, etc.

### Sección: Otros
- **Precios**
  - URL: `/dashboard/precios`
  - Gestión de precios de productos

- **Meseros**
  - URL: `/dashboard/meseros`
  - Gestión de meseros del restaurante
  - Agregar, editar, eliminar meseros

## Funcionalidades por Ruta

### En Listado de Cuentas (/dashboard/cuentas)
1. **Ver** - Accede a detalles de la cuenta
2. **Editar** - Permite modificar datos de la cuenta (implementación pendiente)
3. **Eliminar** - Borra la cuenta (implementación pendiente)

### En Detalles de Cuenta (/dashboard/cuentas/[id])
1. Ver información completa de la cuenta
2. Ver todos los pedidos asociados
3. **Ver detalles** de cada pedido - Accede a la página de detalles del pedido
4. Editar/Eliminar cada pedido (botones disponibles)

### En Detalles de Pedido (/dashboard/cuentas/[id]/pedidos/[pedidoId])
1. Ver información completa del pedido
2. Ver lista de items con detalles
3. **Cambiar estado** - Selector dropdown con opciones:
   - Pendiente
   - Preparando
   - Listo
   - Entregado
   - Cancelado
4. **Eliminar pedido** - Elimina el pedido y redirige a la cuenta
5. Ver observaciones del pedido
6. Ver información de mesero, mesa, comensales
7. **Volver a cuenta** - Regresa a la página de detalles de la cuenta

## Patrones de Navegación

### Navegación Principal
Dashboard → Cuentas → Detalles de Cuenta → Detalles de Pedido → (Volver a Cuenta)

### Navegación Alternativa
Dashboard → Pedidos → Detalles de Pedido

### Navegación Secundaria
Dashboard → Usuarios/Menu/Caja/Reportes/Meseros/Precios

## Estructura de Carpetas

```
app/dashboard/
├── page.tsx                           # Dashboard principal
├── cuentas/
│   ├── page.tsx                       # Listado de cuentas
│   └── [id]/
│       ├── page.tsx                   # Detalles de cuenta
│       └── pedidos/
│           └── [pedidoId]/
│               ├── page.tsx           # Detalles de pedido (servidor)
│               └── client.tsx         # Interactividad del pedido (cliente)
├── pedidos/
│   ├── page.tsx                       # Listado de todos los pedidos
│   ├── [id]/
│   │   └── page.tsx                   # Detalles de pedido (ruta alternativa)
│   ├── detalle/
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── client.tsx             # (deprecated - usar nueva ruta)
│   └── nuevo/
│       └── page.tsx                   # Crear nuevo pedido
├── menu/
│   └── page.tsx                       # Gestión de menú
├── usuarios/
│   ├── page.tsx                       # Listado de usuarios
│   ├── [id]/
│   │   └── editar/page.tsx            # Editar usuario
│   └── nuevo/page.tsx                 # Crear usuario
├── caja/
│   └── page.tsx                       # Control de caja
├── reportes/
│   └── page.tsx                       # Reportes
├── meseros/
│   └── page.tsx                       # Gestión de meseros
├── precios/
│   └── page.tsx                       # Gestión de precios
└── layout.tsx                         # Layout compartido del dashboard
```

## Componentes Reutilizables

### PedidoDetailClient
Ubicación: `/app/dashboard/cuentas/[id]/pedidos/[pedidoId]/client.tsx`

Componente cliente que maneja:
- Visualización de detalles del pedido
- Cambio de estado con dropdown
- Eliminación de pedido
- Redirección de vuelta a la cuenta

Props:
```typescript
{
  pedido: Pedido;        // Datos del pedido
  cuentaId: string;      // ID de la cuenta (para redirección)
}
```

## Errores Comunes a Evitar

1. **Rutas conflictivas**: No crear rutas que conflicten con `[id]` dinámico
   - ✅ Correcto: `/dashboard/cuentas/[id]` y `/dashboard/cuentas/[id]/pedidos/[pedidoId]`
   - ❌ Incorrecto: `/dashboard/cuentas/detalle/[id]` (sería interpretado como `[id]=detalle`)

2. **Importaciones de rutas relativas**: Verificar la profundidad correcta
   - De `/app/dashboard/`: `../../lib/db`
   - De `/app/dashboard/cuentas/`: `../../../lib/db`
   - De `/app/dashboard/cuentas/[id]/`: `../../../../lib/db`
   - De `/app/dashboard/cuentas/[id]/pedidos/[pedidoId]/`: `../../../../../../lib/db`

3. **Componentes Server vs Client**:
   - Las páginas son Server Components por defecto
   - Usar `'use client'` solo cuando se necesite interactividad
   - Las funciones async van en Server Components
   - Los estados (useState, useRouter) van en Client Components

## Próximas Implementaciones

- [ ] Funcionalidad de Editar Cuenta
- [ ] Funcionalidad de Eliminar Cuenta
- [ ] Funcionalidad de Editar Pedido (cambiar items)
- [ ] Reportes avanzados
- [ ] Sistema de permisos por usuario
- [ ] Búsqueda y filtros mejorados
- [ ] Exportar reportes a PDF/Excel

