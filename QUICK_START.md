# ⚡ Guía Rápida - Comanda Digital

## 🚀 Start Rápido

```bash
# 1. Compilar
npm run build

# 2. Ejecutar
npm run dev

# 3. Abrir navegador
# http://localhost:3000/comanda
```

## 🎯 Operaciones Básicas

### Ver Pedidos
```
✅ Página se carga automáticamente
✅ Muestra 3 columnas: PENDIENTES | EN PREPARACIÓN | LISTOS
✅ Auto-refresh cada 3 segundos
```

### Iniciar Cocina (Pendiente → Preparando)
```
1. Ir a columna PENDIENTES
2. Buscar el pedido
3. Hacer click en "Comenzar"
4. ✅ Pedido se mueve a EN PREPARACIÓN
5. ✅ Los items ahora tienen checkboxes
```

### Marcar Items como Listos (En Preparación)
```
1. En columna EN PREPARACIÓN
2. Click en cada item para marcarlo como completado
3. ✅ Item se mueve abajo (con check verde)
4. ✅ Se muestra "COMPLETADOS (n)"
```

### Completar Pedido (Preparando → Listo)
```
1. Todos los items marcados ✓
2. Click en "Completar"
3. ✅ Pedido se mueve a LISTOS
```

### Entregar Pedido (Listo → Entregado)
```
1. En columna LISTOS
2. Click en "Entregado"
3. ✅ Pedido sale de la comanda
```

## 🔄 Control de Auto-Refresh

### Activado (Azul)
```
✅ Recarga cada 3 segundos
✅ Nuevos pedidos aparecen automáticamente
✅ Cambios de otros usuarios se ven al instante
```

### Desactivado (Gris)
```
✅ Manual refresh solo si haces click
✅ Útil si necesitas concentrarte
✅ No consume recursos innecesarios
```

### Botón Actualizar (Siempre disponible)
```
✅ Click para refrescar inmediatamente
✅ Funciona si auto-refresh está activado o no
```

## 📱 Interfaz Táctil

```
Pantalla: Optimizada para tablets/touch
Botones: Grandes (fácil de tocar)
Texto: Legible desde lejos
Iconos: Claros y significativos
Feedback: Botones se reducen cuando los tocas (active:scale-95)
```

## 🎨 Colores y Significados

```
ROJO (> 30 min)      ❌ URGENTE - Pedido muy antiguo
AMARILLO (15-30)     ⚠️ REVISAR - Pedido algo antiguo
VERDE (< 15 min)     ✅ OK - Pedido reciente

Columnas:
- PENDIENTES:        Rojo (sin iniciar)
- EN PREPARACIÓN:    Amarillo (cocinando)
- LISTOS:            Verde (completado)
```

## ✅ Checklist de Cocina

### Cada Pedido
```
□ Leer mesa/para llevar
□ Verificar mesero
□ Revisar tiempo (color)
□ Leer items
□ Buscar restricciones/notas
□ Cocinar items
□ Marcar cada item ✓
□ Hacer click "Completar"
□ Verificar en LISTOS
```

### Inicio de Turno
```
□ Verificar comanda
□ Confirmar auto-refresh está ON
□ Prepararse para primeros pedidos
□ ¡A cocinar!
```

### Fin de Turno
```
□ Verificar LISTOS está vacío
□ Verificar EN PREPARACIÓN está vacío
□ Entrega todos los LISTOS
□ ¡Listo!
```

## 🐛 Problemas Comunes

### Pedido no aparece
```
❌ Problema: Creaste un pedido pero no aparece
✅ Solución: 
   1. Esperar 3 segundos (auto-refresh)
   2. O hacer click en "Actualizar"
   3. O desactivar y activar auto-refresh
```

### Auto-refresh no funciona
```
❌ Problema: No se actualizan los pedidos
✅ Solución:
   1. Verificar que botón esté azul (activado)
   2. Hacer click en "Actualizar"
   3. Recargar página (F5)
   4. Verificar conexión a internet
```

### Item no se marca como completado
```
❌ Problema: Click no funciona en checkbox
✅ Solución:
   1. Verificar que estés en EN PREPARACIÓN
   2. Recargar página
   3. Verificar que el pedido esté en "preparando"
   4. Probar en otra columna
```

### Botón "Completar" no funciona
```
❌ Problema: No puedo mover a LISTOS
✅ Solución:
   1. Verificar que todos items estén ✓
   2. Esperar a que se sincronice (1 seg)
   3. Hacer click nuevamente
   4. Recargar página
```

### Pantalla lenta/lag
```
❌ Problema: Interfaz va lenta
✅ Solución:
   1. Desactivar auto-refresh temporalmente
   2. Cerrar otras pestañas
   3. Limpiar caché (Ctrl+Shift+Supr)
   4. Recargar página
```

## 💡 Tips Profesionales

### Organización
```
1. Trabajar por orden de tiempo (los más rojos primero)
2. Agrupar items similares
3. Comunicación con el equipo
4. Verificar cantidades antes de cocinar
```

### Velocidad
```
1. Memorizar patrones de items frecuentes
2. Usar atajos de teclado si aplica
3. Marcar items mientras cocinas
4. No esperar a terminar todo para marcar
```

### Calidad
```
1. Leer TODAS las notas/restricciones
2. Verificar cantidad exacta
3. Presentación adecuada
4. Pedir confirmación si es confuso
```

## 📊 Dashboard Rápido

```
Pantalla Actual:

┌─ COMANDA DIGITAL ──────────────────────────────────┐
│                                                    │
│  Auto: [ON] [Actualizar]                          │
│                                                    │
│ ┌──────────┬───────────┬─────────┐               │
│ │PENDIENTES│EN PREP    │LISTOS   │               │
│ │    5     │    12     │    3    │               │
│ │          │           │         │               │
│ │ ├─ PED 1 │├─ PED 2   │├─ PED 4 │              │
│ │ ├─ PED 2 │├─ PED 3   │├─ PED 5 │              │
│ │ ├─ PED 3 │├─ PED 5   │├─ PED 7 │              │
│ │ ├─ PED 4 │├─ ...     │        │              │
│ │ └─ PED 5 │└─ ...     │        │              │
│ └──────────┴───────────┴─────────┘               │
│                                                    │
└────────────────────────────────────────────────────┘

Lectura rápida:
• ¿Cuántos pendientes? 5
• ¿Cuántos cocinando? 12 (mucho trabajo)
• ¿Cuántos listos? 3 (entregar pronto)
• ¿Cuál es el más antiguo? Revisar colores
```

## 🔧 Atajos (Próximas versiones)

```
Ctrl+R    → Actualizar
Ctrl+H    → Toggle auto-refresh
Espacio   → Marcar/desmarcar item (en preparación)
Enter     → Ir al siguiente pedido
Esc       → Cancelar acción
?         → Mostrar ayuda
```

*Nota: Atajos no implementados aún, pero serán agregados*

## 📞 Soporte

### Preguntas
```
¿Dónde voy?       → /comanda
¿Cómo empiezo?    → Ver primeros 3 pasos arriba
¿Me confundí?     → Revisar colores y tiempos
¿Está roto?       → Recargar (F5)
```

### Reportar Bugs
```
Si encuentras un problema:
1. Anota qué hiciste exactamente
2. Toma screenshot
3. Reporta al admin
4. Mientras tanto: Refresca la página
```

## ✨ Características Futuras

```
📋 Próximas actualizaciones:
□ Sonidos de notificación
□ Historial de cambios
□ Estadísticas en tiempo real
□ Filtros avanzados
□ Modo dark/light
□ Integración con impresoras
□ Sistema de prioridades
□ Búsqueda rápida
```

---

**Última actualización:** 2024
**Versión:** 2.0
**Estado:** ✅ Production Ready
