from django.urls import path
from .views import (
    registrar_usuario, 
    verificar_acceso, 
    login_usuario, 
    stats_admin, 
    stats_cliente, 
    analizar_comida,
    mi_rutina,
    lista_alumnos,
    detalle_alumno_admin,
    renovar_mensualidad,
    gestion_ejercicios,
    constructor_rutinas,
    webhook_mercadopago
)

urlpatterns = [
    path('registrar/', registrar_usuario, name='registrar'),
    path('verificar/', verificar_acceso, name='verificar'),
    path('login/', login_usuario, name='login'),
    path('stats/admin/', stats_admin, name='stats_admin'),
    path('stats/cliente/<str:rut>/', stats_cliente, name='stats_cliente'),
    path('analizar-comida/', analizar_comida, name='analizar_comida'), 
    path('rutina/<str:rut>/', mi_rutina, name='mi_rutina'),
    path('alumnos/', lista_alumnos, name='lista_alumnos'),
    path('alumnos/detalle/<str:rut>/', detalle_alumno_admin),
    path('alumnos/renovar/<str:rut>/', renovar_mensualidad),
    path('ejercicios/', gestion_ejercicios, name='gestion_ejercicios'),
    path('rutinas/constructor/<str:rut>/', constructor_rutinas, name='constructor_rutinas'),
    path('webhook/mercadopago/', webhook_mercadopago, name='webhook_mercadopago'),
]