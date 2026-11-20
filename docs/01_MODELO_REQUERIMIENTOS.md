# MODELO DE REQUERIMIENTOS — Timiza 3D (Barrio Timiza, Kennedy, Bogotá)

**Documento**: Especificación formal bajo estándar IEEE 830
**Proyecto**: Plataforma web Timiza 3D
**Alcance**: Barrio Timiza (UPZ 47), Localidad de Kennedy, Bogotá, Colombia

---

## 1. Alcance exclusivo del Barrio Timiza

La plataforma se limita al **Barrio Timiza**, dentro de la **Localidad de Kennedy**, en la ciudad de **Bogotá, Colombia**.

**Límites territoriales considerados:**
- **Av. Primera de Mayo**
- **Av. Boyacá**
- **Av. Villavicencio**
- **Río Tunjuelo / Carrera 72**

Fuera de estos límites no se incluyen registros, puntos de interés ni datos catastrales.

---

## 2. Requerimientos Funcionales

### RF-01 — Navegación 3D tipo Google Earth sobre Timiza
- El usuario podrá navegar el barrio en un visor 3D con altimetría y edificaciones.
- Debe existir control de navegación 3D, con opción de vista 2D/3D y animación `flyTo`.

### RF-02 — Consulta de Ficha Catastral
- El usuario podrá consultar la ficha catastral de un predio o sitio, incluyendo:
  - **CHIP**
  - **Cédula catastral**
  - **Estrato**
  - **Destino económico / uso de suelo**
  - **Área de terreno**
  - **Área construida**
  - **Avalúo catastral**

### RF-03 — CRUD completo (Create, Read, Update, Delete)
- El sistema permitirá **Crear**, **Leer**, **Actualizar** y **Eliminar** predios y equipamiento urbano.

### RF-04 — Simulador / Visor de normativa urbana y usos de suelo
- El usuario podrá visualizar y simular usos de suelo y normativa urbana aplicable.

---

## 3. Requerimientos No Funcionales

### RNF-01 — Rendimiento del visor 3D
- Carga de escenas 3D en tiempos aceptables para interacción fluida.

### RNF-02 — Seguridad
- Configuración CORS controlada.
- Validaciones de entrada en API.

### RNF-03 — Arquitectura
- Arquitectura en 3 capas estricta.

### RNF-04 — Disponibilidad
- Disponibilidad web del servicio.

---

## 4. Criterios de aceptación (resumen)
- RF-01: visor navegable en 3D.
- RF-02: ficha catastral completa.
- RF-03: CRUD operativo.
- RF-04: visor normativo.
