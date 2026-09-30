# FinancIA — Frontend

Aplicación web para registrar, organizar y seguir las finanzas personales: movimientos de dinero, metas de ahorro y un asistente de análisis financiero.

Este repositorio contiene el **frontend**. El backend (Java, Spring Boot, WebFlux y PostgreSQL) está en [Cristian04-gif/financIA](https://github.com/Cristian04-gif/financIA).

## Estado del proyecto

| Funcionalidad | Estado |
|---|---|
| Registro de usuarios | Conectado al backend |
| Inicio de sesión con JWT | Conectado al backend |
| Activación de verificación en dos pasos (2FA) | Conectado al backend |
| Verificación del código 2FA al iniciar sesión | Conectado al backend |
| Datos del usuario en el perfil | Conectado al backend |
| Dashboard, Movimientos, Metas y Asistente IA | Interfaz terminada, con datos de ejemplo |

## Tecnologías

- **React 19** y **TypeScript**
- **Vite 8** como servidor de desarrollo y herramienta de construcción
- **Fetch API** para consumir los servicios REST
- **CSS** propio, responsivo, sin librerías de estilos
- **Oxlint** para el análisis estático del código

## Requisitos

- Node.js 20.19 o superior y npm
- El backend de FinancIA corriendo en `http://localhost:8080` 

## Instalación y ejecución

El código de la aplicación está dentro de la carpeta `FinancIA-Frontend/`:

```bash
git clone https://github.com/GuillenC123/FinancIA-Frontend.git
cd FinancIA-Frontend/FinancIA-Frontend
npm install
npm run dev
```

Vite muestra en la terminal la dirección local, normalmente `http://localhost:5173`.

## Ejecución con Docker

El archivo `compose.yml` levanta solo el frontend, servido con nginx, y lo reinicia solo si se cae o si se reinicia Docker. El backend se enciende aparte, como en desarrollo.

```bash
cd FinancIA-Frontend
docker compose up -d --build
```

La aplicación queda en `http://localhost:3000`. nginx sirve el frontend y redirige `/api` al backend, sin la cabecera `Origin`, igual que el proxy de Vite.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `BACKEND_URL` | Dirección del backend | `http://host.docker.internal:8080` (el puerto 8080 de tu PC) |
| `FRONTEND_PORT` | Puerto donde se publica el frontend | `3000` |

Se pueden definir en un archivo `.env` junto a `compose.yml`. Para detenerlo: `docker compose down`.

## Variables de entorno

Vite solo expone al navegador las variables que empiezan con `VITE_`. El archivo `.env.example` sirve de plantilla.

| Variable | Descripción | Desarrollo | Producción |
|---|---|---|---|
| `VITE_API_URL` | URL base del backend | Vacía | URL pública del backend desplegado |

En desarrollo **no hace falta crear ningún archivo `.env`**. Con la variable vacía, las peticiones usan rutas relativas (`/api/v1/...`) y el servidor de Vite las redirige al backend mediante el proxy definido en `vite.config.js`. Si el backend corre en otro puerto, se cambia el `target` de ese proxy.

Para valores propios de tu máquina, crea un `.env.local` a partir de `.env.example`: Git lo ignora y no se sube al repositorio.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión de producción |
| `npm run typecheck` | Comprueba los tipos de TypeScript |
| `npm run lint` | Analiza el código con Oxlint |

## Estructura

```
FinancIA-Frontend/
├── index.html
├── vite.config.js        # Proxy de /api hacia el backend
├── .env.example
└── src/
    ├── main.tsx          # Punto de entrada
    ├── App.tsx           # Sesión, navegación entre vistas y modales
    ├── api.ts            # Comunicación con el backend y manejo del token
    ├── types.ts          # Tipos compartidos
    ├── data.ts           # Datos de ejemplo de las vistas aún no conectadas
    ├── components/
    │   ├── Sidebar.tsx   # Menú lateral y menú del perfil
    │   └── Modals.tsx    # Nueva consulta, detalles y activación de 2FA
    └── pages/
        ├── AuthView.tsx  # Contenedor de inicio de sesión y registro
        ├── LoginView.tsx
        ├── RegisterView.tsx
        ├── DashboardView.tsx
        ├── MovimientosView.tsx
        ├── MetasView.tsx
        └── AsistenteView.tsx
```

## Endpoints consumidos

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/api/v1/auth/register` | Registro de usuarios |
| POST | `/api/v1/auth/login` | Inicio de sesión |
| POST | `/api/v1/auth/2fa/setup` | Genera el código QR para activar el 2FA |
| POST | `/api/v1/auth/2fa/confirm` | Confirma el código y activa el 2FA |
| POST | `/api/v1/auth/verify-2fa` | Segundo paso del inicio de sesión |
| GET | `/api/v1/users/me` | Datos del usuario autenticado |

## Autenticación y 2FA

1. Al iniciar sesión o registrarse, el backend devuelve un token JWT que se guarda en `localStorage` y se envía en la cabecera `Authorization` de cada petición.
2. Desde el menú del perfil, el usuario puede activar la verificación en dos pasos: escanea un código QR con Google Authenticator y confirma el código de 6 dígitos.
3. Con el 2FA activo, el inicio de sesión pide además ese código antes de entregar el token definitivo.

## Limitaciones conocidas

- **Proxy de desarrollo.** El proxy de `vite.config.js` elimina la cabecera `Origin` antes de reenviar las peticiones, porque la configuración de CORS del backend todavía no se aplica y rechaza con 403 las peticiones del navegador. La configuración de nginx de la imagen Docker hace lo mismo. Fuera de esos dos casos, el backend debe corregir su configuración de CORS.
- **Estado del 2FA.** El endpoint `/api/v1/users/me` aún no indica si el usuario tiene el 2FA activo. El frontend lo deduce de la respuesta del inicio de sesión y lo guarda en el navegador. Cuando el backend exponga ese dato, conviene leerlo directamente de ahí.
- **Desactivar el 2FA.** El backend no ofrece todavía un endpoint para desactivarlo.


Proyecto del curso de Ingeniería de Software, 2026.
