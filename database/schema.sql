-- ============================================================
-- TIMIZA 3D — Capa de Persistencia (Database)
-- Diseño relacional compatible con SQLite y PostgreSQL/PostGIS
-- ============================================================

CREATE TABLE IF NOT EXISTS barrio_metadata (
    id SERIAL PRIMARY KEY,
    nombre_barrio VARCHAR(100) NOT NULL DEFAULT 'Timiza',
    localidad VARCHAR(100) NOT NULL DEFAULT 'Kennedy',
    codigo_localidad VARCHAR(20) NOT NULL,
    codigo_upz VARCHAR(20) NOT NULL,
    nombre_upz VARCHAR(100) NOT NULL,
    area_total_ha NUMERIC(12,2) NOT NULL DEFAULT 0,
    poblacion_estimada INTEGER,
    estrato_predominante VARCHAR(10) NOT NULL DEFAULT '2',
    historia TEXT,
    hidrografia TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predios_catastrales (
    id SERIAL PRIMARY KEY,
    chip VARCHAR(20) NOT NULL UNIQUE,
    cedula_catastral VARCHAR(40) NOT NULL UNIQUE,
    nombre_predio VARCHAR(150) NOT NULL,
    direccion_oficial VARCHAR(255),
    barrio VARCHAR(100) NOT NULL DEFAULT 'Timiza',
    sector_catastral VARCHAR(50),
    estrato SMALLINT,
    destino_economico VARCHAR(40) NOT NULL,
    uso_suelo VARCHAR(40),
    area_terreno_m2 NUMERIC(12,2) NOT NULL DEFAULT 0,
    area_construida_m2 NUMERIC(12,2) NOT NULL DEFAULT 0,
    num_pisos SMALLINT,
    avaluo_catastral_cop NUMERIC(18,2) NOT NULL DEFAULT 0,
    valor_m2_cop NUMERIC(18,2) NOT NULL DEFAULT 0,
    estado_conservacion VARCHAR(30) DEFAULT 'En buen estado',
    latitud NUMERIC(12,7) NOT NULL,
    longitud NUMERIC(12,7) NOT NULL,
    altura_extrusion_m NUMERIC(8,2) NOT NULL DEFAULT 0,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predios_catastrales_barrio ON predios_catastrales (barrio);
CREATE INDEX IF NOT EXISTS idx_predios_catastrales_cedula ON predios_catastrales (cedula_catastral);
CREATE INDEX IF NOT EXISTS idx_predios_catastrales_chip ON predios_catastrales (chip);
CREATE INDEX IF NOT EXISTS idx_predios_catastrales_destino ON predios_catastrales (destino_economico);
