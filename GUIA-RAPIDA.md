# 📚 Guía Rápida de Referencia

## 🚀 Para Migrar Ahora (5 min)

```bash
cd /var/www/pos-app/pos

# 1. Reemplazar archivos
mv app/api/cuentas/route.ts app/api/cuentas/route-OLD.ts
mv app/api/cuentas/route-new.ts app/api/cuentas/route.ts
mv app/api/cuentas/\[id\]/route.ts app/api/cuentas/\[id\]/route-OLD.ts
mv app/api/cuentas/\[id\]/route-new.ts app/api/cuentas/\[id\]/route.ts

# 2. Compilar
npm run build

# 3. Reiniciar
pm2 restart pos-app

# 4. Testear en navegador
# https://mazuhi.com/pos/areas-activas
```

---

## 🔄 Para Rollback (si hay problemas)

```bash
cd /var/www/pos-app/pos

# Devolver archivos viejos
mv app/api/cuentas/route.ts app/api/cuentas/route-NUEVO.ts
mv app/api/cuentas/route-OLD.ts app/api/cuentas/route.ts
mv app/api/cuentas/\[id\]/route.ts app/api/cuentas/\[id\]/route-NUEVO.ts
mv app/api/cuentas/\[id\]/route-OLD.ts app/api/cuentas/\[id\]/route.ts

# Compilar y reiniciar
npm run build && pm2 restart pos-app
```

---

## 📁 Archivos Clave

### Servicios (Lógica centralizada)
```
lib/services/
├── base.service.ts           ← Base para todos
├── cuentas.service.ts        ← Lógica de cuentas
├── pedidos.service.ts        ← (A crear)
└── usuarios.service.ts       ← (A crear)
```

### Respuestas
```
lib/response-handler.ts       ← Formato uniforme
```

### Endpoints
```
app/api/cuentas/route.ts      ← GET, POST
app/api/cuentas/[id]/route.ts ← GET, PUT, PATCH, DELETE
```

---

## 🎯 Estructura de un Endpoint Nuevo

```typescript
import { NextRequest } from 'next/server'
import miServicio from '../../../../lib/services/mi.service'
import ResponseHandler from '../../../../lib/response-handler'

export async function GET(request: NextRequest) {
  try {
    // Validar entrada
    const { searchParams } = new URL(request.url)
    const filtro = searchParams.get('filtro')
    
    // Llamar servicio
    const result = await miServicio.obtener(filtro)
    
    // Devolver respuesta
    if (!result.success) {
      return ResponseHandler.error(result.error?.message, 500)
    }
    return ResponseHandler.success(result.data)
  } catch (error) {
    return ResponseHandler.internalError('Error al obtener', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar campos mínimos
    if (!body.campo1 || !body.campo2) {
      return ResponseHandler.badRequest('Faltan campos requeridos')
    }
    
    // Llamar servicio
    const result = await miServicio.crear(body)
    
    if (!result.success) {
      return ResponseHandler.error(result.error?.message, 500)
    }
    return ResponseHandler.success(result.data, 'Creado exitosamente', 201)
  } catch (error) {
    return ResponseHandler.internalError('Error al crear', error)
  }
}
```

---

## 🎯 Estructura de un Servicio Nuevo

```typescript
import BaseService from './base.service'

export class MiService extends BaseService {
  // Obtener todos
  async obtener(filtro?: string) {
    return this.runQuery(
      () => {
        let query = 'SELECT * FROM mi_tabla'
        if (filtro) query += ` WHERE estado = '${filtro}'`
        return this.db.prepare(query).all()
      },
      'Error al obtener registros'
    )
  }

  // Crear
  async crear(data: any) {
    const validation = this.validateRequiredFields(data, ['campo1', 'campo2'])
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    return this.runQuery(
      () => {
        const result = this.db.prepare(`
          INSERT INTO mi_tabla (campo1, campo2)
          VALUES (?, ?)
        `).run(data.campo1, data.campo2)

        return this.db.prepare(
          'SELECT * FROM mi_tabla WHERE id = ?'
        ).get(result.lastInsertRowid)
      },
      'Error al crear registro'
    )
  }

  // Por ID
  async obtenerPorId(id: number) {
    const validation = this.validateId(id)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    return this.runQuery(
      () => {
        const registro = this.findById('mi_tabla', id)
        if (!registro) throw new Error('No encontrado')
        return registro
      },
      'Error al obtener registro'
    )
  }
}

export default new MiService()
```

---

## ✅ Respuesta Exitosa

```json
{
  "success": true,
  "data": { "id": 1, "nombre": "...", ... },
  "message": "Operación exitosa"
}
```

HTTP Status: **200** (o 201 para creaciones)

---

## ❌ Respuesta de Error

```json
{
  "success": false,
  "error": "Descripción del error",
  "message": "Descripción del error"
}
```

HTTP Status: **400** (validación), **404** (no encontrado), **500** (error servidor)

---

## 📋 Validaciones Comunes

```typescript
// Validar ID
const validation = this.validateId(cuentaId)
if (!validation.valid) return { success: false, error: validation.error }

// Validar campos requeridos
const validation = this.validateRequiredFields(data, ['campo1', 'campo2'])
if (!validation.valid) return { success: false, error: validation.error }

// Validar objeto existe
const registro = this.findById('tabla', id)
if (!registro) throw new Error('No encontrado')
```

---

## 🔗 Rutas API Refactorizadas

```
GET    /api/cuentas                 → CuentasService.getCuentas()
POST   /api/cuentas                 → CuentasService.crearCuenta()
GET    /api/cuentas/{id}            → CuentasService.getCuentaCompleta()
PUT    /api/cuentas/{id}            → CuentasService.cerrarCuenta() o cobrarCuenta()
DELETE /api/cuentas/{id}            → CuentasService.eliminarCuenta()
```

---

## 🧠 Recordar

- ✅ Lógica en servicios
- ✅ Validaciones en servicios
- ✅ Endpoints simples y limpios
- ✅ Respuestas uniforme siempre
- ✅ Un cambio en servicio = todos se actualizan
- ✅ Fácil de testear
- ✅ Fácil de debuggear

---

## 📞 Debugging

```bash
# Ver logs del servidor
pm2 logs pos-app

# Ver estado
pm2 status

# Reiniciar
pm2 restart pos-app

# Si falla compilación
npm run build

# Limpiar .next
rm -rf .next && npm run build
```

---

## 🚀 Próximas Migraciones

Mismo patrón para:
1. **Pedidos** - Crear `pedidos.service.ts`
2. **Usuarios** - Crear `usuarios.service.ts`
3. **Modificaciones** - Crear `modificaciones.service.ts`
4. **Meseros** - Crear `meseros.service.ts`
5. Y el resto...

**Tiempo por servicio:** 30-45 min

---

## 🎓 ¿Dudas?

Revisar:
- `ARQUITECTURA-NUEVA.md` - Guía completa
- `DIAGRAMA-ARQUITECTURA.md` - Diagramas visuales
- `README-ARQUITECTURA.md` - Resumen ejecutivo
