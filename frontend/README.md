# Frontend de autenticación

React + TypeScript strict + Vite + React Router. Fetch para HTTP, Context para sesión y LocalStorage centralizado.

## Flujo y persistencia

Registro llama `POST /api/auth/register`, guarda el usuario con saldo 0 y una credencial local, y redirige al login. Login llama `POST /api/auth/login`, compara la contraseña con la credencial local y guarda la sesión antes de abrir el dashboard.

El backend existente solo valida el formato en login; no almacena cuentas ni autentica contraseñas. Por eso la comparación se realiza en el frontend. Un fallo del backend no permite iniciar sesión.

`storage.service.ts` concentra todo acceso a LocalStorage:

- `auth.user`: lista de usuarios públicos (id, fullName, email, balance).
- `auth.credentials`: userId, sal aleatoria de 16 bytes y derivado PBKDF2 SHA-256 de 256 bits, con 100 000 iteraciones.
- `auth.session`: únicamente userId de la cuenta activa.

AuthContext restaura la sesión si tiene una estructura válida y referencia un usuario existente. JSON corrupto se trata como ausente. Logout elimina solo `auth.session`; usuarios, credenciales y saldos permanecen para el siguiente login. `updateBalance()` persiste el saldo y actualiza el contexto; el dashboard inicial no ofrece controles para modificarlo.

La contraseña no se persiste en texto plano ni forma parte del usuario público. Solo se envía al backend en registro/login. **Es una simulación local, no autenticación segura**: quien controla el navegador puede modificar LocalStorage, cambiar credenciales o fabricar una sesión; el hash permite ataques fuera de línea. ProtectedRoute controla navegación, no protege recursos del servidor. Borrar el almacenamiento elimina las cuentas locales. Los datos pertenecen a este navegador y origen.

Web Crypto necesita localhost o HTTPS. La autenticación real requiere que el servidor almacene y verifique credenciales, gestione sesiones y autorice recursos. Esta prueba conserva el contrato actual del backend.

## Archivos

```text
src/
  components/ProtectedRoute.tsx
  context/AuthContext.tsx
  models/user.model.ts
  pages/LoginPage.tsx
  pages/RegisterPage.tsx
  pages/DashboardPage.tsx
  routes/AppRoutes.tsx
  services/auth.service.ts
  services/storage.service.ts
  App.tsx
  App.css
  index.css
  main.tsx
```

Los formularios validan campos, bloquean envíos mientras esperan y muestran mensajes en pantalla. El servicio convierte fallos HTTP en mensajes comprensibles sin exponer respuestas internas del backend.

## Dependencias y ejecución

La única dependencia adicional al proyecto Vite es `react-router-dom` (`npm install react-router-dom`).

Desde `frontend`, en PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Contenido de `.env.example`:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

La URL incluye `/api`. Reinicia Vite si cambias `.env`. Las variables VITE son públicas; no colocar secretos aquí.

En otra terminal, desde `backend`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Si ya existe `.env`, conservar su configuración. Abre `http://localhost:5173`. El origen debe coincidir con FRONTEND_URL del backend; localhost y 127.0.0.1 tienen almacenamientos distintos. Si Vite usa otro puerto, ajustar FRONTEND_URL o liberar el 5173.

Verificación sin tests:

```powershell
npm run build
npm run lint
```

En hosting estático, configurar fallback a `index.html` para BrowserRouter.

## Prueba manual

1. Abre `/dashboard` sin sesión: debe redirigir a `/login`.
2. En `/register`, prueba campos vacíos, correo inválido, contraseña corta y confirmación distinta: no deben enviarse.
3. Registra una cuenta válida: aparece login con confirmación y correo precargado.
4. Usa contraseña equivocada: muestra «Correo o contraseña incorrectos.» y no crea sesión.
5. Inicia sesión correctamente: dashboard con tu nombre y $0.00.
6. Recarga `/dashboard`: mantiene sesión, nombre y saldo.
7. Cierra sesión: vuelve a login y elimina solo `auth.session`.
8. Abre `/dashboard`: redirige a login.
9. Inicia sesión nuevamente y recarga: conserva los datos.
10. Registra otra cuenta: empieza con saldo 0; la anterior sigue disponible para login.
11. Detén el backend e intenta login: muestra error de conexión y no crea sesión nueva.

**Registro → Login → Dashboard → Refresh → Logout → Login nuevamente**.
