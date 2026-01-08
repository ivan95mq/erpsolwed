# Configuración del Sistema de Formaciones

Este documento explica cómo configurar las APIs de Brevo y Zoom para el sistema de inscripción a formaciones mensuales.

## 📋 Requisitos previos

- Cuenta de Brevo (anteriormente SendinBlue) - [https://www.brevo.com](https://www.brevo.com)
- Cuenta de Zoom con plan Pro o superior - [https://zoom.us](https://zoom.us)
  - **Nota**: El plan Pro básico es suficiente. No necesitas el add-on de Webinars.
- Acceso al servidor donde está desplegado el proyecto

## ✨ Funcionalidades

El sistema de formaciones incluye:

✅ **Registro automático en Zoom Meeting** con aprobación automática
✅ **Guardado de contactos en Brevo** para seguimiento
✅ **Email automático de confirmación** con todos los detalles
✅ **Botón de compartir por WhatsApp** para difusión fácil
✅ **Formulario React** con validación y animaciones

---

## 🔧 Configuración de Brevo

### 1. Obtener la API Key

1. Inicia sesión en [https://app.brevo.com](https://app.brevo.com)
2. Ve a **Settings** (Configuración) → **API Keys** (Claves API)
3. Haz clic en **Generate a new API key** (Generar nueva clave API)
4. Dale un nombre descriptivo, por ejemplo: "ERP SOLWED - Formaciones"
5. Copia la clave generada (empieza con `xkeysib-...`)

### 2. Crear lista de contactos

1. Ve a **Contacts** (Contactos) → **Lists** (Listas)
2. Haz clic en **Create a list** (Crear lista)
3. Dale un nombre: "Formaciones ERP"
4. Copia el **ID de la lista** (número que aparece en la URL o en los detalles)

### 3. Configurar atributos personalizados (opcional pero recomendado)

1. Ve a **Contacts** → **Settings** → **Contact attributes**
2. Asegúrate de tener los siguientes atributos:
   - `NOMBRE` (tipo: Text)
   - `SMS` (tipo: Text, para teléfono)
   - `EMPRESA` (tipo: Text)

Estos atributos se crean automáticamente al enviar el primer contacto, pero es recomendable crearlos manualmente para tener control sobre sus tipos.

---

## 📹 Configuración de Zoom

### 1. Crear una Server-to-Server OAuth App

1. Ve a [https://marketplace.zoom.us/develop/create](https://marketplace.zoom.us/develop/create)
2. Haz clic en **Create** en la opción **Server-to-Server OAuth**
3. Completa la información de la app:
   - **App Name**: ERP SOLWED Formaciones
   - **Company Name**: SOLWED
   - **Developer Contact**: Tu email
4. En la página de la app, ve a la pestaña **App Credentials**
5. Copia los siguientes valores:
   - **Account ID**
   - **Client ID**
   - **Client Secret**

### 2. Configurar Scopes (Permisos)

1. Ve a la pestaña **Scopes**
2. Añade los siguientes scopes:
   - `meeting:write:admin` - **Requerido**: Para crear meetings y registrar asistentes
   - `meeting:read:admin` - **Requerido**: Para leer información de meetings
   - `user:read:admin` - Para leer información del usuario

3. Haz clic en **Add scopes** y luego en **Continue**

### 3. Activar la aplicación

1. Ve a la pestaña **Activation**
2. Completa los campos requeridos
3. Haz clic en **Activate your app**

### 4. Crear el Meeting Recurrente con Registro

1. Inicia sesión en [https://zoom.us](https://zoom.us)
2. Ve a **Meetings** → **Schedule a Meeting**
3. Configura el meeting:
   - **Topic**: Formación ERP SOLWED - Sistemas de Gestión
   - **When**: Selecciona la fecha del tercer miércoles del mes, por la tarde (ej: 17:00)
   - **Duration**: 1 hour
   - **Recurring meeting**: ✅ Activa esta opción
   - **Recurrence**: Monthly → Selecciona "Monthly on the third Wednesday"
   - **Registration**: ✅ **Required** (muy importante)
   - **Meeting ID**: Generate Automatically

4. En la sección **Registration**:
   - **Registration**: Required
   - **Approval type**: **Automatically approve**
   - **Registration options**:
     - ✅ Registrants register once and can attend any of the occurrences

5. **Guardar** el meeting

6. **Copiar el Meeting ID**: Después de crear el meeting, anota el **Meeting ID** (número de 9-11 dígitos)
   - Ejemplo: 830 0787 3711 → 83007873711 (sin espacios)

7. **Verificar que el registro está habilitado**:
   - Haz clic en el meeting creado
   - Debe aparecer una pestaña **Registration** con la URL de registro
   - Si no aparece, edita el meeting y asegúrate de activar "Required" en Registration

---

## ⚙️ Configuración de Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto (si no existe):

```bash
cp .env.example .env
```

2. Edita el archivo `.env` y completa las variables con los valores obtenidos:

Consulta el archivo `.env.example` en la raíz del proyecto para ver el formato completo.

**Variables requeridas:**
```bash
BREVO_API_KEY=tu_api_key_aqui
BREVO_LIST_ID=tu_list_id_aqui
ZOOM_ACCOUNT_ID=tu_account_id_aqui
ZOOM_CLIENT_ID=tu_client_id_aqui
ZOOM_CLIENT_SECRET=tu_client_secret_aqui
ZOOM_USER_ID=tu_email@gmail.com
ZOOM_MEETING_ID=tu_meeting_id_aqui
```

### Descripción de las variables:

- **BREVO_API_KEY**: Tu API key de Brevo (obtener en https://app.brevo.com/settings/keys/api)
- **BREVO_LIST_ID**: ID de la lista donde se guardarán los contactos (obtener en https://app.brevo.com/contact/list)
- **ZOOM_ACCOUNT_ID**: Account ID de tu app Server-to-Server OAuth
- **ZOOM_CLIENT_ID**: Client ID de tu app
- **ZOOM_CLIENT_SECRET**: Client Secret de tu app
- **ZOOM_USER_ID**: Email del usuario de Zoom que será el host (ej: tu_email@gmail.com)
- **ZOOM_MEETING_ID**: **Requerido** - ID del meeting recurrente con registro habilitado (formato sin espacios: 83007873711)

---

## 🧪 Probar la integración

### 1. Arrancar el servidor de desarrollo

```bash
npm run dev
```

### 2. Acceder a la página de formaciones

Abre tu navegador en: `http://localhost:4321/formaciones`

### 3. Probar el formulario

1. Rellena el formulario con datos de prueba (usa tu email real para recibir la confirmación)
2. Envía el formulario
3. Verifica que:
   - ✅ El formulario muestra el mensaje de éxito
   - ✅ El contacto aparece en tu lista de Brevo
   - ✅ El usuario está registrado en el meeting de Zoom
   - ✅ Se muestra el enlace para unirse al meeting
   - ✅ **Recibes el email de confirmación con todos los detalles**

### 4. Verificar en Brevo

1. **Contactos**:
   - Ve a [https://app.brevo.com](https://app.brevo.com) → **Contacts**
   - Busca el email que usaste en el formulario
   - Verifica que los atributos se hayan guardado correctamente

2. **Email enviado**:
   - Ve a **Campaigns** → **Transactional**
   - Verifica que se envió el email de confirmación
   - Revisa el contenido del email

### 5. Verificar en Zoom

1. Ve a [https://zoom.us](https://zoom.us) → **Meetings**
2. Haz clic en tu meeting recurrente "Formación ERP SOLWED"
3. Ve a la pestaña **Registration** → **Manage Registrants**
4. Verifica que el usuario aparezca en la lista de registrados

### 6. Probar el botón de WhatsApp

1. Haz clic en el botón verde "Compartir por WhatsApp" en la página
2. Verifica que se abre WhatsApp Web/App con el mensaje preformateado
3. El mensaje debe incluir el enlace a https://erpsolwed.es/formaciones

---

## 🚀 Despliegue a producción

### 1. Configurar variables en el servidor

Si despliegas en un servidor, asegúrate de configurar las variables de entorno. El método depende de tu plataforma:

#### Servidor tradicional (VPS, Plesk, etc.):

Crea el archivo `.env` en el servidor con los valores de producción.

#### Vercel:

```bash
vercel env add BREVO_API_KEY
vercel env add BREVO_LIST_ID
vercel env add ZOOM_ACCOUNT_ID
vercel env add ZOOM_CLIENT_ID
vercel env add ZOOM_CLIENT_SECRET
vercel env add ZOOM_USER_ID
vercel env add ZOOM_WEBINAR_ID
```

#### Netlify:

Ve a **Site settings** → **Environment variables** y añade todas las variables.

### 2. Build y despliegue

```bash
npm run build
```

Sube los archivos generados en `dist/` a tu servidor.

---

## 🔒 Seguridad

- ✅ El archivo `.env` está en `.gitignore` - NUNCA lo subas a Git
- ✅ Las API keys solo se usan en el servidor (src/pages/api/)
- ✅ El formulario valida los datos con Zod tanto en cliente como servidor
- ✅ El teléfono se normaliza al formato español (+34)

---

## 📧 Configurar emails automáticos (opcional)

### Enviar email de confirmación con Brevo

1. Ve a **Campaigns** → **Transactional** → **Templates**
2. Crea una plantilla de email con:
   - Confirmación de registro
   - Fecha y hora de la formación
   - Enlace para unirse al webinar
   - Información adicional

3. Configura una automatización:
   - Trigger: Cuando un contacto se añade a la lista "Formaciones ERP"
   - Acción: Enviar el email de confirmación

### Recordatorio antes de la formación

1. Crea otra automatización en Brevo:
   - Trigger: 1 día antes del evento (puedes usar un campo de fecha en el contacto)
   - Acción: Enviar email recordatorio

---

## 🐛 Troubleshooting

### Error: "BREVO_API_KEY no está configurada"

**Solución**: Verifica que el archivo `.env` existe y tiene la variable `BREVO_API_KEY` correctamente configurada.

### Error: "Error al obtener token de Zoom"

**Solución**:
- Verifica que las credenciales (`ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`) sean correctas
- Asegúrate de que la app de Zoom está activada
- Verifica que los scopes necesarios están añadidos

### Error: "ZOOM_WEBINAR_ID no está configurado"

**Solución**:
- Crea un webinar recurrente en Zoom
- Copia su ID (número de 11 dígitos)
- Añade la variable `ZOOM_WEBINAR_ID` en `.env`

### El formulario se envía pero no aparece en Brevo

**Solución**:
- Verifica los logs del servidor (`npm run dev` muestra errores)
- Comprueba que `BREVO_LIST_ID` sea correcto
- Verifica que la API key tenga permisos de escritura

### El registro no aparece en Zoom

**Solución**:
- Verifica que el webinar permita registro
- Comprueba que el webinar no esté lleno (límite de participantes)
- Asegúrate de que el `ZOOM_USER_ID` sea correcto

---

## 📚 Recursos adicionales

- [Documentación API de Brevo](https://developers.brevo.com/)
- [Documentación API de Zoom](https://developers.zoom.us/docs/api/)
- [Astro API Endpoints](https://docs.astro.build/en/core-concepts/endpoints/)
- [Zod Validation](https://zod.dev/)

---

## 🎉 ¡Listo!

Tu sistema de inscripción a formaciones está configurado. Los usuarios ahora pueden:

1. ✅ Visitar `https://erpsolwed.es/formaciones`
2. ✅ Rellenar el formulario con sus datos
3. ✅ Quedar registrados automáticamente en Brevo
4. ✅ Quedar inscritos en el webinar de Zoom
5. ✅ Recibir el enlace para unirse a la formación

Para soporte técnico, contacta con el equipo de desarrollo.
