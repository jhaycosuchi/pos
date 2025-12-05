# 🎯 Lógica de Filtrado - Areas Activas (DEFINITIVO)

## La Verdad Absoluta

Un estado de cuenta tiene SOLO tres valores posibles:

```
'abierta'  → Activa, se agregan pedidos
'cerrada'  → Cierra (mesero), lista para pagar
'cobrada'  → Se pagó, transacción completada
```

## Los Tres Tabs Explicados

### 1️⃣ TAB "MESAS"
**Qué ve**: Mesas con cuentas ABIERTAS

**Criterios**:
- `estado === 'abierta'` ✓ (solo abiertas)
- `mesa_numero !== 'PARA_LLEVAR'` ✓ (solo mesas, no para llevar)
- `tipo === 'cuenta'` ✓ (cuentas, no pedidos sueltos)

**Acciones permitidas**:
- ✅ Agregar pedidos
- ✅ Ver detalles
- ✅ Cerrar cuenta (→ va a "Cobrar")

**Cuándo desaparece**:
- Cuando el mesero cierra la cuenta → estado pasa a 'cerrada'

---

### 2️⃣ TAB "PARA LLEVAR"
**Qué ve**: Cuentas ABIERTAS para llevar

**Criterios**:
- `estado === 'abierta'` ✓ (solo abiertas)
- `mesa_numero === 'PARA_LLEVAR'` ✓ (solo para llevar)
- `tipo === 'cuenta'` ✓ (cuentas)

**Acciones permitidas**:
- ✅ Agregar pedidos
- ✅ Ver detalles
- ✅ Cerrar cuenta (→ va a "Cobrar")

**Cuándo desaparece**:
- Cuando el mesero cierra la cuenta → estado pasa a 'cerrada'

---

### 3️⃣ TAB "COBRAR"
**Qué ve**: Cuentas CERRADAS (mesas + para llevar)

**Criterios**:
- `estado === 'cerrada'` ✓ (solo cerradas)
- No importa `mesa_numero` (puede ser número o 'PARA_LLEVAR')
- No importa `tipo` (ambas mesas y para llevar llegan aquí)

**Acciones permitidas**:
- ✅ Cobrar (pagar)
- ✅ Ver detalles

**Cuándo desaparece**:
- Cuando se cobra la cuenta → estado pasa a 'cobrada'
- API excluye 'cobrada' (no se devuelve en `/areas-activas`)

---

## El Flujo Completo

```
CREACIÓN:
mesero crea pedido (mesa 2)
         ↓
Creamos cuenta con estado='abierta', mesa_numero='2'
         ↓
Aparece en tab "MESAS" ✓

AGREGAR MÁS PEDIDOS:
mesero agrega otro pedido a la misma cuenta
         ↓
Actualiza total_pedidos en API
         ↓
Sigue en tab "MESAS" ✓

CERRAR:
mesero hace click "Cerrar cuenta"
         ↓
API: UPDATE cuentas SET estado='cerrada' WHERE id=...
         ↓
Estado pasa 'abierta' → 'cerrada'
         ↓
Frontend recibe estado='cerrada'
         ↓
filterCuentasAbiertas → NO la incluye (estado != 'abierta')
filterCuentasCerradas → SÍ la incluye (estado == 'cerrada')
         ↓
DESAPARECE de "MESAS"
APARECE en "COBRAR" ✓

PAGAR:
caja hace click "Cobrar"
         ↓
API: UPDATE cuentas SET estado='cobrada' WHERE id=...
         ↓
Estado pasa 'cerrada' → 'cobrada'
         ↓
API /areas-activas solo devuelve estado IN ('abierta', 'cerrada')
         ↓
DESAPARECE de "COBRAR" ✓
NUNCA aparece nuevamente ✓
```

---

## Validación de Filtros

En desarrollo, cada vez que hay cuentas, se valida que:

✅ **Sin duplicados**: Una cuenta NO puede estar en dos tabs
✅ **Cobertura**: Todos los estados se cubren correctamente
✅ **Integridad**: Los filtros funcionan como se espera

**Log esperado**:
```
✅ VALIDACIÓN OK: Sin duplicados en tabs
   Mesas: 2, Para llevar: 1, Cobrar: 1
```

Si hay error:
```
⚠️ VALIDACIÓN FALLA: Cuentas que aparecen en múltiples tabs: [3]
```

---

## La Implementación

**Backend** (`/api/areas-activas`):
```sql
WHERE c.estado IN ('abierta', 'cerrada')  -- Excluye 'cobrada' automáticamente
```

**Frontend** (`lib/filterConfig.ts`):
```typescript
// Mesas: abiertas + mesa
filterCuentasMesa(cuentas) → estado === 'abierta' && mesa_numero !== 'PARA_LLEVAR'

// Para llevar: abiertas + para llevar
filterCuentasLlevar(cuentas) → estado === 'abierta' && mesa_numero === 'PARA_LLEVAR'

// Cobrar: cerradas
filterCuentasCobrar(cuentas) → estado === 'cerrada'
```

---

## IMPORTANTE: Cambios Futuros

Si necesitas cambiar esta lógica en el futuro:

1. **Edita `lib/statesConfig.ts`** - Define qué estados existen
2. **Edita `lib/filterConfig.ts`** - Define dónde aparece cada estado
3. **Verifica logs** - Validación te dirá si algo está mal
4. **Rebuild + Redeploy** - Cambios aplicados

**NUNCA** hagas filtros hardcodeados en componentes. Siempre usa `filterConfig.ts`.

---

## Checklist de Verificación

Después de cualquier cambio, verifica:

- [ ] ✅ Crear pedido en mesa → aparece en "Mesas"
- [ ] ✅ Crear pedido para llevar → aparece en "Para llevar"
- [ ] ✅ Agregar más pedidos → contador actualiza
- [ ] ✅ Cerrar cuenta (mesero) → desaparece de "Mesas" / "Para llevar"
- [ ] ✅ Cuenta cerrada aparece en "Cobrar"
- [ ] ✅ Cobrar cuenta (caja) → desaparece de "Cobrar"
- [ ] ✅ Validación log muestra 0 duplicados

---

**Estado**: ✅ DEFINITIVO - Lógica clara, centralizada y documentada
