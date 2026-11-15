
from pathlib import Path
from functools import lru_cache
from PIL import Image
import colorsys
import math

BASE_DIR = Path(__file__).resolve().parent

RUTA_IMAGEN = (
    BASE_DIR / "data" / "wind" / "Viento.jpg"
)


@lru_cache(maxsize=1)
def cargar_imagen_viento():
    if not RUTA_IMAGEN.exists():
        raise FileNotFoundError(
            "No se encontró wind_global.jpg"
        )

    imagen = Image.open(RUTA_IMAGEN).convert("RGB")
    print("Imagen del viento cargada:", imagen.size)

    return imagen


def consultar_viento_visual(lat, lon):
    if not (
        math.isfinite(lat)
        and math.isfinite(lon)
        and -90 <= lat <= 90
        and -180 <= lon <= 180
    ):
        raise ValueError("Coordenadas inválidas")

    imagen = cargar_imagen_viento()
    ancho, alto = imagen.size

    x = round((lon + 180) / 360 * (ancho - 1))
    y = round((90 - lat) / 180 * (alto - 1))

    x = max(0, min(ancho - 1, x))
    y = max(0, min(alto - 1, y))

    r, g, b = imagen.getpixel((x, y))

    tono, saturacion, brillo = colorsys.rgb_to_hsv(
        r / 255,
        g / 255,
        b / 255
    )

    # Detección visual provisional de fondo claro.
    # No es una máscara geográfica exacta.
    fondo_claro = (
        min(r, g, b) > 185
        and max(r, g, b) - min(r, g, b) < 35
    )

    disponible = not fondo_claro

    return {
        "fuente": "NASA SVS GEOS-FP",
        "tipo": "sonificacion_visual",
        "variable": "viento_superficial",
        "ubicacion": {
            "latitud": lat,
            "longitud": lon
        },
        "pixel": {
            "x": x,
            "y": y
        },
        "color": {
            "r": r,
            "g": g,
            "b": b
        },
        "disponible": disponible,
        "caracteristicas": {
            "tono": round(tono, 4),
            "saturacion": round(saturacion, 4),
            "brillo": round(brillo, 4)
        }
    }
