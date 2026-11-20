# OPENCODE.md — Instrucciones del Agente para el Proyecto Timiza

## Propósito del proyecto
Plataforma web **Timiza 3D** para el Barrio Timiza (UPZ 47), Localidad de Kennedy, Bogotá, Colombia. Permite consultar datos catastrales y urbanos, visualizar el barrio en un visor 3D con MapLibre GL y gestionar puntos de interés mediante CRUD.

## Instrucciones obligatorias para el agente

1. **Escritura real en disco**: Toda modificación de código, documentación o configuración debe escribirse en los archivos del repositorio en el disco. Nunca se generan ideas, pseudocódigo o fragmentos sueltos sin materializarlos en archivos.

2. **Pruebas en terminal**: Tras crear o modificar código, el agente debe ejecutar las validaciones disponibles (tests, build, lint) en la terminal y corregir errores hasta que pasen.

3. **Arquitectura de 3 capas estricta**: El sistema debe mantener siempre las capas separadas:
   - **Frontend** (`/frontend`): únicamente UI, componentes, consumo de API, estado de presentación. Prohibido acceso directo a base de datos o lógica SQL.
   - **Backend API** (`/backend-api`): lógica de negocio, endpoints REST, validaciones, orquestación. Prohibida lógica de UI.
   - **Database** (`/database`): scripts SQL, migraciones, datos iniciales/GeoJSON.

4. **No mezclar lógica de base de datos en el frontend**: El frontend solo consume la REST API. Cualquier consulta a BD debe estar en backend y ser expuesta vía endpoints REST.

## Estructura de carpetas esperada
```
TIMIZA/
├── frontend/       # React + Vite + Tailwind + MapLibre GL
├── backend-api/    # FastAPI + SQLAlchemy + Pydantic
├── database/       # SQL / GeoJSON / migraciones
└── docs/           # Documentación técnica
```

## Convenciones
- Nombres de endpoints en snake_case bajo `/api`.
- Modelos SQLAlchemy en `models.py`; esquemas Pydantic en `schemas` o junto al endpoint.
- Variables de entorno con defaults (p. ej. `DATABASE_URL`, `VITE_API_URL`).
- Documentación en Markdown dentro de `/docs`.
