from django.db import models
from django.utils import timezone

class Usuario(models.Model):
    OPCIONES_ROL = [
        ('ADMIN', 'Administrador (Acceso Total)'),
        ('RECEPCION', 'Recepcionista (Ventas y Registros)'),
        ('ENTRENADOR', 'Entrenador (Clases y Alumnos)'),
        ('CLIENTE', 'Cliente (Perfil y Pagos)'),
    ]

    rut = models.CharField(max_length=12, unique=True)
    nombre = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()
    foto_perfil = models.ImageField(upload_to='fotos_perfil/', null=True, blank=True)
    face_encoding = models.JSONField(null=True, blank=True)
    rol = models.CharField(max_length=20, choices=OPCIONES_ROL, default='CLIENTE')
    password = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} ({self.get_rol_display()})"

class Mensualidad(models.Model):
    OPCIONES_PLAN = [
        ('BASICA', 'Suscripción Básica ($25.000 / mes)'),
        ('VIDA_SANA', 'Suscripción Vida Sana ($30.000 / mes)'),
        ('RENDIMIENTO', 'Suscripción Rendimiento ($40.000 / mes)'),
    ]

    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='mensualidad')
    tipo_plan = models.CharField(max_length=20, choices=OPCIONES_PLAN, default='BASICA')
    activa = models.BooleanField(default=False)
    fecha_vencimiento = models.DateField()

    def acceso_permitido(self):
        return self.activa and self.fecha_vencimiento >= timezone.now().date()


class Asistencia(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='asistencias')
    fecha_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.nombre} ingresó el {self.fecha_hora.strftime('%d/%m/%Y a las %H:%M')}"

class Ejercicio(models.Model):
    nombre = models.CharField(max_length=100)
    grupo_muscular = models.CharField(max_length=50)
    
    def __str__(self):
        return self.nombre

class RutinaCliente(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='rutinas')
    dia_nombre = models.CharField(max_length=50)
    ejercicio = models.ForeignKey(Ejercicio, on_delete=models.CASCADE)
    series = models.IntegerField(default=4)
    repeticiones = models.CharField(max_length=20)
    
    def __str__(self):
        return f"{self.usuario.nombre} - {self.dia_nombre} - {self.ejercicio.nombre}"

class ProgresoRutina(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    rutina_cliente = models.ForeignKey(RutinaCliente, on_delete=models.CASCADE)
    fecha = models.DateField(auto_now_add=True)
    peso_levantado = models.DecimalField(max_digits=5, decimal_places=2, help_text="Peso en KG")
    completado = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.usuario.nombre} - {self.fecha} - {self.peso_levantado}kg"