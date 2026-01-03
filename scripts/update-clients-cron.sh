#!/bin/bash

# Script para actualizar la lista de clientes ERP
# Ejecutado por cron diariamente a las 3:00 AM
# Genera /var/www/vhosts/erpsolwed.es/httpdocs/clients.json

OUTPUT_FILE="/var/www/vhosts/erpsolwed.es/httpdocs/clients.json"
TEMP_FILE="/tmp/clients-temp.json"
LOG_FILE="/var/log/erpsolwed-update.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando actualización de clientes..." >> "$LOG_FILE"

# Obtener subdominios de Plesk
CLIENTS=$(plesk bin domain -l | \
  grep -E '\.erpsolwed\.es$' | \
  awk '{print $1}' | \
  sed 's/\.erpsolwed\.es$//' | \
  grep -v '^erpsolwed$' | \
  sort)

# Verificar que obtuvimos resultados
if [ -z "$CLIENTS" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: No se encontraron subdominios" >> "$LOG_FILE"
  exit 1
fi

# Contar clientes
CLIENT_COUNT=$(echo "$CLIENTS" | wc -l)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Encontrados $CLIENT_COUNT clientes" >> "$LOG_FILE"

# Generar JSON manualmente (sin dependencia de jq)
echo "[" > "$TEMP_FILE"
FIRST=true
while IFS= read -r client; do
  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    echo "," >> "$TEMP_FILE"
  fi
  echo -n "  \"$client\"" >> "$TEMP_FILE"
done <<< "$CLIENTS"
echo "" >> "$TEMP_FILE"
echo "]" >> "$TEMP_FILE"

# Verificar que el JSON es válido
if [ -s "$TEMP_FILE" ]; then
  # Mover el archivo temporal al destino final
  mv "$TEMP_FILE" "$OUTPUT_FILE"
  chmod 644 "$OUTPUT_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Archivo actualizado: $OUTPUT_FILE ($CLIENT_COUNT clientes)" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: El archivo JSON está vacío" >> "$LOG_FILE"
  exit 1
fi

exit 0
