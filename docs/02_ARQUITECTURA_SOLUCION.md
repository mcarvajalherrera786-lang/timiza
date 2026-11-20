# ARQUITECTURA DE LA SOLUCIÓN — Timiza 3D

## 1. Vista general de 3 capas

```
┌─────────────────────────────────────────────────────────────┐
│ CAPA 1 · PRESENTACIÓN (Frontend)                              │
│ React + Vite + Tailwind + MapLibre GL + Lucide                │
│ - Visor 3D, paneles, formularios CRUD, consumo REST          │
└────────────────────────────────┬────────────────────────────┘
                                 │ HTTP/JSON (GET/POST/PUT/DELETE)
                                 ▼
┌────────────────────────────────────────────────────────────┐
│ CAPA 2 · API / LÓGICA DE NEGOCIO (Backend)                   │
│ FastAPI + SQLAlchemy + Pydantic                            │
│ - Endpoints /api/predios, /api/barrio/resumen              │
│ - Validaciones, reglas de negocio                         │
└────────────────────────────────┬────────────────────────────┘
                                 │ SQL
                                 ▼
┌────────────────────────────────────────────────────────────┐
│ CAPA 3 · PERSISTENCIA (Database)                             │
│ SQLite (dev) / PostgreSQL (prod)                             │
│ - Schema SQL, modelos SQLAlchemy, seed                   │
└────────────────────────────────────────────────────────────┘
```

## 2. Flujo de peticiones HTTP/JSON
1. Frontend llama a API REST.
2. Backend valida y aplica reglas.
3. Backend persiste.
4. Backend responde JSON.

## 3. Stack tecnológico
- Frontend: React, Vite, Tailwind CSS, MapLibre GL, Lucide.
- Backend: FastAPI, SQLAlchemy, Pydantic, SQLite/PostgreSQL.
- Datos: SQL, GeoJSON.

## 4. Modelo entidad-relación (ER)
- PredioBarrio 1:N con Barrio.

## 5. Diccionario de datos catastrales
- CHIP, cédula catastral, estrato, destino económico, área terreno, área construida, avalúo catastral.
