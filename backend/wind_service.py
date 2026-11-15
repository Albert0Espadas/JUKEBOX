
from pathlib import Path
from functools import lru_cache
import math
import xarray as xr

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "wind"


@lru_cache(maxsize=1)
def cargar_datos():
    archivos = sorted(DATA_DIR.glob("*.nc4"))

    if not archivos:
        raise FileNotFoundError(
            "No se encontró el archivo NASA MERRA-2."
        )

    ds = xr.open_dataset(archivos[0])

    variables_necesarias = ["U10M", "V10M", "T2M"]
    faltantes = [
        variable for variable in variables_necesarias
        if variable not in ds.data_vars
    ]

    if faltantes:
        raise ValueError(
            "El archivo NASA no contiene: "
            + ", ".join(faltantes)
        )

    # Solo seleccionamos las variables necesarias.
    # Los datos completos no se cargan a memoria.
    return ds[variables_necesarias]


def consultar_viento(lat, lon):
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError("Coordenadas fuera de rango")

    ds = cargar_datos()

    # Consultamos el primer instante del archivo
    # en la ubicación más cercana.
    punto = ds.sel(
        lat=lat,
        lon=lon,
        method="nearest"
    ).isel(time=0)

    u = float(punto["U10M"].values)
    v = float(punto["V10M"].values)
    temperatura_kelvin = float(punto["T2M"].values)

    valores = [u, v, temperatura_kelvin]

    if not all(math.isfinite(valor) for valor in valores):
        raise ValueError(
            "No hay datos válidos en esta ubicación."
        )

    velocidad = math.hypot(u, v)

    temperatura_celsius = temperatura_kelvin - 273.15

    return {
        "ubicacion": {
            "latitud": float(punto.lat.values),
            "longitud": float(punto.lon.values)
        },
        "viento": {
            "u": round(u, 3),
            "v": round(v, 3),
            "velocidad": round(velocidad, 3)
        },
        "temperatura": round(temperatura_celsius, 2)
    }
