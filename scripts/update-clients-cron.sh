#!/bin/bash

# Script para actualizar la lista de clientes ERP con logos
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

# Función para obtener logo de un cliente
get_logo() {
  local client=$1
  local url="https://${client}.erpsolwed.es"

  # Descargar HTML y buscar img con clase card-img-top
  local logo=$(curl -s -L -m 5 "$url" 2>/dev/null | \
    grep -o '<img[^>]*class="[^"]*card-img-top[^"]*"[^>]*' | \
    grep -o 'src="[^"]*"' | \
    sed 's/src="\([^"]*\)"/\1/' | \
    head -1)

  # Si encontramos logo y es relativo, convertir a absoluto
  if [ -n "$logo" ]; then
    if [[ ! "$logo" =~ ^http ]]; then
      # Es relativa, añadir dominio
      if [[ "$logo" =~ ^/ ]]; then
        echo "${url}${logo}"
      else
        echo "${url}/${logo}"
      fi
    else
      # Ya es absoluta
      echo "$logo"
    fi
  else
    echo "null"
  fi
}

# Generar JSON con logos
echo "[" > "$TEMP_FILE"
FIRST=true
LOGO_COUNT=0

while IFS= read -r client; do
  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    echo "," >> "$TEMP_FILE"
  fi

  # Obtener logo
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Procesando: $client" >> "$LOG_FILE"
  LOGO=$(get_logo "$client")

  if [ "$LOGO" != "null" ]; then
    ((LOGO_COUNT++))
    echo "  {\"id\":\"$client\",\"logo\":\"$LOGO\"}" | tr -d '\n' >> "$TEMP_FILE"
  else
    echo "  {\"id\":\"$client\",\"logo\":null}" | tr -d '\n' >> "$TEMP_FILE"
  fi
done <<< "$CLIENTS"

echo "" >> "$TEMP_FILE"
echo "]" >> "$TEMP_FILE"

# Verificar que el JSON es válido
if [ -s "$TEMP_FILE" ]; then
  # Mover el archivo temporal al destino final
  mv "$TEMP_FILE" "$OUTPUT_FILE"
  chmod 644 "$OUTPUT_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Archivo actualizado: $OUTPUT_FILE" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $CLIENT_COUNT clientes, $LOGO_COUNT con logo" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: El archivo JSON está vacío" >> "$LOG_FILE"
  exit 1
fi

exit 0
