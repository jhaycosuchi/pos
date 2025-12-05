# 🎯 Guía Rápida: Modal Detallado de Solicitudes

## TL;DR

Se implementó un nuevo modal que muestra **TODOS los detalles del pedido** antes de solicitar edición o eliminación.

**Antes**: 
```
confirm("¿Estás seguro?")  ← Sin mostrar detalles
```

**Ahora**:
```
Modal detallado que muestra:
✓ Información general (número, cuenta, mesa)
✓ Lista COMPLETA de items con precios
✓ Total del pedido
✓ Notas/especificaciones
✓ Contexto de la solicitud
```

## Flujo de Uso en Caja

### 1. Eliminar un Pedido

```
Caja Dashboard
└─ Selecciona una Cuenta Cerrada
   └─ Ve un Pedido
      └─ Click en "🗑️ Eliminar"
         └─ Modal Detallado aparece
            ├─ "🗑️ Solicitud de Eliminación"
            ├─ Muestra todos los items
            ├─ Muestra total
            └─ User hace click en "Solicitar Eliminación"
               └─ ✅ Solicitud enviada
                  └─ El mesero lo ve en "⚠️ Modificaciones"
```

### 2. Editar un Pedido

```
Caja Dashboard
└─ Selecciona una Cuenta Cerrada
   └─ Ve un Pedido
      └─ Click en "✏️ Editar"
         └─ Modal Detallado aparece
            ├─ "✏️ Solicitud de Edición" (color azul)
            ├─ Muestra todos los items
            ├─ Muestra total
            └─ User hace click en "Enviar Edición"
               └─ ✅ Solicitud enviada
                  └─ El mesero lo ve en "⚠️ Modificaciones"
```

## Lo que Verás en el Modal

### Header
```
[Ícono] Solicitud de Edición/Eliminación     [X para cerrar]
Detalles completos del pedido
```

### Información del Pedido
```
📋 Información del Pedido
├─ Número de Pedido: Ped 001
├─ Cuenta: Cuenta 003
├─ Mesa: Mesa 2
├─ Total Items: 4
├─ Total: $536.00
└─ Estado: cerrada
```

### Artículos
```
📦 Artículos (4)
├─ 2x Hamburguesa Especial
│  Unitario: $22.50 → Total: $45.00
│  📝 Sin cebolla, con queso
├─ 1x Ensalada Caesar
│  Unitario: $20.00 → Total: $20.00
├─ 2x Cerveza Mediana
│  Unitario: $15.00 → Total: $30.00
└─ 3x Papas Fritas
   Unitario: $5.00 → Total: $15.00
```

### Confirmación
```
⚠️  Cambios Solicitados / Eliminación
Este pedido será marcado para [edición/eliminación].
El mesero deberá revisar y aprobar los cambios.
```

### Botones de Acción
```
[Cancelar]                    [✏️ Enviar Edición]
                              o
                          [🗑️ Solicitar Eliminación]
```

## Diferencias Visuales

| Aspecto | Edición | Eliminación |
|---------|---------|------------|
| Ícono | ✏️ Azul | 🗑️ Rojo |
| Header | "✏️ Solicitud de Edición" | "🗑️ Solicitud de Eliminación" |
| Color fondo | Azul oscuro/tenue | Rojo oscuro/tenue |
| Botón principal | Azul | Rojo |
| Tipo de cambio | Cambios en items | Eliminación completa |

## Animaciones

### Cuando abre el modal
```
Modal crece suavemente (0.95 → 1.0)
Opacity sube (0 → 1)
Backdrop se oscurece
```

### Cuando confirmas
```
Spinner rotativo en el botón
Contenido ligeramente pálido (processing)
Botones deshabilitados
```

### Cuando completa
```
Overlay colorido aparece (verde para éxito, rojo para error)
Ícono grande (✓ o ✗)
Mensaje "¡Solicitud Enviada!" o "¡Error!"
Se cierra automáticamente después de 1.5 segundos
```

## Comportamientos

### ✅ Si todo sale bien
```
1. Usuario confirma en modal
2. Spinner aparece
3. Se envía POST a /api/modificaciones
4. ✓ Overlay verde
5. "¡Solicitud Enviada!"
6. Modal cierra automáticamente
7. Datos se refrescan
8. Mesero ve solicitud en "⚠️ Modificaciones"
```

### ❌ Si hay error
```
1. Usuario confirma en modal
2. Spinner aparece
3. Se intenta POST a /api/modificaciones
4. ✗ Overlay rojo
5. "¡Error!"
6. Modal permanece abierto
7. Usuario puede intentar nuevamente o cancelar
```

### 🚫 Si el usuario cancela
```
1. Usuario hace click en "Cancelar"
2. Modal se cierra
3. Modal se limpia (estado y datos se resetean)
4. Nada se envía a la API
```

## Información Que Se Envía

Cuando confirmas una solicitud, se envía:

```json
{
  "tipo": "edicion" | "eliminacion",
  "pedido_id": 123,
  "cuenta_id": 456,
  "solicitado_por": "Caja",
  "detalles": "Solicitud de edición del pedido Ped 001",
  "cambios": "Edición de items del pedido"
}
```

El mesero luego:
1. Ve la solicitud en "⚠️ Modificaciones"
2. Revisa detalles completos (usando ModificationDetailModal)
3. Aprueba o Rechaza la solicitud

## Casos de Uso

### ✅ Usar para Eliminar
- Mesero se equivocó en un pedido
- Cliente cambió de opinión
- Pedido duplicado

### ✅ Usar para Editar
- Necesita cambiar cantidad
- Necesita cambiar items
- Cambios de especificaciones
- Agregar/quitar notas

### ❌ No Usar Para
- Cambiar nombre de cliente → Edita la cuenta directamente
- Cambiar mesa → Edita la cuenta directamente
- Cambiar mesero responsable → Edita la cuenta directamente

## Validaciones Automáticas

El modal NO permitirá confirmar si:
- ❌ No hay pedido seleccionado
- ❌ No hay cuenta seleccionada
- ❌ El servidor está offline
- ❌ Hay error en la solicitud POST

En estos casos verás un overlay rojo con ✗ y podrás reintentar.

## Acciones Que Puedes Hacer

| Acción | Resultado |
|--------|-----------|
| Click [X] en esquina | Cierra modal sin hacer nada |
| Click "Cancelar" | Cierra modal sin hacer nada |
| Click fuera del modal | Cierra modal sin hacer nada |
| Click "Enviar Edición" | Envía solicitud de edición |
| Click "Solicitar Eliminación" | Envía solicitud de eliminación |
| Esperar 1.5s tras éxito | Modal se cierra automáticamente |

## Preguntas Frecuentes

### P: ¿Puedo editar el pedido directamente desde el modal?
**R**: No. El modal solo te muestra detalles y solicita aprobación. El mesero hace los cambios reales desde atiendemesero cuando aprueba.

### P: ¿Qué pasa si cancelo la solicitud?
**R**: Nada. No se envía nada, el pedido permanece igual. Puedes intentar nuevamente.

### P: ¿El mesero recibe notificación?
**R**: Ve la solicitud en el tab "⚠️ Modificaciones" del dashboard de caja. No hay notificación push (yet).

### P: ¿Cuánto tarda en aparecer en "Modificaciones"?
**R**: Inmediatamente. El tab se refresca cada 5 segundos.

### P: ¿Puedo enviar múltiples solicitudes del mismo pedido?
**R**: Sí, pero solo una será "pendiente" a la vez. Las anteriores se habrán procesado.

### P: ¿Qué pasa si me equivoco?
**R**: Haces clic en "Cancelar" y nada se envía. O si ya la enviaste, el mesero puede rechazarla.

---

**Última actualización**: 2025-12-04 16:45 UTC
**Status**: ✅ Live en producción
**PM2**: Restart #782
