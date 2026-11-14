
from pathlib import Path
import xarray as xr

# Ubicación del archivo descargado
carpeta = Path(__file__).resolve().parent / "data" / "wind"

archivos = list(carpeta.glob("*.nc4"))

if not archivos:
    raise FileNotFoundError("No se encontró ningún archivo .nc4")

archivo = archivos[0]

print("🌎 Leyendo datos NASA...")
print("Archivo:", archivo.name)

with xr.open_dataset(archivo) as ds:
    print("\nVARIABLES DISPONIBLES:")
    print(list(ds.data_vars))

    print("\nDIMENSIONES:")
    print(ds.sizes)

    if "U10M" in ds and "V10M" in ds:
        print("\n🌬️ ¡Tenemos datos de viento!")

        # Mérida, Yucatán
        punto = ds.sel(
            lat=20.9674,
            lon=-89.6237,
            method="nearest"
        )

        u = float(punto["U10M"].isel(time=0).values)
        v = float(punto["V10M"].isel(time=0).values)

        velocidad = (u**2 + v**2)**0.5

        print(f"Viento U: {u:.2f} m/s")
        print(f"Viento V: {v:.2f} m/s")
        print(f"Velocidad: {velocidad:.2f} m/s")
    else:
        print("No se encontraron U10M y V10M.")
