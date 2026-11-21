import json
import os
from datetime import datetime

from database import SessionLocal, engine
from models import Base, PredioCatastral

DATABASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database")
SEED_PATH = os.path.join(DATABASE_DIR, "seed_data.json")


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = db.query(PredioCatastral).count()
        if count == 0:
            with open(SEED_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            registros = data.get("registros", []) if isinstance(data, dict) else data
            for r in registros:
                db.add(
                    PredioCatastral(
                        chip=r.get("chip"),
                        cedula_catastral=r.get("cedula_catastral"),
                        nombre_predio=r.get("nombre_predio"),
                        direccion_oficial=r.get("direccion_oficial"),
                        barrio=r.get("barrio") or "Timiza",
                        sector_catastral=r.get("sector_catastral"),
                        estrato=r.get("estrato"),
                        destino_economico=r.get("destino_economico"),
                        uso_suelo=r.get("uso_suelo"),
                        area_terreno_m2=r.get("area_terreno_m2") or 0,
                        area_construida_m2=r.get("area_construida_m2") or 0,
                        num_pisos=r.get("num_pisos"),
                        avaluo_catastral_cop=r.get("avaluo_catastral_cop") or 0,
                        valor_m2_cop=r.get("valor_m2_cop") or 0,
                        estado_conservacion=r.get("estado_conservacion"),
                        latitud=r.get("latitud") or 0,
                        longitud=r.get("longitud") or 0,
                        altura_extrusion_m=r.get("altura_extrusion_m") or 0,
                        observaciones=r.get("observaciones"),
                        created_at=datetime.fromisoformat(r.get("created_at")) if r.get("created_at") else datetime.utcnow(),
                        updated_at=datetime.fromisoformat(r.get("updated_at")) if r.get("updated_at") else datetime.utcnow(),
                    )
                )
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print("Base de datos inicializada correctamente.")
