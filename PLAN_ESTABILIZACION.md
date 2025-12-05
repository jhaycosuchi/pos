# 📋 Plan de Mejora - Estabilización del Proyecto

## El Problema

Cada vez que hacemos un cambio pequeño, algo más se rompe:
- Cambio el filtro de areas-activas → Desaparecen las cuentas nuevas
- Arreglo el cierre de cuentas → Aparecen cuentas cobradas
- Cada cambio toca múltiples partes del código

## Por qué sucede esto

### 1. **Sin Source of Truth clara**
- BD tiene un estado (`abierta`, `cerrada`, `cobrada`)
- Frontend tiene su propio estado (arrays locales)
- Cuando sincronizamos, los filtros no coinciden

### 2. **Lógica duplicada**
- API filtra en `/areas-activas`
- Frontend TAMBIÉN filtra en `areas-activas/page.tsx`
- Cuando cambiamos uno, el otro se queda atrás

### 3. **Sin documentación de estados**
¿Qué significa cada estado?
```
'abierta'   = Cuenta activa, se puede agregar pedidos
'cerrada'   = Listos para pagar, NO se agregan pedidos
'cobrada'   = YA pagaron, NO mostrar en ningún lado
```

### 4. **Sin tests**
No tenemos verificaciones que se rompan cuando algo cambia

## Solución Propuesta

### Fase 1: Centralizar la Lógica de Estados (URGENTE - HOY)

**Crear archivo único con la verdad sobre estados:**

```typescript
// lib/statesConfig.ts
export const ACCOUNT_STATES = {
  ABIERTA: 'abierta',    // Activa, se agregan pedidos
  CERRADA: 'cerrada',    // Se puede cobrar
  COBRADA: 'cobrada'     // Transacción completada
};

export const VISIBLE_IN = {
  AREAS_ACTIVAS: [ACCOUNT_STATES.ABIERTA, ACCOUNT_STATES.CERRADA],
  CAJA_ABIERTOS: [ACCOUNT_STATES.ABIERTA],
  CAJA_COBRAR: [ACCOUNT_STATES.CERRADA],
  CAJA_HISTORIAL: [ACCOUNT_STATES.COBRADA]
};

export const ALLOW_ACTIONS = {
  ADD_PEDIDOS: [ACCOUNT_STATES.ABIERTA],    // Solo abiertos
  CLOSE_ACCOUNT: [ACCOUNT_STATES.ABIERTA],  // Solo abiertos → cerrados
  PAY_ACCOUNT: [ACCOUNT_STATES.CERRADA],    // Solo cerrados → cobrados
};
```

### Fase 2: Estandarizar Queries SQL

**Crear función helpers para cada filtro:**

```typescript
// lib/queryFilters.ts
export const SQL_FILTERS = {
  AREAS_ACTIVAS: `c.estado IN ('abierta', 'cerrada')`,
  CAJA_ABIERTOS: `c.estado = 'abierta'`,
  CAJA_COBRAR: `c.estado = 'cerrada'`,
  EXCLUIR_COBRADAS: `c.estado != 'cobrada'`
};
```

### Fase 3: Audit Trail - Registrar cada cambio

Agregar tabla `cuenta_estados_log`:
```sql
CREATE TABLE cuenta_estados_log (
  id INTEGER PRIMARY KEY,
  cuenta_id INTEGER,
  estado_anterior TEXT,
  estado_nuevo TEXT,
  razon TEXT,
  cambio_por TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(cuenta_id) REFERENCES cuentas(id)
);
```

Entonces cuando cierres una cuenta, registramos:
```
cuenta_id=3, anterior='abierta', nueva='cerrada', razon='Mesero cerró', por='Angel'
```

### Fase 4: Validación en Backend

Cada endpoint valida que la transición sea válida:
```typescript
// /api/cuentas/[id] PUT
if (estado === 'cerrada') {
  // Validar que SOLO puede venir de 'abierta'
  if (cuenta.estado !== 'abierta') {
    return error('No se puede cerrar una cuenta que no está abierta');
  }
}
```

### Fase 5: Dashboard de Debugging

Crear página `/dashboard/debug` que muestre:
- Todas las cuentas con su estado actual
- Historial de cambios (último 20)
- Inconsistencias detectadas
- Botones para "resetear" (solo dev)

## Beneficios

✅ **Menos bugs**: Un único lugar define cómo funcionan los estados
✅ **Mantenimiento**: Si cambio la lógica, cambio 1 lugar
✅ **Debugging**: Vemos exactamente qué pasó y cuándo
✅ **Escalabilidad**: Fácil agregar nuevos estados sin romper todo
✅ **Confianza**: Sabemos que los cambios no rompen lo anterior

## Implementación (Estimado)

| Fase | Tiempo | Prioridad |
|------|--------|-----------|
| 1: statesConfig.ts | 30 min | 🔴 CRÍTICA |
| 2: queryFilters.ts | 20 min | 🔴 CRÍTICA |
| 3: Audit table | 15 min | 🟡 ALTA |
| 4: Validación backend | 45 min | 🟡 ALTA |
| 5: Dashboard debug | 1 hora | 🟢 MEDIA |

**Total: ~2.5 horas para un proyecto super estable**

## Próximo Paso

¿Quieres que implemente esto ahora? Empezaría por:

1. Crear `lib/statesConfig.ts` con la verdad de estados
2. Actualizar todos los queries SQL para usar esa verdad
3. Verificar que todo sigue funcionando

Así evitamos que en el futuro volvamos a romper algo con cambios pequeños.

---

**¿Hacemos esto ahora?** 👇
