# Arquitectura de Componentes - Comanda Digital

## Estructura de Carpetas

```
/components/comanda/
├── ComandaHeader.tsx          # Header principal con controles
├── ComandaColumn.tsx          # Columna completa (PENDIENTES/PREP/LISTOS)
├── ColumnHeader.tsx           # Encabezado de cada columna
├── PedidoHeader.tsx           # Metadatos del pedido (mesa, tiempo, mesero, total)
├── PedidoItem.tsx             # Item de pedido (solo lectura)
├── ItemCheckbox.tsx           # Item con checkbox para marcar completado
├── CompletedItemsSection.tsx  # Separador de items completados
├── ActionButton.tsx           # Botón de acción reutilizable
├── EmptyState.tsx             # Mensaje cuando no hay pedidos
└── NoItemsMessage.tsx         # Mensaje genérico para columnas vacías

/app/comanda/
└── page.tsx                   # Página principal simplificada (~80 líneas)
```

## Componentes

### 1. ComandaHeader
**Ubicación:** `components/comanda/ComandaHeader.tsx`

Header principal con:
- Título "COMANDA DIGITAL"
- Botón de auto-refresh toggle
- Botón de actualización manual

**Props:**
```typescript
interface ComandaHeaderProps {
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
}
```

### 2. ComandaColumn
**Ubicación:** `components/comanda/ComandaColumn.tsx`

Componente de mayor nivel que agrupa:
- Encabezado de columna (PENDIENTES/EN PREPARACIÓN/LISTOS)
- Lista de pedidos con sus items
- Mensaje de estado vacío

**Props:**
```typescript
interface ComandaColumnProps {
  title: string;
  count: number;
  headerIcon: React.ReactNode;
  borderColor: string;
  headerTextColor: string;
  pedidos: any[];
  noItemsIcon: React.ReactNode;
  noItemsMessage: string;
  actionButtonLabel: string;
  actionButtonIcon: React.ReactNode;
  actionButtonColor: string;
  actionButtonState: string;
  itemsCompletados: Set<string>;
  onToggleItemCompletado: (pedidoId: number, itemIndex: number) => void;
  onChangeEstado: (pedidoId: number, nuevoEstado: string) => void;
  getColorPorTiempo: (fecha: string) => string;
  calcularTiempoTranscurrido: (fecha: string) => string;
  isPreparacion?: boolean;
}
```

**Características:**
- En columna PENDIENTES: items sin checkbox
- En columna EN PREPARACIÓN: items con checkbox + separador de completados
- En columna LISTOS: items completados con check visibles

### 3. ColumnHeader
**Ubicación:** `components/comanda/ColumnHeader.tsx`

Encabezado de cada columna con:
- Icono + título
- Contador de pedidos

**Props:**
```typescript
interface ColumnHeaderProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  colorClass: string; // 'border-red-600', 'border-yellow-600', 'border-green-600'
}
```

### 4. PedidoHeader
**Ubicación:** `components/comanda/PedidoHeader.tsx`

Metadatos del pedido:
- Mesa / Para llevar
- Número de pedido
- Mesero
- Total
- Tiempo transcurrido (con color dinámico)

**Props:**
```typescript
interface PedidoHeaderProps {
  mesa_numero: number | null;
  es_para_llevar: number;
  numero_pedido: string;
  mesero_nombre: string;
  total: number;
  tiempo: string;
  colorTiempo: string;
}
```

### 5. PedidoItem
**Ubicación:** `components/comanda/PedidoItem.tsx`

Muestra un item sin interactividad:
- Nombre y cantidad
- Notas/restricciones
- Pequeños iconos si tiene notas

**Props:**
```typescript
interface PedidoItemProps {
  nombre: string;
  cantidad: number;
  especificaciones: string;
  notas: string;
}
```

### 6. ItemCheckbox
**Ubicación:** `components/comanda/ItemCheckbox.tsx`

Item clickeable con dos modos:

**Modo Activo** (isCompleted=false):
- Checkbox vacío
- Border amarillo
- Clickeable para marcar como completado

**Modo Completado** (isCompleted=true):
- Check icon verde
- Texto tachado
- Opacidad reducida (opacity-50)

**Props:**
```typescript
interface ItemCheckboxProps {
  nombre: string;
  cantidad: number;
  especificaciones: string;
  notas: string;
  isCompleted: boolean;
  isSmall?: boolean;
  onClick: () => void;
}
```

### 7. CompletedItemsSection
**Ubicación:** `components/comanda/CompletedItemsSection.tsx`

Separador visual entre items pendientes y completados:
- Border dashed gris
- "COMPLETADOS (n)" con check icon

**Props:**
```typescript
interface CompletedItemsSectionProps {
  count: number;
}
```

### 8. ActionButton
**Ubicación:** `components/comanda/ActionButton.tsx`

Botón reutilizable para cambios de estado:
- Icon + label
- Colores personalizables
- Active:scale-95 para feedback táctil

**Props:**
```typescript
interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  colorClass: string; // 'bg-yellow-500', 'bg-green-600', etc.
}
```

### 9. EmptyState
**Ubicación:** `components/comanda/EmptyState.tsx`

Mensaje cuando no hay pedidos:
- Icono grande
- Título y descripción

### 10. NoItemsMessage
**Ubicación:** `components/comanda/NoItemsMessage.tsx`

Mensaje genérico para columnas sin items

## Flujo de Datos

```
page.tsx (Estado global)
  ├── pedidos: Pedido[]
  ├── itemsCompletados: Set<string>
  ├── autoRefresh: boolean
  │
  └── ComandaHeader
  └── ComandaColumn x 3
      ├── ColumnHeader
      ├── Pedido Card
      │   ├── PedidoHeader
      │   ├── ItemCheckbox[] (activos)
      │   ├── CompletedItemsSection (si hay)
      │   ├── ItemCheckbox[] (completados)
      │   └── ActionButton
      └── NoItemsMessage (si vacía)
```

## Estados y Colores

| Estado | Columna | Color Border | Color Texto | Transición |
|--------|---------|--------------|-------------|-----------|
| pendiente | PENDIENTES | red-600 | red-600 | → preparando |
| preparando | EN PREPARACIÓN | yellow-600 | yellow-600 | → listo |
| listo | LISTOS | green-600 | green-600 | → entregado |

## Tiempo Transcurrido

- **< 15 minutos:** Verde (verde-600)
- **15-30 minutos:** Amarillo (yellow-600)
- **> 30 minutos:** Rojo (red-600)

## Características de Touch

- Botones grandes (py-4, text-lg)
- Icons de buen tamaño (h-6 w-6)
- Active:scale-95 feedback visual
- Espacios amplios entre elementos
- Colores contrastantes

## Cómo Usar

### Para agregar una nueva característica:

1. **Crear un nuevo componente atómico** en `/components/comanda/`
2. **Definir sus props** de manera clara
3. **Usar ComandaColumn** para colocar el componente en una de las tres columnas
4. **O crear un nuevo componente de composición** que agrupe múltiples componentes

### Ejemplo: Agregar sonido cuando pedido está listo

```typescript
// 1. Crear components/comanda/CompletedSound.tsx
export function CompletedSound() {
  useEffect(() => {
    const audio = new Audio('/sounds/completed.mp3');
    audio.play();
  }, []);
  return null;
}

// 2. Usar en ComandaColumn cuando se cambia a 'listo'
<CompletedSound />
```

## Ventajas de esta Arquitectura

✅ **Reusable:** Componentes pueden usarse en otras páginas
✅ **Testeable:** Cada componente es independiente
✅ **Mantenible:** Cambios en un componente no afectan otros
✅ **Escalable:** Fácil agregar nuevas características
✅ **Claro:** Props bien definidas reducen bugs
✅ **Performance:** Solo re-renderiza lo necesario

## Notas

- El estado global (pedidos, itemsCompletados) está en `page.tsx`
- Los componentes NO mantienen estado, solo lo reciben via props
- Las funciones de utilidad (tiempo, colores) se pasan como props
- El auto-refresh está a 3 segundos en producción
