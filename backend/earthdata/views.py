
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse

from ocean_image_service import consultar_oceano_visual
from wind_image_service import consultar_viento_visual
from lights_image_service import consultar_luces_nocturnas


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
