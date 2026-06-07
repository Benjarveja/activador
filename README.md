# Activation Proxy Web App

Aplicación Full Stack que actúa como proxy entre el cliente y un servidor remoto para obtener dinámicamente un ID de Conformación de Activación (CID). La aplicación extrae de manera automática el `nonce` y la sesión, ocultando toda la complejidad y la infraestructura destino al usuario final.

## 📁 Arquitectura

El proyecto está diseñado de forma completamente desacoplada:
*   **Backend (`/backend`)**: API Node.js (Express) robusta configurada para mitigar ataques y manejar sesión oculta mediante peticiones HTTP directas.
*   **Frontend (`/frontend`)**: Single Page Application (HTML/CSS/JS nativo) sin librerías pesadas. UI limpia y moderna.

## 🚀 Despliegue

La solución está pensada para ser alojada en plataformas Cloud Serverless:

### 1. Despliegue del Backend (Render / Railway / Heroku)
1. Conecta tu repositorio de GitHub a tu servicio de Cloud.
2. Selecciona la carpeta base `backend`.
3. Configura el comando de arranque: `node server.js`
4. Asegúrate de configurar las **Variables de Entorno**.

### 2. Despliegue del Frontend (Vercel / Netlify / Cloudflare Pages)
1. Crea un nuevo proyecto en Vercel apuntando al mismo repositorio.
2. Configura el **Root Directory** como `frontend`.
3. Modifica el archivo `frontend/app.js`, línea 4:
   ```javascript
   const API_URL = 'https://TU_URL_DEL_BACKEND_EN_RENDER.com/api/generate';
   ```

## ⚙️ Variables de Entorno (Backend)

Crea un archivo `.env` en la carpeta `backend/`:

```env
PORT=3000
REMOTE_URL=https://softpro.cl/activacion-telefonica/
FRONTEND_URL=https://tu-frontend-en-vercel.vercel.app
```
*(Asegúrate de no agregar `/` al final de front-end URL si estás configurando CORS restrictivo).*

## 💻 Desarrollo Local

Para probarlo en tu máquina:

1. Ingresa a la carpeta backend:
   ```bash
   cd backend
   npm install
   ```
2. Configura el `.env` (guíate en `.env.example`).
3. Ejecuta el servidor:
   ```bash
   npm run dev
   ```
4. Instala un servidor local para el frontend, por ejemplo [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) en VS Code, y abre `frontend/index.html`. 
5. Asegúrate de que `FRONTEND_URL` en el backend `.env` coincida con el puerto de tu Live Server (ej. `http://localhost:5500`).

## 🛡️ Seguridad y Buenas Prácticas Involucradas

*   **Sin Navegadores Headless (No Puppeteer):** Completamente renderizado mediante solicitudes HTTP en memoria para máxima velocidad.
*   **Rate Limiting:** Prevención de ataques o spam al endpoint `GET/POST`.
*   **CORS Parametrizado:** Solo interactúa con orígenes de confianza.
*   **Ocultamiento Estricto:** Toda persistencia y datos (nonce, token) ocurren solo vía Server-to-Server, el usuario recibe estrictamente una cadena de texto.
*   **Diseño SOLID:** Controladores delegando cargas a Capa de Servicio independiente; separando validación hacia Middlewares.
