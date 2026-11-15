
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse

from ocean_image_service import consultar_oceano_visual
from wind_image_service import consultar_viento_visual
from lights_image_service import consultar_luces_nocturnas
from rain_image_service import consultar_lluvia_visual
from vegetation_image_service import consultar_vegetacion_visual


@api_view(['GET'])
def inicio(request):
    return Response({
        "proyecto": "Earth Jukebox",
        "estado": "Funcionando",
        "version": "1.0"
    })


def obtener_oceano_visual(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Método no permitido"},
            status=405
        )

    try:
        lat = float(request.GET.get("lat"))
        lon = float(request.GET.get("lon"))

        resultado = consultar_oceano_visual(lat, lon)
        return JsonResponse(resultado)

    except (TypeError, ValueError) as error:
        return JsonResponse(
            {"error": str(error)},
            status=400
        )

    except FileNotFoundError as error:
        return JsonResponse(
            {"error": str(error)},
            status=404
        )



def obtener_viento_visual(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Método no permitido"},
            status=405
        )

    try:
        lat = float(request.GET.get("lat"))
        lon = float(request.GET.get("lon"))

        resultado = consultar_viento_visual(lat, lon)

        return JsonResponse(resultado)

    except (TypeError, ValueError) as error:
        return JsonResponse(
            {"error": str(error)},
            status=400
        )

    except FileNotFoundError as error:
        return JsonResponse(
            {"error": str(error)},
            status=404
        )


def obtener_luces_nocturnas(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Método no permitido"},
            status=405
        )

    try:
        lat = float(request.GET.get("lat"))
        lon = float(request.GET.get("lon"))

        resultado = consultar_luces_nocturnas(
            lat, lon
        )

        return JsonResponse(resultado)

    except (TypeError, ValueError) as error:
        return JsonResponse(
            {"error": str(error)},
            status=400
        )

    except FileNotFoundError as error:
        return JsonResponse(
            {"error": str(error)},
            status=404
        )


def obtener_lluvia_visual(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Método no permitido"},
            status=405
        )

    try:
        lat = float(request.GET.get("lat"))
        lon = float(request.GET.get("lon"))

        return JsonResponse(
            consultar_lluvia_visual(lat, lon)
        )

    except (TypeError, ValueError) as error:
        return JsonResponse({"error": str(error)}, status=400)

    except FileNotFoundError as error:
        return JsonResponse({"error": str(error)}, status=404)

def obtener_vegetacion_visual(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Método no permitido"},
            status=405
        )

    try:
        lat = float(request.GET.get("lat"))
        lon = float(request.GET.get("lon"))

        return JsonResponse(
            consultar_vegetacion_visual(lat, lon)
        )

    except (TypeError, ValueError) as error:
        return JsonResponse(
            {"error": str(error)},
            status=400
        )

    except FileNotFoundError as error:
        return JsonResponse(
            {"error": str(error)},
            status=404
        )        