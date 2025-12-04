# 📋 Guía de Refactorización y Mejores Prácticas

## 🎯 Objetivos
- Eliminar código duplicado
- Centralizar lógica de negocio
- Usar rutas absolutas consistentes
- Separar responsabilidades
- Facilitar mantenimiento

## ✅ Cambios Implementados

### 1. **Servicios Centralizados** (`/lib/services/`)

#### `pedidos.service.ts`
- ✅ Toda la lógica de pedidos en un solo lugar
- ✅ Métodos: crear, actualizar, agregar items, cambiar estado
- ✅ Validaciones centralizadas
- ✅ Manejo de errores consistente

**Uso:**
```typescript
import { PedidosService } from '@/lib/services';

// Crear pedido
const resultado = await PedidosService.crearPedido(data);

// Validar antes de crear
const { valido, errores } = PedidosService.validarDatosPedido(data);
```

#### `menu.service.ts`
- ✅ Gestión del menú centralizada
- ✅ Métodos: obtener menú, buscar productos, filtrar por categoría

**Uso:**
```typescript
import { MenuService } from '@/lib/services';

const menu = await MenuService.obtenerMenu();
const producto = await MenuService.buscarProducto('Pizza');
```

#### `auth.service.ts`
- ✅ Gestión de usuarios y autenticación
- ✅ Obtiene mesero_id dinámicamente
- ✅ Manejo de localStorage
- ✅ Validación de roles

**Uso:**
```typescript
import { AuthService } from '@/lib/services';

const meseroId = AuthService.obtenerMeseroId(); // Ya no hardcoded!
const usuario = AuthService.obtenerUsuarioActual();
```

### 2. **Hook Personalizado** (`/lib/hooks/usePedidos.ts`)

- ✅ Gestión de carrito completa
- ✅ Lógica de pedidos encapsulada
- ✅ Estado compartido
- ✅ Funciones reutilizables

**Uso:**
```typescript
import { usePedidos } from '@/lib/hooks/usePedidos';

function MiComponente() {
  const {
    cart,
    agregarAlCarrito,
    crearPedido,
    calcularTotal
  } = usePedidos();

  // Crear pedido (ya no necesitas toda la lógica)
  const handleSubmit = async () => {
    await crearPedido(mesaNumero, esParaLlevar, cuentaId);
  };
}
```

## 📁 Estructura de Archivos Recomendada

```
/var/www/pos/
├── app/
│   ├── api/                    # Endpoints del servidor
│   ├── dashboard/              # Panel admin
│   ├── atiendemesero/         # UI de meseros
│   ├── comanda/               # UI de cocina
│   └── areas-activas/         # UI de áreas
├── lib/
│   ├── services/              # ✅ NUEVO: Lógica de negocio
│   │   ├── index.ts
│   │   ├── pedidos.service.ts
│   │   ├── menu.service.ts
│   │   └── auth.service.ts
│   ├── hooks/                 # ✅ NUEVO: Hooks personalizados
│   │   └── usePedidos.ts
│   ├── utils/                 # Utilidades puras
│   ├── config.ts              # Configuración
│   ├── db.ts                  # Base de datos
│   └── types.ts               # Tipos TypeScript
└── components/                # Componentes UI
    ├── shared/                # ✅ RECOMENDADO: Componentes compartidos
    ├── atiendemesero/
    ├── comanda/
    └── ui/
```

## 🔧 Cómo Usar Rutas Absolutas

### ❌ ANTES (Rutas relativas - MAL)
```typescript
import { getDb } from '../../../lib/db';
import { API } from '../../lib/config';
```

### ✅ DESPUÉS (Rutas absolutas - BIEN)
```typescript
import { getDb } from '@/lib/db';
import { API } from '@/lib/config';
import { PedidosService } from '@/lib/services';
```

## 🔄 Plan de Migración

### Fase 1: Servicios (COMPLETADO ✅)
- [x] Crear `pedidos.service.ts`
- [x] Crear `menu.service.ts`
- [x] Crear `auth.service.ts`
- [x] Crear hook `usePedidos`

### Fase 2: Refactorizar Páginas (PENDIENTE)
- [ ] Actualizar `/app/atiendemesero/page.tsx` para usar hook
- [ ] Actualizar `/app/areas-activas/page.tsx`
- [ ] Actualizar `/app/comanda/page.tsx`
- [ ] Actualizar componentes duplicados

### Fase 3: Limpieza (PENDIENTE)
- [ ] Eliminar código duplicado
- [ ] Unificar componentes similares
- [ ] Documentar funciones importantes

## 🚀 Ejemplo de Migración

### ANTES: Código duplicado en cada página
```typescript
// En atiendemesero/page.tsx
const sendOrder = async () => {
  const orderData = {
    mesero_id: 4, // Hardcoded ❌
    mesa_numero: tableNumber,
    items: cart.map(item => ({
      menu_item_id: 1,
      producto_nombre: item.item.nombre,
      cantidad: item.quantity,
      precio_unitario: item.item.precio,
    })),
    total: cart.reduce((sum, item) => sum + item.item.precio * item.quantity, 0)
  };
  
  const response = await fetch('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}
```

### DESPUÉS: Usando servicios
```typescript
import { usePedidos } from '@/lib/hooks/usePedidos';

const { crearPedido } = usePedidos();

const sendOrder = async () => {
  try {
    await crearPedido(mesaNumero, esParaLlevar, cuentaId);
    // El hook maneja todo: mesero_id, formato, validaciones, errores
  } catch (error) {
    alert(error.message);
  }
};
```

## 🎯 Beneficios

1. **Menos errores**: Lógica en un solo lugar
2. **Fácil mantenimiento**: Cambio en un archivo afecta todo
3. **Reutilización**: Mismo código en múltiples páginas
4. **Testing**: Fácil probar servicios aislados
5. **Escalabilidad**: Agregar funciones sin duplicar código
6. **Imports claros**: `@/lib/services` en lugar de `../../../lib`

## 📝 Próximos Pasos Recomendados

1. **Actualizar páginas existentes** para usar los nuevos servicios
2. **Crear componentes compartidos** (botones, modales, formularios)
3. **Agregar validaciones** en el cliente antes de enviar
4. **Implementar manejo de errores** global
5. **Agregar tests** para los servicios críticos

## 🔗 Referencias Rápidas

```typescript
// Importar todos los servicios
import { PedidosService, MenuService, AuthService } from '@/lib/services';

// Usar el hook de pedidos
import { usePedidos } from '@/lib/hooks/usePedidos';

// Configuración
import { API, PAGES } from '@/lib/config';
```

## 💡 Tips

- **Siempre usa `@/` para imports**: Más claro y no se rompe al mover archivos
- **Un servicio por dominio**: pedidos, menú, usuarios, reportes, etc.
- **Hooks para UI**: Lógica que necesita estado React
- **Servicios para API**: Llamadas HTTP y transformaciones
- **Validaciones en servicios**: No en componentes UI
