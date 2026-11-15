from django.urls import path
from . import views

urlpatterns = [
    path(
        'inicio/',
        views.inicio,
        name='inicio'
    ),

    path(
        'oceano-visual/',
        views.obtener_oceano_visual,
        name='oceano_visual'
    ),

    path(
        'viento-visual/',
        views.obtener_viento_visual,
        name='viento_visual'
    ),

    path(
        'luces-nocturnas/',
        views.obtener_luces_nocturnas,
        name='luces_nocturnas'
    ),

    path(
    "lluvia-visual/",
    views.obtener_lluvia_visual,
    name="lluvia-visual"
    ),

    path(
    "vegetacion-visual/",
    views.obtener_vegetacion_visual,
    name="vegetacion-visual"
    ),    
]