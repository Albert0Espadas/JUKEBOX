
from pathlib import Path
from functools import lru_cache
from PIL import Image

RUTA = (
    Path(__file__).resolve().parent
    / "data"
    / "vegetation"
    / "vegetacion.png"
)


@lru_cache(maxsize=1)
def cargar_imagen():
    if not RUTA.exists():
        raise FileNotFoundError(
            f"No se encontró la imagen: {RUTA}"
        )

    with Image.open(RUTA) as imagen:
        return imagen.convert("RGB").copy()


def consultar_vegetacion_visual(lat, lon):
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError("Coordenadas fuera de rango")

    imagen = cargar_imagen()
    ancho, alto = imagen.size

    x = min(
        ancho - 1,
        max(0, int((lon + 180) / 360 * ancho))
    )

    y = min(
        alto - 1,
        max(0, int((90 - lat) / 180 * alto))
    )

    radio = 4
    valores = []

    for py in range(max(0, y-radio), min(alto, y+radio+1)):
        for px in range(max(0, x-radio), min(ancho, x+radio+1)):
            r, g, b = imagen.getpixel((px, py))

            # Aproximación visual:
            # identificar tonos verdes de la imagen NDVI.
            if (
                g > r * 1.08
                and g > b * 0.90
                and g > 35
            ):
                verdor = max(
                    0,
                    min(1, (g-r) / max(g, 1) * 2.5)
                )
                valores.append(verdor)

    # Proporción aproximada de píxeles verdes.
    total = (min(alto, y+radio+1) - max(0, y-radio)) * (
        min(ancho, x+radio+1) - max(0, x-radio)
    )

    cobertura = len(valores) / total if total else 0

    verdor_medio = (
        sum(valores) / len(valores)
        if valores else 0
    )

    nivel = round(
        min(1, cobertura * 0.5 + verdor_medio * 0.5)
        if valores else 0,
        4
    )

    if nivel >= 0.65:
        categoria = "vegetacion_abundante"
    elif nivel >= 0.3:
        categoria = "vegetacion_moderada"
    elif valores:
        categoria = "vegetacion_escasa"
    else:
        categoria = "sin_vegetacion_verde_detectada"

    return {
        "fuente": "NASA SVS - VIIRS NDVI",
        "fecha_imagen": "2024-01-01",
        "tipo": "sonificacion_visual",
        "variable": "vegetacion",
        "ubicacion": {
            "latitud": lat,
            "longitud": lon
        },
        "disponible": bool(valores),
        "clasificacion": {
            "categoria": categoria,
            "nivel": nivel
        },
        "caracteristicas": {
            "cobertura_verde": round(cobertura, 4),
            "verdor_visual": round(verdor_medio, 4)
        }
    }
