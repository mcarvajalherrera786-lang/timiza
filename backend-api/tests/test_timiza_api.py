import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import get_db
from main import app
from models import Base

TEST_DB_URL = "sqlite:///./test_timiza.db"

engine_test = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine_test)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine_test)
        engine_test.dispose()


@pytest.fixture()
def client(db):
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_get_barrio_retorna_ficha_geojson_y_estadisticas(client):
    response = client.get("/api/v1/barrio")
    assert response.status_code == 200
    data = response.json()
    assert data["barrio"] == "Timiza"
    assert data["localidad"] == "Kennedy"
    assert data["upz"] == "UPZ 47"
    assert data["area_total_ha"] == 122.45
    assert data["geojson"]["type"] == "FeatureCollection"
    assert "estadisticas" in data
    assert "total_predios" in data["estadisticas"]


def test_crud_predios_completo(client):
    response = client.get("/api/v1/predios")
    assert response.status_code == 200
    assert response.json()["total"] == 0

    payload = {
        "chip": "AAA00459999",
        "cedula_catastral": "0570010999999",
        "nombre_predio": "Parque de Prueba Timiza",
        "direccion_oficial": "Av. Villavicencio #1, Kennedy",
        "barrio": "Timiza",
        "sector_catastral": "Sector Prueba",
        "estrato": 3,
        "destino_economico": "Recreacional",
        "uso_suelo": "Recreativo",
        "area_terreno_m2": 1000.0,
        "area_construida_m2": 200.0,
        "num_pisos": 1,
        "avaluo_catastral_cop": 50000000.0,
        "valor_m2_cop": 50000.0,
        "estado_conservacion": "En buen estado",
        "latitud": 4.6115,
        "longitud": -74.1558,
        "altura_extrusion_m": 8.0,
        "observaciones": "Registro de prueba",
    }

    response = client.post("/api/v1/predios", json=payload)
    assert response.status_code == 201
    creado = response.json()
    assert creado["nombre_predio"] == "Parque de Prueba Timiza"
    predio_id = creado["id"]

    response = client.get(f"/api/v1/predios/{predio_id}")
    assert response.status_code == 200
    assert response.json()["id"] == predio_id

    response = client.put(f"/api/v1/predios/{predio_id}", json={"nombre_predio": "Parque de Prueba Timiza 2"})
    assert response.status_code == 200
    assert response.json()["nombre_predio"] == "Parque de Prueba Timiza 2"

    response = client.delete(f"/api/v1/predios/{predio_id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/predios/{predio_id}")
    assert response.status_code == 404
