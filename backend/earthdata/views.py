from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from wind_service import consultar_viento

@api_view(['GET'])
def inicio(request):
    return Response({
        "proyecto": "Earth Jukebox",
        "estado": "Funcionando",
        "mensaje": "API de Django conectada correctamente",
        "version": "1.0"
    })

def obtener_viento(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Método no permitido"},
            status=405
        )

    try:
        lat = float(request.GET.get("lat"))
        lon = float(request.GET.get("lon"))

        resultado = consultar_viento(lat, lon)

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