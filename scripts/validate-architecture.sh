#!/bin/bash

# Script de validación de la nueva arquitectura
# Comprueba que los servicios y handlers están correctos

echo "🔍 Validando Nueva Arquitectura..."
echo ""

FILES_TO_CHECK=(
  "lib/services/base.service.ts"
  "lib/services/cuentas.service.ts"
  "lib/response-handler.ts"
  "app/api/cuentas/route-new.ts"
  "app/api/cuentas/[id]/route-new.ts"
)

echo "📋 Validando que todos los archivos existan..."
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "/var/www/pos-app/pos/$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - FALTA"
  fi
done

echo ""
echo "🔎 Validando sintaxis TypeScript..."

# Compilar solo para validar
cd /var/www/pos-app/pos
npx tsc --noEmit 2>&1 | head -20

echo ""
echo "✨ Validación completada"
echo ""
echo "📝 Próximo paso: Ejecutar npm run build para compilar"
