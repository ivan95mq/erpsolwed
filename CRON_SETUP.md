# Configuración del Cron Job para Actualización Automática de Clientes

## 📋 Resumen

Este sistema actualiza automáticamente la lista de clientes ERP cada noche a las 3:00 AM, sin necesidad de reconstruir el sitio web.

## 🔧 Instalación en server0 (82.223.120.38)

### 1. Copiar el script al servidor

```bash
# Conectar al servidor
ssh root@82.223.120.38

# Crear el script en la ubicación correcta
nano /var/www/vhosts/erpsolwed.es/update-clients-cron.sh
```

Pegar el contenido del archivo `scripts/update-clients-cron.sh` y guardar.

### 2. Dar permisos de ejecución

```bash
chmod +x /var/www/vhosts/erpsolwed.es/update-clients-cron.sh
```

### 3. Crear el archivo de log

```bash
touch /var/log/erpsolwed-update.log
chmod 644 /var/log/erpsolwed-update.log
```

### 4. Probar el script manualmente

```bash
# Ejecutar el script
/var/www/vhosts/erpsolwed.es/update-clients-cron.sh

# Verificar que se creó el JSON
cat /var/www/vhosts/erpsolwed.es/httpdocs/clients.json

# Ver el log
tail /var/log/erpsolwed-update.log
```

**Salida esperada:**
```json
[
  "anrok",
  "cabmodas",
  "catar",
  "construmaex",
  "horymca",
  "magaza",
  "manuela",
  "mueblesg3",
  "ospe",
  "roesan",
  "wehost"
]
```

### 5. Configurar el crontab

```bash
# Editar crontab del usuario root
crontab -e

# Agregar esta línea al final:
0 3 * * * /var/www/vhosts/erpsolwed.es/update-clients-cron.sh >> /var/log/erpsolwed-update.log 2>&1
```

**Explicación del cron:**
- `0 3 * * *` = Todos los días a las 3:00 AM
- El script genera `/var/www/vhosts/erpsolwed.es/httpdocs/clients.json`
- Los logs se guardan en `/var/log/erpsolwed-update.log`

### 6. Verificar que el cron está activo

```bash
# Listar crontabs activos
crontab -l

# Deberías ver la línea que agregaste
```

## 🔄 Flujo de Funcionamiento

1. **3:00 AM cada día**: El cron ejecuta el script
2. **Script consulta Plesk**: Obtiene todos los subdominios `*.erpsolwed.es`
3. **Genera JSON**: Crea/actualiza `/var/www/vhosts/erpsolwed.es/httpdocs/clients.json`
4. **Usuarios visitan el sitio**: El Navbar carga automáticamente desde el JSON actualizado
5. **Fallback**: Si el JSON no existe o falla, usa la lista hardcodeada

## 📊 Monitoreo

### Ver logs recientes

```bash
tail -20 /var/log/erpsolwed-update.log
```

### Ver logs de un día específico

```bash
grep "2025-01-03" /var/log/erpsolwed-update.log
```

### Verificar última actualización del JSON

```bash
ls -lh /var/www/vhosts/erpsolwed.es/httpdocs/clients.json
```

## 🐛 Troubleshooting

### El JSON no se crea

```bash
# Verificar que Plesk está instalado
which plesk

# Ejecutar manualmente el comando Plesk
plesk bin subscription -l | grep -E '\.erpsolwed\.es$'
```

### Permisos incorrectos

```bash
# Dar permisos al script
chmod +x /var/www/vhosts/erpsolwed.es/update-clients-cron.sh

# Dar permisos al directorio httpdocs
chmod 755 /var/www/vhosts/erpsolwed.es/httpdocs
```

### El cron no se ejecuta

```bash
# Verificar que el servicio cron está activo
systemctl status cron

# Ver logs del sistema de cron
grep CRON /var/log/syslog | tail -20
```

## 🔄 Actualizar el Sitio Web

Después de configurar el cron, necesitas actualizar el sitio web **una sola vez**:

```bash
# En tu máquina local
npm run build

# Copiar los archivos al servidor (tu método habitual)
# El sitio ahora leerá automáticamente desde clients.json
```

## ✅ Verificación Final

1. Visita https://erpsolwed.es
2. Abre la consola del navegador (F12)
3. Deberías ver: `✅ Cargados X clientes desde JSON`
4. Si no existe el JSON aún, verás: `⚠️ Usando lista de clientes estática (fallback)`

## 📝 Notas

- El script **NO requiere rebuilds** del sitio
- El JSON se actualiza automáticamente cada noche
- Los cambios en Plesk se reflejan automáticamente
- El sistema tiene fallback a la lista estática si falla el JSON
