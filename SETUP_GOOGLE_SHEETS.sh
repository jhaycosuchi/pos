#!/bin/bash

# Script SIMPLE para configurar Google Sheets

cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║         CONFIGURACIÓN GOOGLE SHEETS - MAZUHI POS              ║
║                                                                ║
║  INSTRUCCIONES PASO A PASO                                   ║
╚════════════════════════════════════════════════════════════════╝

PASO 1: OBTENER LAS CREDENCIALES
─────────────────────────────────

1.1) Abre: https://console.cloud.google.com
1.2) Crea un nuevo proyecto llamado "Mazuhi POS"
1.3) Habilita Google Sheets API:
     - Ve a: APIs y servicios → Biblioteca
     - Busca: "Google Sheets API"
     - Haz clic y selecciona "HABILITAR"

1.4) Crea una Cuenta de Servicio:
     - Ve a: APIs y servicios → Credenciales
     - Clic en "Crear credenciales" → "Cuenta de servicio"
     - Nombre: "pos-app"
     - Clic en "CREAR Y CONTINUAR"
     - Deja los siguientes pasos y da clic en "FINALIZAR"

1.5) Obtén la clave privada:
     - En Credenciales → Cuentas de servicio
     - Haz clic en el email que creaste
     - Pestaña "CLAVES"
     - "Agregar clave" → "Crear clave nueva" → "JSON"
     - Se descargará un archivo JSON

1.6) Abre el archivo JSON descargado y copia:
     - "client_email" → GOOGLE_SERVICE_ACCOUNT_EMAIL
     - "private_key" → GOOGLE_PRIVATE_KEY
     - Este valor incluye saltos de línea (\n)

PASO 2: CREAR TU GOOGLE SHEET CON EL MENÚ
──────────────────────────────────────────

2.1) Crea un nuevo Google Sheet
2.2) Renombra las hojas (tabs) con estos nombres EXACTOS:
     - Entradas
     - Arroces
     - Rollos_Naturales
     - Rollos_Empanizados
     - Rollos_Especiales
     - Rollos_Horneados
     - Bebidas
     - Postres
     - Extras

2.3) En cada hoja, crea estas columnas (A-J):
     A: Nombre (ej: California Roll)
     B: Descripción (ej: Arroz, atún, aguacate)
     C: Precio (ej: 8.99)
     D: URL Imagen (ej: https://ejemplo.com/imagen.jpg)
     E: Nuevo (si/no o true/false)
     F: Vegetariano (si/no o true/false)
     G: Picante (si/no o true/false)
     H: Favorito (si/no o true/false)
     I: Destacado (si/no o true/false)
     J: Promo Miércoles (si/no o true/false)

2.4) Comparte el Google Sheet:
     - Clic en "Compartir"
     - Email de la cuenta de servicio (client_email del JSON)
     - Dale acceso de "Editor"

PASO 3: CONFIGURAR EN EL SERVIDOR
──────────────────────────────────

Copia el SHEET ID de la URL:
https://docs.google.com/spreadsheets/d/{ESTE_ES_EL_ID}/edit

Ejemplo de configuración completa:
──────────────────────────────────

GOOGLE_SHEET_ID="1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p"
GOOGLE_SERVICE_ACCOUNT_EMAIL="pos-app@tu-proyecto.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhk...\n-----END PRIVATE KEY-----\n"

PASO 4: ACTUALIZAR .env.local
──────────────────────────────

Opción A) Modo manual:
  1. Edita: /var/www/pos-app/pos/.env.local
  2. Actualiza los 3 valores
  3. Guarda el archivo

Opción B) Usar script (desde el servidor):
  bash /var/www/pos-app/pos/configure-google-sheets.sh \
    "tu_sheet_id" \
    "tu_email@proyecto.iam.gserviceaccount.com" \
    "-----BEGIN PRIVATE KEY-----\n..."

PASO 5: REINICIAR EL SERVICIO
──────────────────────────────

pm2 restart pos-app

PASO 6: PROBAR LA SINCRONIZACIÓN
────────────────────────────────

Accede a: https://mazuhi.com/pos/login
Login con: admin / admin

Si todo está bien, verás el menú cargado desde Google Sheets.

╔════════════════════════════════════════════════════════════════╗
║  ⚠️  IMPORTANTE                                                ║
║  - La clave privada es sensible, no la compartas               ║
║  - Asegúrate de compartir el Sheet con el email correcto       ║
║  - Los nombres de las hojas deben ser EXACTOS                  ║
╚════════════════════════════════════════════════════════════════╝

EOF

echo ""
echo "¿Necesitas ayuda? Ejecuta:"
echo "  less /tmp/INSTRUCCIONES_GOOGLE_SHEETS.md"
echo ""
