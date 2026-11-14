
from pathlib import Path
from functools import lru_cache
import math
import xarray as xr

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "wind"

@lru_cache(maxsize=1)
def cargar_datos():
    archivos = list(DATA_DIR.glob("*.nc4"))

    if not archivos:
        raise FileNotFoundError(
            "No se encontró el archivo NASA."
        )

    ds = xr.open_dataset(archivos[0])

    # Para esta prueba usamos la primera hora.
    return ds[["U10M", "V10M"]].isel(time=0).load()

def consultar_viento(lat, lon):
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError("Coordenadas fuera de rango")

    ds = cargar_datos()

    punto = ds.sel(
        lat=lat,
        lon=lon,
        method="nearest"
    )

    u = float(punto["U10M"].values)
    v = float(punto["V10M"].values)

    if not math.isfinite(u) or not math.isfinite(v):
        raise ValueError("No hay datos válidos en esta ubicación")

    velocidad = math.hypot(u, v)

    return {
        "ubicacion": {
            "latitud": float(punto.lat.values),
            "longitud": float(punto.lon.values)
        },
        "viento": {
            "u": round(u, 3),
            "v": round(v, 3),
            "velocidad": round(velocidad, 3)
        }
    }
