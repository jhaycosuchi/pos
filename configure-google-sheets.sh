#!/bin/bash

# Script para configurar credenciales de Google Sheets

echo "=========================================="
echo "  CONFIGURACIÓN DE GOOGLE SHEETS - MAZUHI"
echo "=========================================="
echo ""
echo "Este script te ayudará a configurar las credenciales de Google Sheets"
echo ""

# Verificar si hay argumentos
if [ $# -ne 3 ]; then
    echo "Uso: ./configure-google-sheets.sh <GOOGLE_SHEET_ID> <SERVICE_EMAIL> <PRIVATE_KEY>"
    echo ""
    echo "Ejemplo:"
    echo './configure-google-sheets.sh "1a2b3c4d5e6f7g8h9i0j" "pos-app@proyecto.iam.gserviceaccount.com" "-----BEGIN PRIVATE KEY-----\nMIIE..."'
    echo ""
    echo "O ejecutar sin argumentos para modo interactivo:"
    echo "./configure-google-sheets.sh"
    exit 1
fi

SHEET_ID="$1"
SERVICE_EMAIL="$2"
PRIVATE_KEY="$3"

# Modo interactivo si no hay argumentos
if [ $# -eq 0 ]; then
    echo "=== MODO INTERACTIVO ==="
    echo ""
    echo "1. Ingresa el ID del Google Sheet"
    echo "   (Se encuentra en la URL: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit)"
    read -p "GOOGLE_SHEET_ID: " SHEET_ID
    
    echo ""
    echo "2. Ingresa el email de la cuenta de servicio"
    echo "   (Desde el JSON: 'client_email')"
    read -p "GOOGLE_SERVICE_ACCOUNT_EMAIL: " SERVICE_EMAIL
    
    echo ""
    echo "3. Ingresa la clave privada (copiar del JSON: 'private_key')"
    echo "   NOTA: Mantén las comillas y saltos de línea como vienen"
    read -p "GOOGLE_PRIVATE_KEY: " PRIVATE_KEY
fi

# Validar inputs
if [ -z "$SHEET_ID" ] || [ -z "$SERVICE_EMAIL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: Faltan credenciales"
    exit 1
fi

# Actualizar .env.local
ENV_FILE="/var/www/pos-app/pos/.env.local"

echo ""
echo "Actualizando $ENV_FILE..."

# Usar sed para reemplazar los valores
sed -i "s/^GOOGLE_SHEET_ID=.*/GOOGLE_SHEET_ID=$SHEET_ID/" "$ENV_FILE"
sed -i "s|^GOOGLE_SERVICE_ACCOUNT_EMAIL=.*|GOOGLE_SERVICE_ACCOUNT_EMAIL=$SERVICE_EMAIL|" "$ENV_FILE"
# Para la private key, usamos un delimitador diferente porque contiene caracteres especiales
sed -i "s|^GOOGLE_PRIVATE_KEY=.*|GOOGLE_PRIVATE_KEY=$PRIVATE_KEY|" "$ENV_FILE"

echo ""
echo "✅ Credenciales actualizadas"
echo ""

# Mostrar lo que se configuró (sin mostrar la clave privada completa)
echo "Configuración guardada:"
echo "  GOOGLE_SHEET_ID: $SHEET_ID"
echo "  GOOGLE_SERVICE_ACCOUNT_EMAIL: $SERVICE_EMAIL"
echo "  GOOGLE_PRIVATE_KEY: [configurada]"
echo ""

# Reiniciar el servicio
echo "Reiniciando el servicio POS..."
cd /var/www/pos-app/pos && pm2 restart pos-app

echo ""
echo "✅ Configuración completa. El servicio se ha reiniciado."
echo ""
echo "Para probar la sincronización, ejecuta:"
echo "  curl -X POST https://mazuhi.com/pos/api/menu/sync -b 'token=tu_token'"
