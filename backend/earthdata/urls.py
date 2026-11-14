from django.urls import path
from . import views


urlpatterns = [
    path('inicio/', views.inicio, name='inicio'),
    path('viento/', views.obtener_viento, name='viento'),
]

