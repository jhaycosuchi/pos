# 🚀 Guía de Testing y Deployment - Comanda Digital

## Pre-Deployment Checklist

### ✅ Verificaciones de Código

```bash
# 1. Compilación
npm run build

# Resultado esperado:
# ✓ Compiled successfully
# Ôö£ /comanda  5 kB  92.6 kB
```

### ✅ Verificaciones Funcionales

#### 1. Header
- [ ] Botón "Auto Refresh" funciona (toggle)
- [ ] Botón "Actualizar" recarga pedidos
- [ ] Auto-refresh se activa/desactiva correctamente

#### 2. Columna PENDIENTES
- [ ] Muestra solo pedidos en estado "pendiente"
- [ ] Botón "Comenzar" cambia estado a "preparando"
- [ ] Items muestran cantidad y nombre
- [ ] Notas aparecen correctamente

#### 3. Columna EN PREPARACIÓN
- [ ] Muestra solo pedidos en estado "preparando"
- [ ] Checkboxes funcionan (clickeable)
- [ ] Items completados se mueven abajo
- [ ] Separador "COMPLETADOS (n)" aparece
- [ ] Botón "Completar" cambia estado a "listo"
- [ ] Puedo desmarcar items (toggle)

#### 4. Columna LISTOS
- [ ] Muestra solo pedidos en estado "listo"
- [ ] Items muestran check verde
- [ ] Botón "Entregado" cambia estado a "entregado"

#### 5. Información General
- [ ] Mesa número es correcto
- [ ] "PARA LLEVAR" aparece cuando corresponde
- [ ] Mesero se muestra correctamente
- [ ] Total es correcto
- [ ] Tiempo transcurrido actualiza (sin refrescar)
- [ ] Colores de tiempo son correctos (rojo/amarillo/verde)

### ✅ Interfaz Táctil

- [ ] Botones son fáciles de clickear (tamaño grande)
- [ ] Texto es legible desde lejos
- [ ] Iconos son claros
- [ ] Espacios amplios entre elementos
- [ ] Active:scale-95 feedback visual funciona

### ✅ Performance

- [ ] Auto-refresh no consume demasiados recursos
- [ ] Carga inicial < 2 segundos
- [ ] Cambios de estado son instantáneos
- [ ] No hay lag al marcar items

## Procedimiento de Testing Manual

### Caso de Uso 1: Flujo Completo de un Pedido

```
1. Crear un pedido desde /atiendemesero o admin
   → Aparece en PENDIENTES

2. Hacer click en "Comenzar"
   → Se mueve a EN PREPARACIÓN
   → Items aparecen con checkboxes

3. Marcar items como completados
   → Se mueven al separador de completados

4. Marcar todos los items
   → Mostrar separador "COMPLETADOS (n)"

5. Hacer click en "Completar"
   → Se mueve a LISTOS

6. Hacer click en "Entregado"
   → Desaparece de la comanda
   → Aparece en reportes (si aplica)
```

### Caso de Uso 2: Auto-Refresh

```
1. Activar auto-refresh
2. Crear pedido en otra ventana
3. Verificar que aparece en PENDIENTES en 3-5 segundos
4. Desactivar auto-refresh
5. Crear otro pedido
6. Verificar que NO aparece hasta hacer click en actualizar
7. Hacer click en actualizar
8. Verificar que aparece
```

### Caso de Uso 3: Información Correcta

```
1. En PENDIENTES:
   - Ver mesa correcta (o "PARA LLEVAR")
   - Ver mesero correcto
   - Ver tiempo actual
   - Ver color de tiempo (según minutos)
   - Ver total correcto

2. En EN PREPARACIÓN:
   - Misma información anterior
   - Items con cantidad exacta
   - Notas/restricciones visibles

3. En LISTOS:
   - Misma información anterior
   - Check verde en cada item
```

### Caso de Uso 4: Estrés (Muchos Pedidos)

```
1. Crear 20+ pedidos
2. Verificar que la interfaz sigue siendo rápida
3. Marcar items en diferentes pedidos simultáneamente
4. Auto-refresh sigue funcionando
5. No hay crashes o errores en consola
```

## Deployment Checklist

### Antes de ir a Producción

```bash
# 1. Limpiar build anterior
rm -rf .next

# 2. Instalar dependencias (si es necesario)
npm install

# 3. Compilar
npm run build

# 4. Ejecutar en modo producción local
npm run start

# 5. Acceder a http://localhost:3000/comanda
# Verificar que todo funciona correctamente
```

### Variables de Entorno

```env
# .env.local (si es necesario)
# Por defecto: localhost:3000 en desarrollo
# En producción: tu dominio

# API endpoints (verificar que sean correctos)
# GET  /api/pedidos
# PUT  /api/pedidos/[id]
```

### Configuración de Servidor

```javascript
// next.config.js
module.exports = {
  // Asegurarse de que está configurado correctamente
  // Para correr en puerto 3000 (ver server.instructions.md)
}
```

### Base de Datos

```sql
-- Verificar que las tablas existen:
-- ✅ pedidos
-- ✅ detalle_pedidos
-- ✅ usuarios
-- ✅ transacciones

-- Verificar CHECK constraints:
-- ✅ estado en ('pendiente', 'preparando', 'listo', 'entregado')
```

## Monitoreo Post-Deployment

### Logs a Vigilar

```
[✓] Pedidos cargados correctamente
[✓] Estado actualizado exitosamente
[✓] Auto-refresh funcionando
[✗] Errores de API (revisar)
[✗] Errores de TypeScript (revisar)
```

### Métricas Importantes

```
1. Tiempo de carga de página
   Target: < 2 segundos

2. Tiempo de actualización de pedidos
   Target: < 500ms

3. Tiempo de respuesta de cambio de estado
   Target: < 1 segundo

4. Uso de memoria en auto-refresh
   Target: < 10MB de overhead
```

### Debugging

```bash
# En navegador (F12):
# Console → No debe haber errores
# Network → No debe haber requests fallidas
# Application → Storage limpio

# En servidor:
# npm run dev (para ver logs)
# Watch /api/pedidos llamadas
```

## Rollback Plan

Si algo sale mal:

```bash
# 1. Revertir a versión anterior
git checkout app/comanda/page-old.tsx
git checkout components/comanda/

# 2. Compilar
npm run build

# 3. Reiniciar servidor
npm run start

# O simplemente restaurar desde backup:
cp app/comanda/page-old.tsx app/comanda/page.tsx
```

## Notas Importantes

### Para Producción
- ✅ Auto-refresh está en 3000ms (3 segundos)
- ✅ Puerto es 3000 (ver server.instructions.md)
- ✅ Base de datos es SQLite (verificar ruta)

### Cambios Recientes
- 🔄 Refactorización de 604 líneas → 467 + 130
- 🔄 Cambio de arquitectura: monolítica → componentes
- 🔄 Verificación TypeScript completa

### Si Necesitas Cambios
- Editar componentes en `/components/comanda/`
- Cambios reflejados automáticamente en página
- No tocar `page.tsx` a menos que sea necesario

---

**Status:** ✅ Listo para Producción
**Última verificación:** Build exitoso
**Próximo paso:** Deployment
