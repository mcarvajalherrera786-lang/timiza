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

## Documentación
- Requerimientos: `docs/01_MODELO_REQUERIMIENTOS.md`
- Arquitectura: `docs/02_ARQUITECTURA_SOLUCION.md`
- Pruebas y calidad: `docs/03_MODELO_PRUEBAS_Y_CALIDAD.md`
