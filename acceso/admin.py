from django.contrib import admin
from .models import Usuario, Mensualidad, Asistencia, Ejercicio, RutinaCliente, ProgresoRutina 


class RutinaClienteInline(admin.TabularInline):
    model = RutinaCliente
    extra = 5 

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rut', 'fecha_nacimiento', 'rol')
    search_fields = ('nombre', 'rut')
    list_filter = ('rol',)
    inlines = [RutinaClienteInline]

@admin.register(Mensualidad)
class MensualidadAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'activa', 'fecha_vencimiento', 'acceso_permitido')
    list_filter = ('activa',)

@admin.register(Asistencia)
class AsistenciaAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'fecha_hora')
    list_filter = ('fecha_hora', 'usuario')

@admin.register(Ejercicio)
class EjercicioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'grupo_muscular')
    search_fields = ('nombre', 'grupo_muscular')
    list_filter = ('grupo_muscular',)


@admin.register(RutinaCliente)
class RutinaClienteAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'dia_nombre', 'ejercicio', 'series', 'repeticiones')
    search_fields = ('usuario__nombre', 'dia_nombre', 'ejercicio__nombre')
    list_filter = ('usuario', 'dia_nombre')

@admin.register(ProgresoRutina)
class ProgresoRutinaAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'fecha', 'rutina_cliente', 'peso_levantado', 'completado')
    list_filter = ('fecha', 'usuario', 'completado')