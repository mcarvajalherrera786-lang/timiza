"""API REST para el barrio Timiza (Kennedy, Bogotá) - Capa API."""

import os
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker

from models import Base, PredioBarrio

# ---------------------------------------------------------------------------
# Configuración de la base de datos (SQLite por defecto, PostgreSQL via env)
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./timiza.db")
is_sqlite = DATABASE_URL.startswith("sqlite")
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if is_sqlite else {},
)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    bind=engine,
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Modelos Pydantic (esquemas de la API)
# ---------------------------------------------------------------------------
CATEGORIAS_VALIDAS = {"Parque", "Educación", "Salud", "Comercio", "Residencial", "Cultural"}


class PredioBase(BaseModel):
    codigo_catastral: str = Field(..., min_length=3, max_length=24)
    nombre_sitio: str = Field(..., min_length=2, max_length=150)
    categoria: str = Field(..., description="Parque, Educación, Salud, Comercio, Residencial, Cultural")
    direccion: Optional[str] = Field(None, max_length=255)
    estrato: Optional[int] = Field(None, ge=1, le=5)
    area_m2: Optional[float] = Field(None, ge=0)
    avaluo_referencial: Optional[float] = Field(None, ge=0)
    latitud: float = Field(..., ge=-90.0, le=90.0)
    longitud: float = Field(..., ge=-180.0, le=180.0)
    descripcion: Optional[str] = Field(None, max_length=2000)


class PredioCreate(PredioBase):
    """Payload para crear un predio (debe estar dentro del polígono de Timiza)."""


class PredioUpdate(BaseModel):
    """Payload para actualizar un predio (PUT - reemplazo completo)."""

    codigo_catastral: Optional[str] = Field(None, min_length=3, max_length=24)
    nombre_sitio: Optional[str] = Field(None, min_length=2, max_length=150)
    categoria: Optional[str] = Field(None)
    direccion: Optional[str] = Field(None, max_length=255)
    estrato: Optional[int] = Field(None, ge=1, le=5)
    area_m2: Optional[float] = Field(None, ge=0)
    avaluo_referencial: Optional[float] = Field(None, ge=0)
    latitud: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitud: Optional[float] = Field(None, ge=-180.0, le=180.0)
    descripcion: Optional[str] = Field(None, max_length=2000)


class PredioResponse(BaseModel):
    """Respuesta serializada de un predio."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    codigo_catastral: str
    nombre_sitio: str
    categoria: str
    direccion: Optional[str]
    estrato: Optional[int]
    area_m2: Optional[float]
    avaluo_referencial: Optional[float]
    latitud: float
    longitud: float
    descripcion: Optional[str]
    fecha_actualizacion: Optional[str] = None


class BarrioResumen(BaseModel):
    """Resumen agregado del barrio Timiza."""

    model_config = ConfigDict(from_attributes=True)

    barrio: str = "Timiza"
    localidad: str = "Kennedy"
    total_predios: int = 0
    area_m2_total: float = 0.0
    area_m2_promedio: float = 0.0
    total_avaluos: float = 0.0
    distribucion_estratos: list = []
    distribucion_categorias: list = []
    centro_latitud: float = 4.6115
    centro_longitud: float = -74.1558
    fecha_generacion: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def predio_to_response(p: PredioBarrio) -> PredioResponse:
    return PredioResponse(
        id=p.id,
        codigo_catastral=p.codigo_catastral,
        nombre_sitio=p.nombre_sitio,
        categoria=p.categoria,
        direccion=p.direccion,
        estrato=p.estrato,
        area_m2=p.area_m2,
        avaluo_referencial=p.avaluo_referencial,
        latitud=p.latitud,
        longitud=p.longitud,
        descripcion=p.descripcion,
        fecha_actualizacion=p.fecha_actualizacion.isoformat() if p.fecha_actualizacion else None,
    )


def punto_en_poligono(latitud: float, longitud: float, poligono: list) -> bool:
    """Algoritmo ray casting para verificar si un punto está dentro del polígono."""
    x, y = longitud, latitud
    vertice_s = False
    n = len(poligono)
    i = n - 1
    for j in range(n):
        xi, yi = poligono[i][0], poligono[i][1]
        xj, yj = poligono[j][0], poligono[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi):
            vertice_s = not vertice_s
        i = j
    return vertice_s


TIMIZA_POLYGON = [
    # Polígono aproximado del barrio Timiza (Kennedy, Bogotá) - en [lng, lat]
    [-74.20, 4.58],
    [-74.10, 4.58],
    [-74.10, 4.65],
    [-74.20, 4.65],
    [-74.20, 4.58],
]


# ---------------------------------------------------------------------------
# Aplicación FastAPI
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Timiza API",
    description="API REST para la consulta de datos catastrales y gestión de puntos de interés del barrio Timiza (Kennedy, Bogotá).",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints CRUD - /api/predios
# ---------------------------------------------------------------------------
@app.get("/api/predios", response_model=dict)
def listar_predios(
    categoria: Optional[str] = Query(None, description="Filtrar por categoría: Parque, Educación, Salud, Comercio, Residencial, Cultural"),
    q: Optional[str] = Query(None, description="Búsqueda por texto (nombre_sitio)"),
    db: Session = Depends(get_db),
) -> dict:
    """Lista predios con filtros opcionales por categoría y búsqueda por texto."""
    stmt = select(PredioBarrio).order_by(PredioBarrio.id)
    if categoria:
        stmt = stmt.where(PredioBarrio.categoria == categoria)
    if q:
        stmt = stmt.where(PredioBarrio.nombre_sitio.ilike(f"%{q}%"))
    result = db.execute(stmt).scalars().all()
    return {"data": [predio_to_response(p) for p in result], "total": len(result)}


@app.get("/api/predios/{predio_id}", response_model=PredioResponse)
def obtener_predio(predio_id: int, db: Session = Depends(get_db)) -> PredioResponse:
    """Consulta un predio por su id."""
    result = db.execute(select(PredioBarrio).where(PredioBarrio.id == predio_id)).scalars().first()
    if not result:
        raise HTTPException(status_code=404, detail="Predio no encontrado")
    return predio_to_response(result)


@app.post("/api/predios", response_model=PredioResponse, status_code=201)
def crear_predio(predio: PredioCreate, db: Session = Depends(get_db)) -> PredioResponse:
    """Crea un nuevo predio validando que las coordenadas estén dentro del polígono de Timiza."""
    dentro = punto_en_poligono(predio.latitud, predio.longitud, TIMIZA_POLYGON)
    if not dentro:
        raise HTTPException(status_code=400, detail="Las coordenadas no se encuentran dentro del polígono del barrio Timiza")

    if predio.categoria not in CATEGORIAS_VALIDAS:
        raise HTTPException(status_code=422, detail=f"Categoría inválida. Valores permitidos: {sorted(CATEGORIAS_VALIDAS)}")

    db_predio = PredioBarrio(
        codigo_catastral=predio.codigo_catastral,
        nombre_sitio=predio.nombre_sitio,
        categoria=predio.categoria,
        direccion=predio.direccion,
        estrato=predio.estrato,
        area_m2=predio.area_m2,
        avaluo_referencial=predio.avaluo_referencial,
        latitud=predio.latitud,
        longitud=predio.longitud,
        descripcion=predio.descripcion,
        fecha_actualizacion=datetime.utcnow(),
    )
    db.add(db_predio)
    db.commit()
    db.refresh(db_predio)
    return predio_to_response(db_predio)


@app.put("/api/predios/{predio_id}", response_model=PredioResponse)
def actualizar_predio(predio_id: int, predio: PredioUpdate, db: Session = Depends(get_db)) -> PredioResponse:
    """Actualiza (PUT) los datos catastrales de un predio existente."""
    result = db.execute(select(PredioBarrio).where(PredioBarrio.id == predio_id)).scalars().first()
    if not result:
        raise HTTPException(status_code=404, detail="Predio no encontrado")

    data = predio.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")

    result.codigo_catastral = data.get("codigo_catastral") or result.codigo_catastral
    result.nombre_sitio = data.get("nombre_sitio") or result.nombre_sitio
    result.categoria = data.get("categoria") or result.categoria
    result.direccion = data.get("direccion")
    result.estrato = data.get("estrato")
    result.area_m2 = data.get("area_m2")
    result.avaluo_referencial = data.get("avaluo_referencial")
    result.latitud = data.get("latitud") or result.latitud
    result.longitud = data.get("longitud") or result.longitud
    result.descripcion = data.get("descripcion")
    result.fecha_actualizacion = datetime.utcnow()

    db.commit()
    db.refresh(result)
    return predio_to_response(result)


@app.delete("/api/predios/{predio_id}")
def eliminar_predio(predio_id: int, db: Session = Depends(get_db)) -> dict:
    """Elimina (DELETE) un predio por su id."""
    result = db.execute(select(PredioBarrio).where(PredioBarrio.id == predio_id)).scalars().first()
    if not result:
        raise HTTPException(status_code=404, detail="Predio no encontrado")
    db.delete(result)
    db.commit()
    return {"detail": "Predio eliminado correctamente"}


@app.get("/api/barrio/resumen")
def barrio_resumen(db: Session = Depends(get_db)) -> dict:
    """Devuelve estadísticas agregadas del barrio Timiza."""
    total_predios = db.execute(select(func.count(PredioBarrio.id))).scalar() or 0
    area_total = db.execute(select(func.sum(PredioBarrio.area_m2))).scalar() or 0.0
    area_promedio = db.execute(select(func.avg(PredioBarrio.area_m2))).scalar() or 0.0
    total_avaluos = db.execute(select(func.sum(PredioBarrio.avaluo_referencial))).scalar() or 0.0

    por_estratos = (
        db.execute(
            select(PredioBarrio.estrato, func.count(PredioBarrio.id))
            .where(PredioBarrio.estrato.isnot(None))
            .group_by(PredioBarrio.estrato)
            .all()
        )
    ).all()

    por_categorias = (
        db.execute(
            select(PredioBarrio.categoria, func.count(PredioBarrio.id))
            .group_by(PredioBarrio.categoria)
            .all()
        )
    ).all()

    return {
        "barrio": "Timiza",
        "localidad": "Kennedy",
        "total_predios": total_predios,
        "area_m2_total": float(area_total or 0.0),
        "area_m2_promedio": float(area_promedio or 0.0),
        "total_avaluos": float(total_avaluos or 0.0),
        "distribucion_estratos": [{"estrato": e, "total": int(c)} for e, c in por_estratos],
        "distribucion_categorias": [{"categoria": c, "total": int(n)} for c, n in por_categorias],
        "centro_latitud": 4.6115,
        "centro_longitud": -74.1558,
        "fecha_generacion": datetime.utcnow().isoformat(),
    }
