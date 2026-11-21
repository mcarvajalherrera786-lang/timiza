from datetime import datetime
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models import PredioCatastral
from schemas import PredioCreate, PredioUpdate, PredioResponse


def predio_to_response(p: PredioCatastral) -> PredioResponse:
    return PredioResponse(
        id=p.id,
        chip=p.chip,
        cedula_catastral=p.cedula_catastral,
        nombre_predio=p.nombre_predio,
        direccion_oficial=p.direccion_oficial,
        barrio=p.barrio,
        sector_catastral=p.sector_catastral,
        estrato=p.estrato,
        destino_economico=p.destino_economico,
        uso_suelo=p.uso_suelo,
        area_terreno_m2=p.area_terreno_m2,
        area_construida_m2=p.area_construida_m2,
        num_pisos=p.num_pisos,
        avaluo_catastral_cop=p.avaluo_catastral_cop,
        valor_m2_cop=p.valor_m2_cop,
        estado_conservacion=p.estado_conservacion,
        latitud=p.latitud,
        longitud=p.longitud,
        altura_extrusion_m=p.altura_extrusion_m,
        observaciones=p.observaciones,
        created_at=p.created_at.isoformat() if p.created_at else None,
        updated_at=p.updated_at.isoformat() if p.updated_at else None,
    )


def get_predios(
    db: Session,
    destino_economico: Optional[str] = None,
    estrato: Optional[int] = None,
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
):
    stmt = select(PredioCatastral).order_by(PredioCatastral.id).offset(skip).limit(limit)
    if destino_economico:
        stmt = stmt.where(PredioCatastral.destino_economico == destino_economico)
    if estrato is not None:
        stmt = stmt.where(PredioCatastral.estrato == estrato)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            (PredioCatastral.nombre_predio.ilike(like))
            | (PredioCatastral.direccion_oficial.ilike(like))
            | (PredioCatastral.chip.ilike(like))
        )
    return list(db.execute(stmt).scalars().all())


def get_predio_by_id(db: Session, predio_id: int):
    return db.get(PredioCatastral, predio_id)


def create_predio(db: Session, predio_in: PredioCreate) -> PredioCatastral:
    db_obj = PredioCatastral(**predio_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_predio(db: Session, predio_id: int, predio_in: PredioUpdate):
    db_obj = db.get(PredioCatastral, predio_id)
    if not db_obj:
        return None
    data = predio_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_obj, key, value)
    db_obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_predio(db: Session, predio_id: int) -> bool:
    db_obj = db.get(PredioCatastral, predio_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True


def get_estadisticas_barrio(db: Session) -> dict:
    total = db.execute(select(func.count(PredioCatastral.id))).scalar() or 0
    avaluo_total = db.execute(select(func.sum(PredioCatastral.avaluo_catastral_cop))).scalar() or 0.0
    area_prom = db.execute(select(func.avg(PredioCatastral.area_terreno_m2))).scalar() or 0.0

    stmt_destinos = (
        select(PredioCatastral.destino_economico, func.count(PredioCatastral.id))
        .group_by(PredioCatastral.destino_economico)
    )
    por_destinos = db.execute(stmt_destinos).all()

    stmt_estratos = (
        select(PredioCatastral.estrato, func.count(PredioCatastral.id))
        .where(PredioCatastral.estrato.isnot(None))
        .group_by(PredioCatastral.estrato)
    )
    por_estratos = db.execute(stmt_estratos).all()

    return {
        "total_predios": int(total),
        "total_avaluos": float(avaluo_total or 0.0),
        "area_m2_promedio": float(area_prom or 0.0),
        "distribucion_destinos": [
            {"destino_economico": d, "total": int(c)} for d, c in por_destinos
        ],
        "distribucion_estratos": [
            {"estrato": e, "total": int(c)} for e, c in por_estratos if e is not None
        ],
    }
