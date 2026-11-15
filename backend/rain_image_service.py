
from pathlib import Path
from functools import lru_cache
from PIL import Image

RUTA_IMAGEN = (
    Path(__file__).resolve().parent
    / "data"
    / "rain"
    / "lluvia.png"
)


@lru_cache(maxsize=1)
def cargar_imagen():
    if not RUTA_IMAGEN.exists():
        raise FileNotFoundError(
            f"No se encontró la imagen NASA: {RUTA_IMAGEN}"
        )

    with Image.open(RUTA_IMAGEN) as imagen:
        return imagen.convert("RGBA").copy()


def consultar_lluvia_visual(lat, lon):
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError("Coordenadas fuera de rango")

    imagen = cargar_imagen()
    ancho, alto = imagen.size

    x = min(ancho - 1, int((lon + 180) / 360 * ancho))
    y = min(alto - 1, int((90 - lat) / 180 * alto))

    radio = 7
    puntos = 0
    lluvia = 0
    intensidad_acumulada = 0

    for py in range(max(0, y-radio), min(alto, y+radio+1)):
        for px in range(max(0, x-radio), min(ancho, x+radio+1)):
            r, g, b, a = imagen.getpixel((px, py))
            puntos += 1

            # Ignorar zonas transparentes u oscuras.
            if a < 30 or max(r, g, b) < 25:
                continue

            lluvia += 1

            # Índice musical aproximado basado en color.
            brillo = max(r, g, b) / 255
            intensidad_acumulada += brillo * (a / 255)

    cobertura = lluvia / puntos if puntos else 0
    intensidad = (
        intensidad_acumulada / lluvia if lluvia else 0
    )

    nivel = round(
        min(1, cobertura * 0.65 + intensidad * 0.35)
        if lluvia else 0,
        4
    )

    return {
        "fuente": "NASA GPM IMERG",
        "tipo": "sonificacion_visual",
        "variable": "precipitacion",
        "ubicacion": {
            "latitud": lat,
            "longitud": lon
        },
        "disponible": lluvia > 0,
        "caracteristicas": {
            "nivel": nivel,
            "cobertura_visual": round(cobertura, 4),
            "intensidad_color": round(intensidad, 4)
        }
    }
