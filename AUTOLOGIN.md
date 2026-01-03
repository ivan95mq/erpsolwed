# Sistema de Autologin para Demo SOLWED ERP

Este documento describe el sistema de autologin implementado para acceso automático a la demo de FacturaScripts en `demo.erpsolwed.es`.

## 📋 Resumen

El sistema permite a los visitantes de la landing page (erpsolwed.es) acceder automáticamente a la demo del ERP sin necesidad de introducir credenciales manualmente.

## 🔗 URLs y Credenciales

### URL de Autologin
```
https://demo.erpsolwed.es/autologin.php?token=demo2025
```

### Credenciales del Usuario Demo
- **Usuario:** `demo`
- **Contraseña:** `demo2025`
- **Email:** `demo@erpsolwed.es`
- **Nivel:** Admin (con permisos completos)

### Token de Acceso
- **Token:** `demo2025`
- **Ubicación en código:** Hardcodeado en `/autologin.php` (línea 16)

## 🏗️ Arquitectura Técnica

### Ubicación de Archivos

**Servidor de producción (82.223.120.38):**
```
/var/www/vhosts/erpsolwed.es/demo.erpsolwed.es/
├── autologin.php          # Script de autologin principal
└── .htaccess              # Modificado para permitir ejecución directa
```

**Repositorio local:**
```
/tmp/autologin.php          # Copia de backup del script
```

### Flujo de Autenticación

1. **Usuario hace clic en "Prueba gratis"** (Hero, Navbar o CTA de erpsolwed.es)
2. **Se abre nueva pestaña** con URL: `https://demo.erpsolwed.es/autologin.php?token=demo2025`
3. **autologin.php valida:**
   - ✅ Token es correcto (`demo2025`)
   - ✅ Usuario `demo` existe en BD
   - ✅ Usuario está habilitado
   - ✅ Contraseña `demo2025` es válida
4. **Establece cookies de sesión:**
   - `fsNick`: Nombre de usuario
   - `fsLogkey`: Token de autenticación único
   - `fsLang`: Idioma del usuario (es_ES)
5. **Redirige al Dashboard** del ERP con sesión activa

### Código Principal (autologin.php)

```php
<?php
// Validación de token
$token = isset($_GET['token']) ? $_GET['token'] : '';
if ($token !== 'demo2025') {
    header('Location: /');
    exit;
}

// Inicialización de FacturaScripts
require_once __DIR__ . '/vendor/autoload.php';
const FS_FOLDER = __DIR__;
// ... (configuración)

// Autenticación
$user = new User();
if (!$user->load('demo')) exit;
if (!$user->enabled) exit;
if (!$user->verifyPassword('demo2025')) exit;

// Establecer cookies de sesión
$expiration = time() + 31536000; // 1 año
$path = '/';
$secure = true; // Solo HTTPS

setcookie('fsNick', $user->nick, $expiration, $path, '', $secure, true);
setcookie('fsLogkey', $user->logkey, $expiration, $path, '', $secure, true);
setcookie('fsLang', $user->langcode, $expiration, $path, '', $secure, true);

// Redirigir
header('Location: ' . $user->homepage);
```

### Configuración .htaccess

Modificación necesaria para permitir ejecución directa de `autologin.php`:

```apache
<IfModule mod_rewrite.c>
   RewriteEngine On
   RewriteBase /
   RewriteCond %{REQUEST_URI} !autologin.php [NC]  # ← LÍNEA AÑADIDA
   RewriteCond %{REQUEST_URI} !Dinamic/Assets/ [NC]
   RewriteCond %{REQUEST_URI} !node_modules/ [NC]
   RewriteRule . index.php [L]
</IfModule>
```

**Importante:** Sin esta línea, todas las peticiones se redirigen a `index.php` y autologin.php devolvería 404.

## 🎨 Integración en Landing Page

### Componentes Modificados

#### 1. ShimmerButton.tsx
Añadido soporte para `target="_blank"`:

```tsx
interface ShimmerButtonProps {
  // ...
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
}

// En el componente:
<a
  href={href}
  target={target}
  rel={target === '_blank' ? 'noopener noreferrer' : rel}
>
```

#### 2. Hero.astro (línea 77)
```astro
<ShimmerButton
  href="https://demo.erpsolwed.es/autologin.php?token=demo2025"
  size="lg"
  client:load
  target="_blank"
>
  Prueba gratis 1 mes
</ShimmerButton>
```

#### 3. Navbar.astro (líneas 85, 170)
```astro
<!-- Desktop -->
<a href="https://demo.erpsolwed.es/autologin.php?token=demo2025"
   target="_blank"
   rel="noopener noreferrer"
   class="btn btn-primary btn-sm rounded-pill">
  Prueba gratis
</a>

<!-- Mobile -->
<a href="https://demo.erpsolwed.es/autologin.php?token=demo2025"
   target="_blank"
   rel="noopener noreferrer"
   class="btn btn-primary rounded-pill">
  Prueba gratis
</a>
```

#### 4. CTA.astro (línea 33)
```astro
<ShimmerButton
  href="https://demo.erpsolwed.es/autologin.php?token=demo2025"
  size="lg"
  client:load
  target="_blank"
>
  Empezar prueba gratis
</ShimmerButton>
```

## 🔒 Seguridad

### Medidas Implementadas

✅ **Validación de token:** Solo `demo2025` permite acceso
✅ **Verificación de contraseña:** Usa `verifyPassword()` de FacturaScripts
✅ **Usuario habilitado:** Comprueba que `$user->enabled === true`
✅ **Cookies seguras:**
  - Flag `secure` (solo HTTPS)
  - Flag `HttpOnly` (protección XSS)
✅ **Logkey único:** Se genera nuevo logkey en cada autologin
✅ **Sin sesiones persistentes sin cookies:** Si no hay cookies, se redirige a login

### Consideraciones de Seguridad

⚠️ **Token predecible:** `demo2025` es fácil de adivinar
- **Mitigación:** Usuario demo con permisos limitados en producción
- **Mejora sugerida:** Token aleatorio largo o UUID

⚠️ **Sin rate limiting:** No hay protección contra fuerza bruta
- **Mejora sugerida:** Implementar límite de intentos por IP

⚠️ **Credenciales en código:** Usuario y contraseña hardcodeados
- **Justificación:** Es una cuenta de demostración pública
- **Riesgo:** Bajo, ya que es específicamente para pruebas

### Logs de Actividad

FacturaScripts registra automáticamente:
- IP de acceso en `$user->lastip`
- Navegador en `$user->lastbrowser`
- Timestamp en `$user->lastactivity`
- Nuevo `logkey` en cada autenticación

## 🧪 Testing

### Verificar Autologin Funciona

```bash
# 1. Comprobar que establece cookies
curl -i "https://demo.erpsolwed.es/autologin.php?token=demo2025" | grep "Set-Cookie"

# Debe mostrar 3 cookies:
# set-cookie: fsNick=demo
# set-cookie: fsLogkey=...
# set-cookie: fsLang=es_ES

# 2. Comprobar redirección
curl -sI "https://demo.erpsolwed.es/autologin.php?token=demo2025" | grep location

# Debe mostrar: location: /

# 3. Verificar con navegador
# Abrir: https://demo.erpsolwed.es/autologin.php?token=demo2025
# Debe redirigir al Dashboard con sesión activa
```

### Verificar Token Inválido

```bash
curl -i "https://demo.erpsolwed.es/autologin.php?token=invalid" | grep "Set-Cookie" | wc -l

# Debe devolver: 0 (sin cookies)
```

### Verificar Usuario Demo en Base de Datos

```bash
ssh root@82.223.120.38 'cd /var/www/vhosts/erpsolwed.es/demo.erpsolwed.es && \
/opt/plesk/php/8.2/bin/php -r "
require_once \"vendor/autoload.php\";
const FS_FOLDER = __DIR__;
if (file_exists(\"config.php\")) require_once \"config.php\";
use FacturaScripts\Dinamic\Model\User;
\$user = new User();
if (\$user->load(\"demo\")) {
  echo \"User exists: \" . \$user->nick . \"\\n\";
  echo \"Enabled: \" . (\$user->enabled ? \"yes\" : \"no\") . \"\\n\";
} else {
  echo \"User NOT found\\n\";
}"'
```

## 📝 Mantenimiento

### Actualizar Contraseña

Si necesitas cambiar la contraseña del usuario demo:

```bash
ssh root@82.223.120.38
cd /var/www/vhosts/erpsolwed.es/demo.erpsolwed.es
/opt/plesk/php/8.2/bin/php -r "
require_once 'vendor/autoload.php';
const FS_FOLDER = __DIR__;
require_once 'config.php';
use FacturaScripts\Core\CrashReport;
use FacturaScripts\Core\Kernel;
use FacturaScripts\Dinamic\Model\User;

CrashReport::init();
Kernel::init();

\$user = new User();
if (\$user->load('demo')) {
    \$user->setPassword('NUEVA_CONTRASEÑA_AQUI');
    \$user->save();
    echo \"Password updated\n\";
}
"
```

Luego actualizar `autologin.php` línea 59:
```php
if (!$user->verifyPassword('NUEVA_CONTRASEÑA_AQUI')) {
```

### Cambiar Token

1. Editar `/var/www/vhosts/erpsolwed.es/demo.erpsolwed.es/autologin.php` línea 16:
```php
if ($token !== 'NUEVO_TOKEN_AQUI') {
```

2. Actualizar landing page (Hero.astro, Navbar.astro, CTA.astro):
```astro
href="https://demo.erpsolwed.es/autologin.php?token=NUEVO_TOKEN_AQUI"
```

3. Rebuild y redeploy:
```bash
npm run build
rsync -avz --delete dist/ root@82.223.120.38:/var/www/vhosts/erpsolwed.es/httpdocs/
```

### Deshabilitar Autologin

Si necesitas desactivar temporalmente el autologin:

```bash
ssh root@82.223.120.38
mv /var/www/vhosts/erpsolwed.es/demo.erpsolwed.es/autologin.php \
   /var/www/vhosts/erpsolwed.es/demo.erpsolwed.es/autologin.php.disabled
```

Esto hará que el autologin devuelva 404 y los usuarios vean el login normal.

## 🚀 Despliegue

El autologin ya está desplegado en producción:

- ✅ **Landing page:** https://erpsolwed.es (actualizada con URLs de autologin)
- ✅ **Demo ERP:** https://demo.erpsolwed.es
- ✅ **Autologin activo:** https://demo.erpsolwed.es/autologin.php?token=demo2025
- ✅ **Usuario demo creado:** `demo` / `demo2025`
- ✅ **Cookies configuradas:** fsNick, fsLogkey, fsLang
- ✅ **GitHub actualizado:** Commit `9b7cef2`

## 📊 Métricas

Para monitorizar el uso del autologin, consultar logs de FacturaScripts:

```bash
ssh root@82.223.120.38
cd /var/www/vhosts/erpsolwed.es/demo.erpsolwed.es

# Ver últimos accesos del usuario demo
/opt/plesk/php/8.2/bin/php -r "
require_once 'vendor/autoload.php';
const FS_FOLDER = __DIR__;
require_once 'config.php';
use FacturaScripts\Dinamic\Model\User;
\$user = new User();
if (\$user->load('demo')) {
    echo 'Last IP: ' . \$user->lastip . \"\\n\";
    echo 'Last browser: ' . \$user->lastbrowser . \"\\n\";
    echo 'Last activity: ' . \$user->lastactivity . \"\\n\";
}
"
```

## 📚 Referencias

- **FacturaScripts Docs:** https://facturascripts.com/doc
- **Login Controller:** `/var/www/vhosts/erpsolwed.es/demo.erpsolwed.es/Core/Controller/Login.php`
- **User Model:** `/var/www/vhosts/erpsolwed.es/demo.erpsolwed.es/Core/Model/User.php`
- **Session Class:** FacturaScripts\Core\Session

## 👥 Contacto

Para soporte o modificaciones del sistema de autologin:
- **Email:** soporte@solwed.es
- **Servidor:** server0 (82.223.120.38)
- **SSH User:** root

---

**Última actualización:** 2026-01-03
**Versión:** 1.0
**Autor:** Claude Code
