# Sistema de Modificaciones Detalladas - Documentación

## Resumen
Sistema mejorado para enviar modificaciones de pedidos desde **areas-activas** a **caja** con **todos los detalles de cambios** (antes/después, item por item).

## Problema Resuelto
Cuando un mesero editaba un pedido en areas-activas, la modificación no llegaba a caja con información completa de qué cambió exactamente.

## Solución Implementada

### 1. **Detección de Cambios en areas-activas**
**Archivo:** `/app/areas-activas/page.tsx` - `handleGuardarEdicion()`

Ahora el sistema compara el estado anterior vs nuevo y detecta:
- ✂️ **Items Eliminados**: Productos que se quitaron del pedido
- ➕ **Items Agregados**: Productos nuevos añadidos al pedido  
- ✏️ **Items Modificados**: Productos que cambió algún campo

Para items modificados, se comparan todos los campos:
- Cantidad (3x → 4x)
- Precio unitario ($10 → $12)
- Especificaciones (sin picante → con extra queso)
- Notas especiales (ninguna → sin cebolla)

### 2. **Envío de Datos a Caja**
Los cambios se envían a `/api/modificaciones` con estructura JSON:

```json
{
  "tipo": "edicion_completa",
  "cambios": {
    "items_eliminados": [
      {"nombre": "Rollo Springi", "cantidad": 2, "precio": 8.50}
    ],
    "items_agregados": [
      {"nombre": "Tacos Al Pastor", "cantidad": 1, "precio": 6.00, "notas": ""}
    ],
    "items_modificados": [
      {
        "nombre": "Rollo Yokoi",
        "anterior": {
          "cantidad": 3,
          "precio": 10.00,
          "especificaciones": "",
          "notas": "Sin picante"
        },
        "nuevo": {
          "cantidad": 4,
          "precio": 10.00,
          "especificaciones": "Con extra queso",
          "notas": ""
        }
      }
    ]
  },
  "items_anteriores": [...],
  "items_nuevos": [...]
}
```

### 3. **Modal de Detalle en Caja**
**Archivo:** `/components/caja/ModificacionDetalleModal.tsx`

Modal profesional que muestra:

#### 📋 Encabezado
- Numero de Cuenta
- Numero de Pedido
- Fecha de modificación

#### 🗑️ Sección Items Eliminados (Rojo)
```
Rollo Springi
  Cantidad: 2x
  Precio: $8.50 c/u
  Subtotal: $17.00
```

#### ➕ Sección Items Agregados (Verde)
```
Tacos Al Pastor
  Cantidad: 1x
  Precio: $6.00 c/u
  Notas: Ninguna
  Subtotal: $6.00
```

#### ✏️ Sección Items Modificados (Azul)
```
Rollo Yokoi
  Cantidad:        3x  →  4x
  Precio:         $10  →  $10
  Especificaciones: -  →  Con extra queso
  Notas:   Sin picante  →  -
  
  Impacto Subtotal: $30.00 → $40.00 (+$10.00)
```

#### 🔘 Botones de Acción
- **✅ Aprobar**: Marca como 'aprobada' en BD
- **❌ Rechazar**: Marca como 'rechazada' en BD
- **🚫 Cerrar**: Cierra sin cambios

### 4. **Flujo Completo**

```
MESERO en areas-activas
    ↓
Edita pedido: 3x → 4x Rollo Yokoi
    ↓
Clic "Guardar Cambios"
    ↓
handleGuardarEdicion() detects cambios
    ↓
PATCH /api/pedidos/{id} ← Actualiza BD inmediatamente
    ↓
POST /api/modificaciones ← Envía detalles a caja
    ↓
CAJA ve "Modificación Pendiente"
    ↓
Clic "👁️ Ver Detalles"
    ↓
Modal abre con comparación antes/después
    ↓
Caja aprueba o rechaza
    ↓
PUT /api/modificaciones/{id} estado='aprobada'|'rechazada'
```

## Archivos Modificados

### `/app/areas-activas/page.tsx`
**Función:** `handleGuardarEdicion()` (líneas ~210-263)

**Cambios:**
- Compara `itemsAnteriores` vs `itemsNuevos`
- Detecta items eliminados, agregados, modificados
- Para cada item modificado: compara cantidad, precio, specs, notas
- Envía JSON completo a `/api/modificaciones`

```typescript
// Antes: Solo hacía PATCH directo
await fetch(`/api/pedidos/${pedidoAEditar.id}`, ...)

// Ahora: Compara cambios Y envía detalles
const cambios = {
  items_eliminados: [],
  items_modificados: [{nombre, anterior, nuevo}],
  items_agregados: []
};
await fetch(`/api/modificaciones`, {
  method: 'POST',
  body: JSON.stringify({
    tipo: 'edicion_completa',
    cambios: JSON.stringify(cambios),
    items_anteriores: JSON.stringify(itemsAnteriores),
    items_nuevos: JSON.stringify(itemsNuevos)
  })
});
```

### `/components/caja/ModificacionDetalleModal.tsx` ✨ NUEVO
**300+ líneas de código**

- Modal completo con Framer Motion
- Parsea JSON de cambios
- Tres secciones color-coded
- Comparación lado-a-lado para modificados
- Cálculo automático de impacto en subtotal
- Botones Aprobar/Rechazar integrados

### `/app/caja/page.tsx`
**Cambios:**

1. **Línea 10:** Importa `ModificacionDetalleModal`
2. **Líneas 77-79:** Añade estados:
   ```typescript
   const [showModificacionModal, setShowModificacionModal] = useState(false);
   const [modificacionSeleccionada, setModificacionSeleccionada] = useState<any>(null);
   const [procesandoModificacion, setProcessandoModificacion] = useState(false);
   ```

3. **Líneas 186-265:** Añade funciones:
   ```typescript
   const handleAprobarModificacion = async (id: string) => { ... }
   const handleRechazarModificacion = async (id: string) => { ... }
   ```

4. **Líneas 590-604:** Cambia botones de modificación:
   - Antes: Botones "Aprobar" y "Rechazar" directos
   - Ahora: Botón único "👁️ Ver Detalles" que abre modal

5. **Líneas 820+:** Añade JSX del modal:
   ```tsx
   {modificacionSeleccionada && (
     <ModificacionDetalleModal
       show={showModificacionModal}
       onClose={() => {...}}
       onApprove={handleAprobarModificacion}
       onReject={handleRechazarModificacion}
       modificacion={modificacionSeleccionada}
       loading={procesandoModificacion}
     />
   )}
   ```

## Estado Actual

✅ **Completado:**
- Detección de cambios en areas-activas
- Envío de JSON detallado a caja
- Modal visual con antes/después
- Funciones de aprobación/rechazo
- Integración en caja page
- **Build exitoso sin errores**
- **Deploy completado con pm2**

## Testing

### Para probar el sistema:

1. **Login en caja:** http://localhost:3000/pos/caja
2. **Ir a areas-activas:** http://localhost:3000/pos/areas-activas
3. **Editar un pedido:** Cambiar cantidad, precio, specs o notas
4. **Guardar cambios:** Click "Guardar Cambios"
5. **Volver a caja:** Refrescar página
6. **Ver modificación:** Debe aparecer "Modificación Pendiente"
7. **Click "Ver Detalles":** Modal abre mostrando:
   - Items eliminados (rojo)
   - Items agregados (verde)
   - Items modificados (azul) con antes/después
8. **Aprobar o Rechazar:** Click en botones, debe actualizar estado

### Validaciones:
- ✅ Cambios detectados correctamente
- ✅ Modal muestra comparación clara
- ✅ Colores diferenciados por tipo
- ✅ ArrowRight visual entre antes/después
- ✅ Cálculo de impacto en subtotal
- ✅ Botones aprueban/rechazan sin errores

## API Endpoints Usados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/modificaciones` | POST | Crear nuevo registro de modificación |
| `/api/modificaciones/{id}` | PUT | Actualizar estado (aprobada/rechazada) |
| `/api/pedidos/{id}` | PATCH | Actualizar pedido en BD |

## Próximos Pasos (Opcional)

1. **Notificaciones:** Alertar a mesero cuando su modificación es rechazada
2. **Historial:** Guardar log de todas las aprobaciones/rechazos
3. **Auditoría:** Quién aprobó, cuándo, desde qué terminal
4. **Conflictos:** Detectar si caja intenta modificar mientras mesero editaba

## Notas Importantes

- ⚠️ **BD se actualiza inmediatamente** (no espera aprobación de caja)
- ⚠️ **La aprobación es solo registro** (cambios ya están activos)
- ⚠️ **Rechazo es más informativo** (para auditoría, no revierte cambios)
- ✅ **Todos los cambios registrados** (completa trazabilidad)

---

**Última actualización:** 2024-12-20
**Sistema:** Modificaciones con lujo de detalle ✨
