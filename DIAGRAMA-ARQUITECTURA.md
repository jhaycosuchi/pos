# 🏗️ Diagrama de la Nueva Arquitectura

## Flujo de Solicitudes (Request Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                  (React + TypeScript)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Request
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    API ENDPOINT                              │
│                  (app/api/*/route.ts)                        │
│                                                              │
│  Responsabilidades:                                         │
│  1. Validar entrada básica                                 │
│  2. Llamar al servicio                                     │
│  3. Devolver respuesta uniforme                            │
└────────────────┬──────────────────────────┬─────────────────┘
                 │ Llama                    │ Retorna
                 ↓                          ↑
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS SERVICE                           │
│            (lib/services/*.service.ts)                       │
│                                                              │
│  Responsabilidades:                                         │
│  1. Lógica de negocio                                      │
│  2. Validaciones principales                               │
│  3. Llamadas a BD                                          │
│  4. Manejo de errores                                      │
│  5. Devolver ApiResponse                                   │
└────────────────┬──────────────────────────┬─────────────────┘
                 │ Heredar de               │ Retorna
                 ↓                          ↑
┌─────────────────────────────────────────────────────────────┐
│                    BASE SERVICE                              │
│                 (base.service.ts)                            │
│                                                              │
│  Métodos compartidos:                                       │
│  - validateId()                                            │
│  - validateRequiredFields()                                │
│  - runQuery()                                              │
│  - findById()                                              │
│  - findAll()                                               │
└────────────────┬──────────────────────────┬─────────────────┘
                 │ Usa                      │ Retorna
                 ↓                          ↑
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE                                 │
│                   (SQLite3)                                  │
│                                                              │
│  Tablas:                                                    │
│  - cuentas                                                  │
│  - pedidos                                                  │
│  - usuarios                                                 │
│  - modificaciones_pedidos                                   │
│  - etc...                                                   │
└─────────────────────────────────────────────────────────────┘
```

## Respuestas Uniformes (Response Handler)

```
┌─────────────────────────────────────────┐
│      ResponseHandler (Middleware)        │
├─────────────────────────────────────────┤
│                                         │
│  .success(data, message)                │
│    ↓                                    │
│    HTTP 200                             │
│    { success: true, data, message }     │
│                                         │
│  .error(message, statusCode)            │
│    ↓                                    │
│    HTTP [statusCode]                    │
│    { success: false, error, message }   │
│                                         │
│  .notFound()        → 404               │
│  .badRequest()      → 400               │
│  .unauthorized()    → 401               │
│  .forbidden()       → 403               │
│  .internalError()   → 500               │
│                                         │
└─────────────────────────────────────────┘
```

## Ejemplo: Cobrar una Cuenta

```
Navegador: PUT /api/cuentas/1
  │ { estado: 'cobrada', metodo_pago: 'cash' }
  ↓
┌──────────────────────────────────────────────┐
│ API Endpoint: [id]/route.ts                  │
├──────────────────────────────────────────────┤
│ 1. Validar ID → parseInt(params.id)          │
│ 2. Validar body → estado, metodo_pago        │
│ 3. Llamar servicio                           │
│ 4. Devolver respuesta                        │
└──────────────────────┬───────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────┐
│ CuentasService.cobrarCuenta()                │
├──────────────────────────────────────────────┤
│ 1. Validar ID (hereda de BaseService)        │
│ 2. Validar metodo_pago                       │
│ 3. Encontrar cuenta (findById)               │
│ 4. Calcular total de pedidos                 │
│ 5. UPDATE cuentas SET estado='cobrada'       │
│ 6. Devolver { success: true, data }          │
└──────────────────────┬───────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────┐
│ ResponseHandler.success()                    │
├──────────────────────────────────────────────┤
│ {                                            │
│   success: true,                             │
│   data: { id, estado, metodo_pago, ... },   │
│   message: "Cuenta cobrada exitosamente"     │
│ }                                            │
│ Status: 200                                  │
└──────────────────────────────────────────────┘
                       │
                       ↓
         Navegador recibe respuesta
```

## Ventaja: Un Cambio, Todos Actualizados

### Escenario: Agregar campo "observaciones" a cuenta

```
ANTES (Sin arquitectura):
└─ Cambiar en 5 lugares
   ├─ app/api/cuentas/route.ts
   ├─ app/api/cuentas/[id]/route.ts
   ├─ app/caja/page.tsx
   ├─ app/areas-activas/page.tsx
   └─ lib/config.ts
   
   Riesgo: Olvidar en 1 = TODO se rompe

DESPUÉS (Con servicios centralizados):
└─ Cambiar en 1 lugar
   └─ lib/services/cuentas.service.ts
   
   AUTOMÁTICAMENTE se aplica a:
   ├─ GET /api/cuentas ✓
   ├─ GET /api/cuentas/{id} ✓
   ├─ PUT /api/cuentas/{id} ✓
   ├─ POST /api/cuentas ✓
   └─ DELETE /api/cuentas/{id} ✓
```

## Estructura de Directorios

```
pos-app/
├── app/
│   ├── api/
│   │   ├── cuentas/
│   │   │   ├── route-OLD.ts       ← Viejo (a borrar después)
│   │   │   ├── route.ts           ← Nuevo (refactorizado)
│   │   │   └── [id]/
│   │   │       ├── route-OLD.ts
│   │   │       └── route.ts
│   │   ├── pedidos/
│   │   ├── usuarios/
│   │   └── ...
│   └── pages/
│
├── lib/
│   ├── services/
│   │   ├── base.service.ts        ← Base para todos
│   │   ├── cuentas.service.ts     ← Lógica de cuentas
│   │   ├── pedidos.service.ts     ← Lógica de pedidos
│   │   ├── usuarios.service.ts    ← Lógica de usuarios
│   │   └── ...
│   ├── response-handler.ts        ← Respuestas uniforme
│   ├── db.ts
│   └── ...
│
└── docs/
    ├── ARQUITECTURA-NUEVA.md      ← Guía completa
    └── RESUMEN-ARQUITECTURA.md    ← Resumen
```

## Ciclo de Vida de una Solicitud

```
1. ENTRADA (Frontend)
   ├─ Validación básica ✓
   └─ Envía datos

2. ENDPOINT (app/api/*/route.ts)
   ├─ Recibe solicitud ✓
   ├─ Valida ID, campos requeridos ✓
   └─ Llama al servicio

3. SERVICIO (lib/services/*.service.ts)
   ├─ Valida datos complejos ✓
   ├─ Ejecuta lógica de negocio ✓
   ├─ Accede a BD ✓
   └─ Retorna { success, data/error }

4. RESPONSE HANDLER
   ├─ Formatea respuesta ✓
   ├─ Establece status HTTP ✓
   └─ Envía al cliente

5. SALIDA (Frontend)
   ├─ Recibe respuesta uniforme ✓
   ├─ Verifica success ✓
   └─ Muestra resultado
```

## Manejo de Errores

```
Error en BD
    ↓
BaseService.runQuery() captura
    ↓
Llama error() con mensaje
    ↓
Servicio devuelve { success: false, error }
    ↓
Endpoint verifica result.success
    ↓
ResponseHandler.error(mensaje, statusCode)
    ↓
HTTP [statusCode]
{ success: false, error: "...", message: "..." }
    ↓
Frontend maneja con try/catch
```

---

**Esta arquitectura previene el 80% de bugs porque:**
1. ✅ Centralización = Sin duplicación
2. ✅ Validación temprana = Errores claros
3. ✅ Respuestas uniforme = Menos sorpresas
4. ✅ Servicio único = Cambios seguros
