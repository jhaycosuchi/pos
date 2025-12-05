# Implementación: Modal Detallado para Solicitudes de Edición/Eliminación

## Descripción General

Se ha implementado un nuevo componente modal (`PedidoDetailModal`) que proporciona una interfaz detallada y robusta para manejar solicitudes de edición y eliminación de pedidos en la caja. El modal muestra toda la información contextual del pedido ANTES de que el usuario confirme la acción.

**Lema**: "Lujo de Detalle" - Mostrar EXACTAMENTE qué se está cambiando/eliminando con total transparencia.

## Características Principales

### 1. **Modal Detallado - Información Completa**

El modal muestra:

```
┌─────────────────────────────────────────────────────────────────┐
│ ✏️ Solicitud de Edición                  [×]                    │
│ Detalles completos del pedido                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📋 Información del Pedido                                       │
│ ├─ Número de Pedido: Ped 001                                   │
│ ├─ Cuenta: Cuenta 003                                          │
│ ├─ Mesa: Mesa 2                                                │
│ ├─ Total Items: 4 items                                        │
│ ├─ Total: $536.00                                              │
│ └─ Estado: cerrada                                             │
│                                                                 │
│ 📦 Artículos (4)                                               │
│ ├─ 2x Hamburguesa Especial                                     │
│ │  Notas: Sin cebolla, con queso                              │
│ │  Total: $45.00                                               │
│ ├─ 1x Ensalada Caesar                                          │
│ │  Total: $20.00                                               │
│ ├─ 2x Cerveza Mediana                                          │
│ │  Total: $30.00                                               │
│ └─ 3x Papas Fritas                                             │
│    Total: $15.00                                               │
│                                                                 │
│ ⚠️  Cambios Solicitados                                        │
│ Este pedido será marcado para edición. El mesero deberá        │
│ revisar y aprobar los cambios.                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Cancelar]                    [✏️ Enviar Edición]              │
└─────────────────────────────────────────────────────────────────┘
```

### 2. **Dos Modos de Operación**

#### Modo EDICIÓN (Azul)
- **Header**: "✏️ Solicitud de Edición"
- **Color Scheme**: Azul (de-emphasized)
- **Botón**: "Enviar Edición"
- **Propósito**: Solicitar cambios en los items del pedido

#### Modo ELIMINACIÓN (Rojo)
- **Header**: "🗑️ Solicitud de Eliminación"
- **Color Scheme**: Rojo (de-emphasized)
- **Botón**: "Solicitar Eliminación"
- **Propósito**: Solicitar eliminación completa del pedido

### 3. **Animaciones y UX**

**Entrada del Modal**:
- `scale: 0.95 → 1` suave con Framer Motion
- `y: 20 → 0` deslizamiento elegante
- Opacity fade in

**Animación de Éxito**:
- Overlay de color (verde para éxito, rojo para error)
- Ícono animado (✓ o ✗)
- Mensaje de estado con tamaño grande
- Auto-cierre después de 1.5 segundos

**Spinner de Procesamiento**:
- Spinner rotativo durante POST a API
- Botones deshabilitados durante procesamiento

### 4. **Integración con Caja**

#### Estados Agregados
```typescript
const [showPedidoDetailModal, setShowPedidoDetailModal] = useState(false);
const [modalActionType, setModalActionType] = useState<'editar' | 'eliminar' | null>(null);
const [pedidoForDetailModal, setPedidoForDetailModal] = useState<PedidoCuenta | null>(null);
```

#### Manejadores Actualizados

**handleEditarPedido** (ANTES):
```typescript
const handleEditarPedido = (pedido: PedidoCuenta) => {
  setPedidoAEditar(pedido);
  setShowEditarModal(true);  // Modal simple
};
```

**handleEditarPedido** (AHORA):
```typescript
const handleEditarPedido = (pedido: PedidoCuenta) => {
  setPedidoForDetailModal(pedido);
  setModalActionType('editar');
  setShowPedidoDetailModal(true);  // Modal detallado
};
```

**handleEliminarPedido** (ANTES):
```typescript
const handleEliminarPedido = async (pedido: PedidoCuenta) => {
  if (!confirm(`¿Estás seguro...`)) return;  // Simple confirm()
  // POST a API
};
```

**handleEliminarPedido** (AHORA):
```typescript
const handleEliminarPedido = (pedido: PedidoCuenta) => {
  setPedidoForDetailModal(pedido);
  setModalActionType('eliminar');
  setShowPedidoDetailModal(true);  // Modal detallado
};
```

#### Nuevo Manejador

**handleSubmitModification**:
```typescript
const handleSubmitModification = async (actionType: 'editar' | 'eliminar') => {
  // Valida pedido y cuenta
  // POST a /api/modificaciones con tipo e info completa
  // Muestra animación de éxito
  // Recarga datos
};
```

## Archivos Modificados

### 1. `/components/PedidoDetailModal.tsx` (NUEVO)

**Tamaño**: ~350 líneas
**Responsabilidad**: Renderizar modal detallado con toda la información del pedido

**Componentes principales**:
- Header con icono y tipo
- Sección de información general (cuenta, mesa, items count, total)
- Sección de artículos con detalles (cantidad, precio unitario, notas)
- Sección de confirmación con contexto de la solicitud
- Botones de acción (Cancelar, Enviar)
- Overlay de resultado (éxito/error)

### 2. `/app/dashboard/caja/page.tsx` (MODIFICADO)

**Cambios**:
1. Importación de `PedidoDetailModal`
2. Tres nuevos estados:
   - `showPedidoDetailModal`: controla visibilidad del modal
   - `modalActionType`: 'editar' | 'eliminar' | null
   - `pedidoForDetailModal`: referencia al pedido actual
3. Función `handleSubmitModification`: maneja confirmación del modal
4. Actualización de `handleEditarPedido`: abre modal detallado
5. Actualización de `handleEliminarPedido`: abre modal detallado
6. Renderización del componente `PedidoDetailModal` en JSX

## Flujo de Operación

### Caso 1: Solicitar Eliminación de Pedido

```
Usuario en Caja → Ve pedido que quiere eliminar
     ↓
Hace clic en botón "Eliminar"
     ↓
handleEliminarPedido() se ejecuta
     ↓
setPedidoForDetailModal(pedido)
setModalActionType('eliminar')
setShowPedidoDetailModal(true)
     ↓
Modal detallado aparece con animación
- Muestra "🗑️ Solicitud de Eliminación"
- Muestra todos los items del pedido
- Muestra total y contexto
     ↓
Usuario revisa detalles
     ↓
Usuario hace clic en "Solicitar Eliminación"
     ↓
handleSubmitModification('eliminar') se ejecuta
     ↓
POST a /api/modificaciones con:
{
  tipo: 'eliminacion',
  pedido_id: <id>,
  cuenta_id: <id>,
  solicitado_por: 'Caja',
  detalles: 'Solicitud de eliminación del pedido Ped 001'
}
     ↓
Spinner rotativo mientras se procesa
     ↓
✓ Overlay verde aparece con "¡Solicitud Enviada!"
     ↓
Espera 1.5 segundos
     ↓
Modal cierra automáticamente
     ↓
fetchData() se ejecuta para refrescar
     ↓
El mesero ve la solicitud en tab "⚠️ Modificaciones"
```

### Caso 2: Solicitar Edición de Pedido

```
Similar a Caso 1, pero con:
- ✏️ Solicitud de Edición (color azul)
- Botón "Enviar Edición"
- tipo: 'edicion' en POST
```

## Validaciones y Seguridad

### 1. **Validación de Contexto**
```typescript
if (!pedidoForDetailModal || !selectedCuenta?.id) {
  throw new Error('No hay pedido o cuenta seleccionada');
}
```

### 2. **Manejo de Errores**
```typescript
try {
  const response = await fetch(API.MODIFICACIONES, { ... });
  if (!response.ok) throw new Error('Error al enviar la solicitud');
  // Éxito
} catch (error) {
  // Muestra overlay rojo con ✗
  // Mantiene modal abierto para reintentos
}
```

### 3. **Prevención de Doble-Click**
```typescript
disabled={isProcessing}  // Desactiva botones durante POST
```

## Información Mostrada en el Modal

### Información General del Pedido
- ✅ Número de Pedido
- ✅ Número de Cuenta
- ✅ Mesa (si aplica)
- ✅ Tipo (Para Llevar o Mesa)
- ✅ Cantidad de Items
- ✅ Total
- ✅ Estado del Pedido

### Detalle de Artículos
- ✅ Nombre del artículo
- ✅ Cantidad
- ✅ Precio unitario
- ✅ Total por artículo
- ✅ Notas/Especificaciones (si existen)

### Contexto de la Solicitud
- ✅ Tipo de solicitud (Edición vs Eliminación)
- ✅ Aviso de que el mesero debe aprobar
- ✅ Información de quién solicita (Caja)

## Casos de Uso Cubiertos

| Caso | Descripción | Estado |
|------|-------------|--------|
| 1 | Usuario abre modal, revisa detalles, cancela | ✅ Completo |
| 2 | Usuario solicita eliminación, se envía exitosamente | ✅ Completo |
| 3 | Usuario solicita edición, se envía exitosamente | ✅ Completo |
| 4 | Error en la solicitud (401, 500), muestra overlay rojo | ✅ Completo |
| 5 | Usuario intenta doble-click durante procesamiento | ✅ Prevenido |
| 6 | Modal se cierra automáticamente tras éxito | ✅ Completo |

## Próximos Pasos (Roadmap)

### Fase 2: Integración en Areas-Activas
- [ ] Agregar mismo modal cuando se solicita agregar items a cuenta existente
- [ ] Mostrar preview de los items que se van a agregar
- [ ] Misma UX consistente entre caja y areas-activas

### Fase 3: Mejoras Avanzadas
- [ ] Razón personalizada: campo de texto opcional "¿Por qué?"
- [ ] Diff view: mostrar antes/después para ediciones
- [ ] Edición en tiempo real antes de confirmar
- [ ] Historial de solicitudes rechazadas

### Fase 4: Analytics
- [ ] Track: % de solicitudes canceladas vs enviadas
- [ ] Track: Razones más comunes de rechazo
- [ ] Dashboard: Datos de modificaciones por mesero

## Testing Manual

### Test 1: Solicitud de Eliminación
```bash
1. Ve a https://operacion.mazuhi.com/pos/dashboard/caja
2. Abre una cuenta cerrada
3. Haz clic en "Eliminar" en un pedido
4. Verifica:
   - Modal aparece con "🗑️ Solicitud de Eliminación"
   - Todos los items del pedido se muestran
   - Total es correcto
   - Mesa/Cuenta se muestran correctamente
5. Haz clic en "Solicitar Eliminación"
6. Verifica:
   - Spinner aparece
   - Overlay verde con ✓ aparece
   - Modal se cierra después de 1.5s
   - Tab "⚠️ Modificaciones" muestra la nueva solicitud
```

### Test 2: Solicitud de Edición
```bash
1. Ve a https://operacion.mazuhi.com/pos/dashboard/caja
2. Abre una cuenta cerrada
3. Haz clic en "Editar" en un pedido
4. Verifica:
   - Modal aparece con "✏️ Solicitud de Edición"
   - Color es azul (diferente a eliminación roja)
5. Haz clic en "Enviar Edición"
6. Similar a Test 1 pero con tipo:'edicion'
```

### Test 3: Error Handling
```bash
1. Detén el servidor o simula error en API
2. Abre modal y confirma solicitud
3. Verifica:
   - Overlay rojo con ✗ aparece
   - Mensaje de error muestra
   - Modal permanece abierto
   - Usuario puede cancelar y reintentar
```

## Estadísticas de Implementación

| Métrica | Valor |
|---------|-------|
| Lineas de código nuevo | ~350 (PedidoDetailModal) |
| Lineas modificadas | ~40 (caja/page.tsx) |
| Nuevos componentes | 1 |
| Nuevos endpoints usados | 0 (reutiliza /api/modificaciones) |
| Archivos impactados | 2 |
| Tiempo de compilación | ~8 segundos |
| Tamaño de bundle adicional | ~5 KB minified |

## Notas de Deployment

- ✅ Build compiló exitosamente
- ✅ PM2 reiniciado exitosamente (ID: 782+)
- ✅ No hay breaking changes
- ✅ Backwards compatible (old functions still exist)
- ✅ Todos los tipos TypeScript válidos

## Conclusión

El modal detallado implementa el concepto de "lujo de detalle" permitiendo a los operadores de caja:

1. **Ver EXACTAMENTE qué se va a cambiar** antes de confirmar
2. **Entender el contexto completo** (cuenta, mesa, items)
3. **Tomar decisiones informadas** basadas en información completa
4. **Prevenir errores** mediante una interfaz clara y deliberada

El flujo es ahora **robusto, transparente y user-friendly**.

---

**Status**: ✅ Implementado y Deployado
**PM2 Restart**: 782
**Fecha**: 2025-12-04 16:45:00 UTC
