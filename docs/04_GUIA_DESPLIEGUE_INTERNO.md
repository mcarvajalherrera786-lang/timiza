# Guía de Despliegue en Internet — Timiza 3D

## Arquitectura en 3 capas para producción

- **Capa 1 (Frontend)**: React + Vite + MapLibre GL → **Vercel**.
- **Capa 2 (API)**: FastAPI + SQLAlchemy + Pydantic → **Render**.
- **Capa 3 (Base de datos)**: PostgreSQL → **Neon.tech** o **Supabase**.

## Paso 1 — Capa 3: Base de datos PostgreSQL

1. Crear cuenta en **Neon.tech** o **Supabase**.
2. Crear un proyecto PostgreSQL nuevo.
3. Copiar la cadena de conexión (`DATABASE_URL`) con SSL.
4. Ejemplo: `postgresql+psycopg2://USER:PASSWORD@HOST:5432/DBNAME`.

## Paso 2 — Capa 2: API FastAPI en Render

1. Crear cuenta en **Render**.
2. Crear nuevo **Web Service** conectando el repositorio GitHub.
3. Root directory: `backend-api`.
4. Build command: `pip install -r requirements.txt`.
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
6. Variables de entorno: `DATABASE_URL` (PostgreSQL), `PYTHON_VERSION=3.12.4`.

## Paso 3 — Capa 1: Frontend React en Vercel

1. Importar el repositorio en **Vercel**.
2. Root directory: `frontend`.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Variable de entorno: `VITE_API_URL` = URL pública de la API en Render.

## Paso 4 — Verificación

- `curl https://<api-render>/api/v1/barrio`
- Preview en Vercel del frontend React 3D.

## Notas

- CORS habilitado en API para cualquier origen (`*`).
- `DATABASE_URL` activa PostgreSQL en producción.
