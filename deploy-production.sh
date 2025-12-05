#!/bin/bash

# Script para desplegar a producción
# Uso: ./deploy-production.sh

echo "================================"
echo "🚀 DEPLOYING TO PRODUCTION 🚀"
echo "================================"
echo ""

# Variables
PROD_HOST="operacion.mazuhi.com"
PROD_USER="admin"
PROD_PATH="/var/www/pos"

echo "1️⃣  Ejecutando en servidor remoto..."
echo "   Host: $PROD_HOST"
echo "   Path: $PROD_PATH"
echo ""

ssh $PROD_USER@$PROD_HOST << 'ENDSSH'

cd /var/www/pos

echo "📥 Haciendo git pull..."
git pull origin main

if [ $? -ne 0 ]; then
  echo "❌ Error en git pull"
  exit 1
fi

echo "🔨 Compilando..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Error en build"
  exit 1
fi

echo "♻️  Reiniciando PM2..."
pm2 restart pos-app --update-env

if [ $? -ne 0 ]; then
  echo "❌ Error en PM2 restart"
  exit 1
fi

echo "✅ Esperando que se inicie..."
sleep 3

echo "🔍 Verificando que esté online..."
pm2 list

ENDSSH

if [ $? -eq 0 ]; then
  echo ""
  echo "================================"
  echo "✅ DEPLOYMENT EXITOSO"
  echo "================================"
  echo ""
  echo "La aplicación está actualizada en:"
  echo "   https://operacion.mazuhi.com/pos"
else
  echo ""
  echo "================================"
  echo "❌ ERROR EN DEPLOYMENT"
  echo "================================"
fi
