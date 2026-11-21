from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PredioCatastral(Base):
    __tablename__ = "predios_catastrales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chip: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    cedula_catastral: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    nombre_predio: Mapped[str] = mapped_column(String(150), nullable=False)
    direccion_oficial: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    barrio: Mapped[str] = mapped_column(String(100), nullable=False, default="Timiza")
    sector_catastral: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    estrato: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    destino_economico: Mapped[str] = mapped_column(String(40), nullable=False)
    uso_suelo: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    area_terreno_m2: Mapped[float] = mapped_column(Float, nullable=False)
    area_construida_m2: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    num_pisos: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    avaluo_catastral_cop: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    valor_m2_cop: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    estado_conservacion: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    latitud: Mapped[float] = mapped_column(Float, nullable=False)
    longitud: Mapped[float] = mapped_column(Float, nullable=False)
    altura_extrusion_m: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
