
from pathlib import Path
from functools import lru_cache
from PIL import Image
import math
import colorsys

BASE_DIR = Path(__file__).resolve().parent

RUTA_IMAGEN = (
    BASE_DIR / "data" / "ocean"
    / "sst_mur_most_recent_print.jpg"
)


@lru_cache(maxsize=1)
def cargar_imagen():
    if not RUTA_IMAGEN.exists():
        raise FileNotFoundError(
            "No se encontró la imagen NASA del océano."
        )

    imagen = Image.open(RUTA_IMAGEN).convert("RGB")
    print("Imagen oceánica:", imagen.size)

    return imagen


def clasificar_color(r, g, b):
    # Detección PROVISIONAL de gris terrestre.
    diferencia = max(r, g, b) - min(r, g, b)

    if diferencia <= 12:
        return "sin_datos"

    tono, saturacion, brillo = colorsys.rgb_to_hsv(
        r / 255,
        g / 255,
        b / 255
    )

    # Clasificación aproximada del color NASA.
    # No equivale a una temperatura exacta.
    if tono >= 0.92 or tono < 0.07:
        categoria = "calido"
        nivel = 1.0
    elif tono < 0.16:
        categoria = "templado_calido"
        nivel = 0.8
    elif tono < 0.47:
        categoria = "templado"
        nivel = 0.55
    elif tono < 0.73:
        categoria = "frio"
        nivel = 0.2
    else:
        categoria = "intermedio"
        nivel = 0.5

    return {
        "categoria": categoria,
        "nivel": nivel,
        "tono": round(tono, 4),
        "saturacion": round(saturacion, 4),
        "brillo": round(brillo, 4)
    }


def consultar_oceano_visual(lat, lon):
    if not (
        math.isfinite(lat)
        and math.isfinite(lon)
        and -90 <= lat <= 90
        and -180 <= lon <= 180
    ):
        raise ValueError("Coordenadas inválidas")

    imagen = cargar_imagen()
    ancho, alto = imagen.size

    # Coordenadas geográficas -> píxel
    x = round((lon + 180) / 360 * (ancho - 1))
    y = round((90 - lat) / 180 * (alto - 1))

    x = max(0, min(x, ancho - 1))
    y = max(0, min(y, alto - 1))

    r, g, b = imagen.getpixel((x, y))

    resultado_color = clasificar_color(r, g, b)

    disponible = resultado_color != "sin_datos"

    return {
        "fuente": "NASA SVS MUR SST",
        "tipo": "sonificacion_visual",
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
        "clasificacion": (
            resultado_color if disponible else None
        )
    }
