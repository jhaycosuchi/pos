# Bug Fix: Cuentas Cerradas No Se Mostraban - RESUELTO ✅

## Problema Reportado

Cuando intentabas cerrar cuentas desde areas-activas, el frontend mostraba confirmación exitosa (`"success": true`), pero:
- Las cuentas NO aparecían en la pestaña "Cobrar" (cuentas cerradas)
- Los logs mostraban siempre: `Abiertas: 2 Cerradas: 0`
- La BD sí mostraba estado = 'cerrada'

## Root Cause

**PM2 Process Caching**: El proceso Node.js anterior tenía cached la versión anterior del código API. Cuando hiciste el cierre, la BD se actualizó correctamente, pero el API devolvía el estado incorrecto porque estaba usando código viejo.

### Diagnóstico

**Antes del fix (API devolviendo datos incorrectos):**
```bash
$ curl http://localhost:3000/pos/api/areas-activas
[
  {"id":2, "estado":"abierta", ...},   # ❌ INCORRECTO - BD dice 'cerrada'
  {"id":1, "estado":"abierta", ...}    # ❌ INCORRECTO - BD dice 'cerrada'
]
```

**BD (siempre correcta):**
```sql
SELECT id, estado FROM cuentas;
# 2|cerrada ✓
# 1|cerrada ✓
```

## Solución

1. **npm run build** - Recompilar la aplicación (sin cambios de código)
2. **pm2 restart pos-app** - Reiniciar el proceso para limpiar el cache

### Después del fix (API devolviendo datos correctos):
```bash
$ curl http://localhost:3000/pos/api/areas-activas
[
  {"id":2, "estado":"cerrada", ...},   # ✅ CORRECTO
  {"id":1, "estado":"cerrada", ...}    # ✅ CORRECTO
]
```

**Frontend ahora recibe datos correctos cada 3 segundos:**
```
Abiertas: 0
Cerradas: 2
```

## Archivos Involucrados

- `/app/api/areas-activas/route.ts` - API endpoint (sin cambios, solo needed restart)
- `/app/api/cuentas/[id]/route.ts` - PUT endpoint para cerrar (funcionaba correctamente)
- `/lib/services/cuentas.service.ts` - Servicio de cierre (funcionaba correctamente)
- `/app/areas-activas/page.tsx` - Frontend (filtraba correctamente, solo recibía datos malos)

## Verificación

✅ Base de datos: `estado = 'cerrada'` para ambas cuentas
✅ API endpoint: Devuelve `estado: 'cerrada'`
✅ Frontend: Recibe datos correctos y filtra en Abiertas/Cerradas
✅ PM2 proceso: #775 online con código actualizado

## Lección Aprendida

Cuando un endpoint devuelve datos inconsistentes con la BD, puede ser:
1. **Bug en el código** - Verificar lógica SQL/mapeo
2. **Cache del proceso** - Node/PM2 no recargó el código

**En este caso era #2** - El endpoint estaba correcto pero PM2 no había recargado el código.

---

**Status**: ✅ RESUELTO - Las cuentas cerradas ahora aparecen correctamente en "Cobrar"
