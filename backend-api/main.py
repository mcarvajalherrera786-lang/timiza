import json
import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, PredioCatastral
from schemas import PredioCreate, PredioResponse, PredioUpdate
from crud import (
    create_predio,
    delete_predio,
    get_estadisticas_barrio,
    get_predio_by_id,
    get_predios,
    predio_to_response,
    update_predio,
)

Base.metadata.create_all(bind=engine)

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


@app.get("/api/v1/barrio")
def obtener_barrio(db: Session = Depends(get_db)) -> dict:
    stats = get_estadisticas_barrio(db)
    geojson_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database", "timiza_poligono.geojson")
    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson = json.load(f)
    return {
        "barrio": "Timiza",
        "localidad": "Kennedy",
        "upz": "UPZ 47",
        "area_total_ha": 122.45,
        "poblacion_estimada": 45000,
        "estrato_predominante": "3",
        "historia": (
            "Timiza es un barrio del sur de Bogotá, en la Localidad de Kennedy, asignado a la UPZ 47. "
            "Surgió a mediados del siglo XX como zona de expansión del Distrito, impulsado por el ICT para "
            "la construcción de barrios con equipamiento. Hoy es un barrio de fuerte identidad verde: el "
            "Parque Metropolitano Timiza, con su lago artificial, ciclorrutas, canchas de fútbol y más de "
            "2.652 árboles, es el corazón de la comunidad, mientras el Jardín Botánico de Bogotá protege la "
            "isla del lago y los bosques urbanos del sur de la ciudad."
        ),
        "hidrografia": "Lago Timiza y Río Tunjuelo",
        "geojson": geojson,
        "estadisticas": stats,
        "lugares_turisticos": [
            {
                "nombre": "Parque Metropolitano Timiza",
                "tipo": "Parque Natural",
                "descripcion": "Pulmón verde de Kennedy con lago artificial, ciclorrutas, canchas de fútbol y más de 2.652 árboles. Inaugurado en 2021.",
                "imagen": "https://upload.wikimedia.org/wikipedia/commons/a/af/Parque_Timiza%2C_Bogot%C3%A1.jpg",
                "latitud": 4.6115,
                "longitud": -74.1558,
            },
            {
                "nombre": "Lago Timiza",
                "tipo": "Lago Recreativo",
                "descripcion": "Lago artificial de recreación del barrio, rodeado de senderos, plazoletas y zonas verdes.",
                "imagen": "https://upload.wikimedia.org/wikipedia/commons/a/af/Parque_Timiza%2C_Bogot%C3%A1.jpg",
                "latitud": 4.605,
                "longitud": -74.145,
            },
            {
                "nombre": "Jardín Botánico de Bogotá",
                "tipo": "Naturaleza",
                "descripcion": "El Jardín Botánico protege la isla del lago del Parque Timiza y los bosques urbanos del sur de Bogotá.",
                "imagen": "https://upload.wikimedia.org/wikipedia/commons/a/af/Parque_Timiza%2C_Bogot%C3%A1.jpg",
                "latitud": 4.62,
                "longitud": -74.16,
            },
        ],
    }


@app.get("/api/v1/predios")
def listar_predios(
    destino_economico: str | None = None,
    estrato: int | None = None,
    q: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    predios = get_predios(db, destino_economico=destino_economico, estrato=estrato, q=q, skip=skip, limit=limit)
    return {"data": [predio_to_response(p) for p in predios], "total": len(predios)}


@app.get("/api/v1/predios/{predio_id}", response_model=PredioResponse)
def obtener_predio(predio_id: int, db: Session = Depends(get_db)) -> PredioResponse:
    predio = get_predio_by_id(db, predio_id)
    if not predio:
        raise HTTPException(status_code=404, detail="Predio no encontrado")
    return predio_to_response(predio)


@app.post("/api/v1/predios", response_model=PredioResponse, status_code=201)
def crear_predio(predio_in: PredioCreate, db: Session = Depends(get_db)) -> PredioResponse:
    predio = create_predio(db, predio_in)
    return predio_to_response(predio)


@app.put("/api/v1/predios/{predio_id}", response_model=PredioResponse)
def actualizar_predio(predio_id: int, predio_in: PredioUpdate, db: Session = Depends(get_db)) -> PredioResponse:
    predio = update_predio(db, predio_id, predio_in)
    if not predio:
        raise HTTPException(status_code=404, detail="Predio no encontrado")
    return predio_to_response(predio)


@app.delete("/api/v1/predios/{predio_id}")
def eliminar_predio(predio_id: int, db: Session = Depends(get_db)):
    ok = delete_predio(db, predio_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Predio no encontrado")
    return {"detail": "Predio eliminado correctamente"}
