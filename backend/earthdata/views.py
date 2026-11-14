from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def inicio(request):
    return Response({
        "proyecto": "Earth Jukebox",
        "estado": "Funcionando",
        "mensaje": "API de Django conectada correctamente",
        "version": "1.0"
    })
