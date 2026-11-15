
from pathlib import Path
from functools import lru_cache
from PIL import Image
import math

BASE_DIR = Path(__file__).resolve().parent

RUTA_IMAGEN = (
    BASE_DIR / "data" / "lights" / "luces_nocturnas.jpg"
)


@lru_cache(maxsize=1)
def cargar_imagen_luces():
    if not RUTA_IMAGEN.exists():
        raise FileNotFoundError(
            "No se encontró luces_nocturnas.jpg"
        )

    imagen = Image.open(RUTA_IMAGEN).convert("RGB")

    print(
        "Imagen NASA de luces cargada:",
        imagen.size
    )

    return imagen


def luminancia(r, g, b):
    return (
        0.2126 * r +
        0.7152 * g +
        0.0722 * b
    ) / 255


def consultar_luces_nocturnas(lat, lon):
    if not (
        math.isfinite(lat)
        and math.isfinite(lon)
        and -90 <= lat <= 90
        and -180 <= lon <= 180
    ):
        raise ValueError("Coordenadas inválidas")

    imagen = cargar_imagen_luces()
    ancho, alto = imagen.size

    # Convertir coordenadas a píxeles
    x = round(
        (lon + 180) / 360 * (ancho - 1)
    )

    y = round(
        (90 - lat) / 180 * (alto - 1)
    )

    x = max(0, min(ancho - 1, x))
    y = max(0, min(alto - 1, y))

    # Analizamos una región de 15 x 15 píxeles
    # en lugar de un solo punto.
    radio = 7

    suma_brillo = 0
    brillo_maximo = 0
    cantidad = 0
    pixeles_iluminados = 0

    for dy in range(-radio, radio + 1):
        py = y + dy

        if py < 0 or py >= alto:
            continue

        for dx in range(-radio, radio + 1):
            # La longitud es circular.
            px = (x + dx) % ancho

            r, g, b = imagen.getpixel(
                (px, py)
            )

            valor = luminancia(r, g, b)

            suma_brillo += valor
            brillo_maximo = max(
                brillo_maximo,
                valor
            )

            if valor > 0.08:
                pixeles_iluminados += 1

            cantidad += 1

    brillo_promedio = (
        suma_brillo / cantidad
        if cantidad else 0
    )

    proporcion_iluminada = (
        pixeles_iluminados / cantidad
        if cantidad else 0
    )

    # Umbral provisional artístico.
    # No representa una radiancia calibrada.
    disponible = (
        brillo_promedio > 0.025
        or brillo_maximo > 0.15
    )

    return {
        "fuente": "NASA Black Marble",
        "tipo": "sonificacion_visual",
        "variable": "luces_nocturnas",
        "ubicacion": {
            "latitud": lat,
            "longitud": lon
        },
        "pixel": {
            "x": x,
            "y": y
        },
        "disponible": disponible,
        "caracteristicas": {
            "brillo": round(
                brillo_promedio, 4
            ),
            "brillo_maximo": round(
                brillo_maximo, 4
            ),
            "proporcion_iluminada": round(
                proporcion_iluminada, 4
            ),
            "radio_pixeles": radio
        }
    }
