"""Modelos SQLAlchemy de la capa de datos para el barrio Timiza."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base declarativa de SQLAlchemy 2.0."""

    pass


class PredioBarrio(Base):
    """Representa un predio / sitio de interés del barrio Timiza (Kennedy, Bogotá)."""

    __tablename__ = "predios_timiza"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    codigo_catastral: Mapped[str] = mapped_column(String(24), unique=True, nullable=False, index=True)
    nombre_sitio: Mapped[str] = mapped_column(String(150), nullable=False)
    categoria: Mapped[str] = mapped_column(String(30), nullable=False)
    direccion: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    estrato: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    area_m2: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    avaluo_referencial: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    latitud: Mapped[float] = mapped_column(Float, nullable=False)
    longitud: Mapped[float] = mapped_column(Float, nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fecha_actualizacion: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:  # pragma: no cover - solo para logs
        return f"<PredioBarrio id={self.id} nombre={self.nombre_sitio} categoria={self.categoria}>"
