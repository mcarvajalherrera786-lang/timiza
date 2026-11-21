from typing import Optional
from pydantic import BaseModel, Field, model_validator


class PredioBase(BaseModel):
    chip: str = Field(..., min_length=6, max_length=20)
    cedula_catastral: str = Field(..., min_length=6, max_length=40)
    nombre_predio: str = Field(..., min_length=2, max_length=150)
    direccion_oficial: Optional[str] = Field(None, max_length=255)
    barrio: str = Field(default="Timiza", max_length=100)
    sector_catastral: Optional[str] = Field(None, max_length=50)
    estrato: Optional[int] = Field(None, ge=1, le=6)
    destino_economico: str = Field(..., min_length=3, max_length=40)
    uso_suelo: Optional[str] = Field(None, max_length=40)
    area_terreno_m2: float = Field(..., gt=0)
    area_construida_m2: float = Field(default=0.0, ge=0)
    num_pisos: Optional[int] = Field(None, ge=0)
    avaluo_catastral_cop: float = Field(default=0.0, ge=0)
    valor_m2_cop: Optional[float] = Field(None, ge=0)
    estado_conservacion: Optional[str] = Field(None, max_length=30)
    latitud: float = Field(..., ge=-90, le=90)
    longitud: float = Field(..., ge=-180, le=180)
    altura_extrusion_m: float = Field(default=0.0, ge=0)
    observaciones: Optional[str] = Field(None, max_length=2000)

    @model_validator(mode="after")
    def validar_coordenadas(self):
        if not (4.5 <= self.latitud <= 4.8 and -74.5 <= self.longitud <= -74.0):
            raise ValueError("Las coordenadas deben estar dentro del área de Bogotá / Timiza")
        return self


class PredioCreate(PredioBase):
    @model_validator(mode="before")
    @classmethod
    def _calcular_valor_m2(cls, data):
        if isinstance(data, dict):
            if data.get("valor_m2_cop") is None:
                area = float(data.get("area_terreno_m2") or 0)
                avaluo = float(data.get("avaluo_catastral_cop") or 0)
                if area > 0:
                    data["valor_m2_cop"] = round(avaluo / area, 2)
        return data


class PredioUpdate(BaseModel):
    chip: Optional[str] = Field(None, min_length=6, max_length=20)
    cedula_catastral: Optional[str] = Field(None, min_length=6, max_length=40)
    nombre_predio: Optional[str] = Field(None, min_length=2, max_length=150)
    direccion_oficial: Optional[str] = Field(None, max_length=255)
    barrio: Optional[str] = Field(None, max_length=100)
    sector_catastral: Optional[str] = Field(None, max_length=50)
    estrato: Optional[int] = Field(None, ge=1, le=6)
    destino_economico: Optional[str] = Field(None, min_length=3, max_length=40)
    uso_suelo: Optional[str] = Field(None, max_length=40)
    area_terreno_m2: Optional[float] = Field(None, gt=0)
    area_construida_m2: Optional[float] = Field(None, ge=0)
    num_pisos: Optional[int] = Field(None, ge=0)
    avaluo_catastral_cop: Optional[float] = Field(None, ge=0)
    valor_m2_cop: Optional[float] = Field(None, ge=0)
    estado_conservacion: Optional[str] = Field(None, max_length=30)
    latitud: Optional[float] = Field(None, ge=-90, le=90)
    longitud: Optional[float] = Field(None, ge=-180, le=180)
    altura_extrusion_m: Optional[float] = Field(None, ge=0)
    observaciones: Optional[str] = Field(None, max_length=2000)


class PredioResponse(BaseModel):
    id: int
    chip: str
    cedula_catastral: str
    nombre_predio: str
    direccion_oficial: Optional[str]
    barrio: str
    sector_catastral: Optional[str]
    estrato: Optional[int]
    destino_economico: str
    uso_suelo: Optional[str]
    area_terreno_m2: float
    area_construida_m2: float
    num_pisos: Optional[int]
    avaluo_catastral_cop: float
    valor_m2_cop: float
    estado_conservacion: Optional[str]
    latitud: float
    longitud: float
    altura_extrusion_m: float
    observaciones: Optional[str]
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
