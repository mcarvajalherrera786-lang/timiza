# Timiza 3D — Barrio Timiza, Kennedy, Bogotá, Colombia

Plataforma web para la consulta de datos catastrales y urbanos del Barrio Timiza (UPZ 47), Localidad de Kennedy, Bogotá, Colombia, con visor 3D, gestión de puntos de interés y CRUD de predios.

## Estructura (3 capas)
- `/frontend` — Capa de Presentación (React + Vite + Tailwind + MapLibre GL + Lucide).
- `/backend-api` — Capa de API / Lógica de Negocio (FastAPI + SQLAlchemy + Pydantic).
- `/database` — Capa de Persistencia (SQL / GeoJSON / migraciones).
- `/docs` — Documentación técnica.

## Puesta en marcha
- Backend: `uvicorn main:app --reload`
- Frontend: `npm run dev`

## Despliegue en la nube (producción)

### Frontend (Vercel)
- Subdominio limpio: `https://barrio-timiza-kennedy.vercel.app`
- Configuración SPA: `frontend/vercel.json` (rewrites hacia `/index.html`).
- Variables de entorno: definir `VITE_API_URL` con la URL pública del backend, por ejemplo `https://timiza-api.onrender.com`.

### Backend (Render)
- `backend-api/render.yaml` (build: `pip install -r requirements.txt`, start: `uvicorn main:app --host 0.0.0.0 --port $PORT`).
- URL pública tipo: `https://timiza-api.onrender.com`.

### Base de datos
- SQLite local por defecto (`database/timiza_catastro.db`).
- En producción usar PostgreSQL con la variable `DATABASE_URL`.

## Documentación
- Requerimientos: `docs/01_MODELO_REQUERIMIENTOS.md`
- Arquitectura: `docs/02_ARQUITECTURA_SOLUCION.md`
- Pruebas y calidad: `docs/03_MODELO_PRUEBAS_Y_CALIDAD.md`
