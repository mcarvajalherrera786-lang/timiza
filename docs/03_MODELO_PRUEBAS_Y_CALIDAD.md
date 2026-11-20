# MODELO DE PRUEBAS Y CALIDAD — Timiza 3D

## 1. Pruebas unitarias
- Validación de esquemas Pydantic.
- Reglas de negocio (polígono Timiza).

## 2. Pruebas de integración (CRUD)
- **Create**: POST /api/predios → 201.
- **Read**: GET /api/predios → 200; GET /api/predios/{id} → 200/404.
- **Update**: PUT /api/predios/{id} → 200.
- **Delete**: DELETE /api/predios/{id} → 200; GET → 404.

## 3. Calidad ISO/IEC 25010
- Funcionalidad, rendimiento, seguridad, mantenibilidad.
