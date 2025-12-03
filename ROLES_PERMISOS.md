# Sistema POS - Roles y Permisos

## 👥 Roles del Sistema

### 🔴 Administrador (admin)
**Permisos completos del sistema**
- ✅ Gestionar todos los usuarios
- ✅ Gestionar meseros
- ✅ Gestionar productos y precios
- ✅ Gestionar pedidos
- ✅ Control de caja
- ✅ Ver reportes

### 🟡 Caja (caja)
**Encargado de pagos y control financiero**
- ❌ Gestionar usuarios (solo admin)
- ✅ Gestionar meseros
- ❌ Gestionar productos (solo admin)
- ✅ Gestionar pedidos
- ✅ Control de caja
- ✅ Ver reportes

### 🔵 Mesero (mesero)
**Personal de servicio**
- ❌ Gestionar usuarios
- ❌ Gestionar meseros
- ❌ Gestionar productos
- ✅ Gestionar pedidos (crear y ver)
- ❌ Control de caja
- ❌ Ver reportes

## 🎯 Funcionalidades por Rol

| Funcionalidad | Admin | Caja | Mesero |
|---------------|-------|------|--------|
| Dashboard | ✅ | ✅ | ✅ |
| Crear Pedidos | ✅ | ✅ | ✅ |
| Ver Pedidos | ✅ | ✅ | ✅ |
| Gestionar Productos | ✅ | ❌ | ❌ |
| Control de Caja | ✅ | ✅ | ❌ |
| Gestionar Meseros | ✅ | ✅ | ❌ |
| Gestionar Usuarios | ✅ | ❌ | ❌ |
| Ver Reportes | ✅ | ✅ | ❌ |

## 🔐 Seguridad

- **Autenticación JWT**: Tokens con expiración de 8 horas
- **Hashing de contraseñas**: bcrypt con salt rounds de 10
- **Control de acceso**: Verificación de permisos en cada endpoint
- **Validación de datos**: Sanitización y validación de inputs

## 🚀 Inicio Rápido

1. **Usuario por defecto**: `admin` / `admin`
2. **Crear meseros**: Desde el menú "Meseros" (Admin/Caja)
3. **Asignar roles**: Solo administradores pueden crear usuarios con diferentes roles

## 📱 Navegación

- **Sidebar**: Acceso rápido a módulos según permisos
- **Dashboard**: Vista general con estadísticas
- **Acciones rápidas**: Botones directos a funciones principales