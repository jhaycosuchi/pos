#!/bin/bash

# Script de Migración - Paso a Paso
# Este script ayuda a migrar los endpoints a la nueva arquitectura

echo "════════════════════════════════════════════════════════════════"
echo "🚀 MIGRACIÓN A NUEVA ARQUITECTURA - PASO A PASO"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd /var/www/pos-app/pos

echo -e "${YELLOW}FASE 1: Verificar archivos necesarios${NC}"
echo ""

FILES_NEEDED=(
  "lib/services/base.service.ts"
  "lib/services/cuentas.service.ts"
  "lib/response-handler.ts"
  "app/api/cuentas/route-new.ts"
  "app/api/cuentas/[id]/route-new.ts"
)

all_exist=true
for file in "${FILES_NEEDED[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file - FALTA"
    all_exist=false
  fi
done

if [ "$all_exist" = false ]; then
  echo -e "${RED}ERROR: Faltan archivos. Abortando.${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}FASE 2: Hacer backup de archivos actuales${NC}"
echo ""

# Backup de archivos actuales
cp app/api/cuentas/route.ts app/api/cuentas/route.BACKUP-$(date +%s).ts
cp app/api/cuentas/[id]/route.ts app/api/cuentas/[id]/route.BACKUP-$(date +%s).ts

echo -e "${GREEN}✓${NC} Backups creados en:"
echo "  - app/api/cuentas/route.BACKUP-*.ts"
echo "  - app/api/cuentas/[id]/route.BACKUP-*.ts"

echo ""
echo -e "${YELLOW}FASE 3: Reemplazar archivos${NC}"
echo ""

# Reemplazar
mv app/api/cuentas/route.ts app/api/cuentas/route-OLD.ts
mv app/api/cuentas/route-new.ts app/api/cuentas/route.ts
echo -e "${GREEN}✓${NC} app/api/cuentas/route.ts reemplazado"

mv app/api/cuentas/\[id\]/route.ts app/api/cuentas/\[id\]/route-OLD.ts
mv app/api/cuentas/\[id\]/route-new.ts app/api/cuentas/\[id\]/route.ts
echo -e "${GREEN}✓${NC} app/api/cuentas/[id]/route.ts reemplazado"

echo ""
echo -e "${YELLOW}FASE 4: Compilar${NC}"
echo ""

if npm run build 2>&1 | grep -q "Compiled successfully"; then
  echo -e "${GREEN}✓${NC} Compilación exitosa"
else
  echo -e "${RED}✗${NC} Error en compilación"
  echo "  Revisar logs en el output anterior"
  exit 1
fi

echo ""
echo -e "${YELLOW}FASE 5: Reiniciar servidor${NC}"
echo ""

pm2 restart pos-app
sleep 3

if pm2 list | grep -q "online"; then
  echo -e "${GREEN}✓${NC} Servidor reiniciado correctamente"
else
  echo -e "${RED}✗${NC} Error al reiniciar servidor"
  exit 1
fi

echo ""
echo -e "${YELLOW}FASE 6: Testear endpoints${NC}"
echo ""

echo "Testeando: GET /api/cuentas"
RESPONSE=$(curl -s -X GET "https://mazuhi.com/pos/api/cuentas" \
  -b /tmp/test-cookies.txt)

if echo "$RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓${NC} Endpoint funciona"
else
  echo -e "${YELLOW}⚠${NC} Revisar manualmente en https://mazuhi.com/pos/areas-activas"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ MIGRACIÓN COMPLETADA${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Próximos pasos:"
echo "  1. Probar en navegador: https://mazuhi.com/pos/areas-activas"
echo "  2. Crear, cerrar, cobrar una cuenta"
echo "  3. Si todo OK, borrar archivos -OLD.ts"
echo "  4. Crear servicios para pedidos y usuarios"
echo ""
echo "Rollback (si hay problemas):"
echo "  cd app/api/cuentas"
echo "  mv route.ts route-NUEVO.ts"
echo "  mv route-OLD.ts route.ts"
echo "  (lo mismo para [id]/route.ts)"
echo "  npm run build && pm2 restart pos-app"
echo ""

