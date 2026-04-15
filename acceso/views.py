import face_recognition
import mercadopago
from rest_framework.decorators import api_view, parser_classes
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from .models import Usuario, Mensualidad, Asistencia, Ejercicio, RutinaCliente, ProgresoRutina, Ejercicio, RutinaCliente
import numpy as np
import base64
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from openai import OpenAI 
from django.conf import settings
import os

sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

def limpiar_rut(rut_sucio):
    if not rut_sucio:
        return rut_sucio
    rut_plano = rut_sucio.replace('.', '').replace('-', '').strip().upper()
    if len(rut_plano) < 2:
        return rut_sucio
    cuerpo = rut_plano[:-1]
    dv = rut_plano[-1]
    return f"{cuerpo}-{dv}"



@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def registrar_usuario(request):
    try:
        rut_crudo = request.data.get('rut')
        rut = limpiar_rut(rut_crudo)
        nombre = request.data.get('nombre')
        fecha_nacimiento = request.data.get('fecha_nacimiento')
        password = request.data.get('password')
        tipo_plan = request.data.get('tipo_plan', 'BASICA')
        foto = request.FILES.get('foto')

        if not foto:
            return Response({'error': 'La foto es obligatoria.'}, status=400)
            
        if Usuario.objects.filter(rut=rut).exists():
            return Response({'error': 'Este RUT ya está registrado.'}, status=400)

        #BIOMETRÍA
        imagen_cargada = face_recognition.load_image_file(foto)
        encodings = face_recognition.face_encodings(imagen_cargada)
        if len(encodings) == 0:
            return Response({'error': 'No se detectó ningún rostro.'}, status=400)
        face_encoding_str = json.dumps(encodings[0].tolist())

        foto.seek(0)
        #DICCIONARIO DE PRECIOS
        precios_planes = {
            'BASICA': 25000,
            'VIDA_SANA': 30000,
            'RENDIMIENTO': 40000
        }
        precio_a_cobrar = precios_planes.get(tipo_plan, 25000)
        usuario = Usuario.objects.create(
            rut=rut,
            nombre=nombre,
            fecha_nacimiento=fecha_nacimiento,
            password=make_password(password),
            rol='CLIENTE',
            foto_perfil=foto,
            face_encoding=face_encoding_str
        )

        try:
            print("🕵️‍♂️ RUTA DE LA FOTO GUARDADA:", usuario.foto_perfil.url)
        except Exception as e:
            print("⚠️ ERROR AL LEER LA URL DE LA FOTO:", e)

        # esta inactivo hasta q pague
        fecha_venc = timezone.now().date() + timedelta(days=30)
        Mensualidad.objects.create(
            usuario=usuario,
            tipo_plan=tipo_plan,
            activa=False,
            fecha_vencimiento=fecha_venc
        )

        preference_data = {
            "items": [
                {
                    "title": f"Suscripción SKILL - Plan {tipo_plan}",
                    "quantity": 1,
                    "currency_id": "CLP",
                    "unit_price": int(precio_a_cobrar)
                }
            ],
            "payer": {
                "name": nombre,
            },
            "external_reference": rut,
            "back_urls": {
                "success": "http://localhost:5173/login", 
                "failure": "http://localhost:5173/registro",
                "pending": "http://localhost:5173/registro"
            },
            "notification_url" : "https://implicit-praising-fineness.ngrok-free.dev/api/acceso/webhook/mercadopago/"
        }

        preference_response = sdk.preference().create(preference_data)
        
        if preference_response["status"] == 201:
            preference = preference_response["response"]
            
            return Response({
                'mensaje': 'Biometría guardada. Abriendo pasarela de pago...',
                'url_pago': preference['init_point'] 
            }, status=201)
        
        else:
            print("❌ ERROR DE MERCADO PAGO:", preference_response)
            usuario.delete()      
            return Response({
                'error': 'Hubo un problema al generar el cobro con Mercado Pago. Revisa la terminal de Django.'
            }, status=400)
    
    

    except Exception as e:
        return Response({'error': str(e)}, status=500)
    

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def verificar_acceso(request):
    foto = request.FILES.get('foto')

    if not foto:
        return Response({'error': 'No se envió ninguna foto desde la cámara.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Analiza el rostro de la persona que esta frente a la cámara
        imagen_cargada = face_recognition.load_image_file(foto)
        encodings_camara = face_recognition.face_encodings(imagen_cargada)

        if len(encodings_camara) == 0:
            return Response({'acceso': False, 'mensaje': 'Acércate a la cámara. No detecto un rostro.'}, status=status.HTTP_200_OK)
        
        # Tomamos el vector del rostro detectado
        rostro_desconocido = encodings_camara[0]

        #Obtiene todos los usuarios registrados de la BBDD
        usuarios = Usuario.objects.exclude(face_encoding__isnull=True)

        if not usuarios.exists():
            return Response({'acceso': False, 'mensaje': 'Base de datos vacía.'}, status=status.HTTP_200_OK)
        # Desempaquetamos el texto para convertirlo de vuelta en números reales
        vectores_conocidos = []
        usuarios_validos = [] # Guardamos solo a los usuarios que tengan la cara bien guardada

        for u in usuarios:
            try:
                # Convierte el string guardado a una lista y luego a vector matemático
                vector_real = json.loads(u.face_encoding)
                vectores_conocidos.append(np.array(vector_real))
                usuarios_validos.append(u)
            except Exception as e:
                # Si algún registro antiguo falla, lo ignoramos para no romper el sistema
                print(f"⚠️ Saltando biometría corrupta del usuario {u.rut}")
                continue

        # Si nadie tenía un formato válido
        if len(vectores_conocidos) == 0:
            return Response({'acceso': False, 'mensaje': 'No hay biometrías válidas en la base de datos.'}, status=status.HTTP_200_OK)

        # Compara la cara de la puerta contra toda la BBDD
        coincidencias = face_recognition.compare_faces(vectores_conocidos, rostro_desconocido, tolerance=0.5)

        if True in coincidencias:
            # Encontramos a quién pertenece la cara usando nuestra lista filtrada
            indice_match = coincidencias.index(True)
            usuario_reconocido = usuarios_validos[indice_match]

            #Verificamos si pagó la mensualidad
            mensualidad = usuario_reconocido.mensualidad
            if mensualidad.acceso_permitido():
                # ¡Registramos la asistencia en la base de datos!
                Asistencia.objects.create(usuario=usuario_reconocido)
                return Response({
                    'acceso': True, 
                    'mensaje': f'¡Bienvenido, {usuario_reconocido.nombre}!'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'acceso': False, 
                    'mensaje': 'Mensualidad no pagada o vencida.'
                }, status=status.HTTP_200_OK)
        else:
            return Response({
                'acceso': False, 
                'mensaje': 'Usuario no registrado.'
            }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error en el escáner: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
def login_usuario(request):
    rut_crudo = request.data.get('rut')
    rut = limpiar_rut(rut_crudo)
    password_ingresada = request.data.get('password')

    try:
        #Busca al usuario por su RUT
        usuario = Usuario.objects.get(rut=rut)
        
        if not usuario.password:
            return Response({
                'exito': False, 
                'error': 'Usuario no tiene contraseña. Por favor, solicite a recepción crear una.'
            }, status=status.HTTP_400_BAD_REQUEST)

        #Compara la contraseña encriptada
        if check_password(password_ingresada, usuario.password):
            return Response({
                'exito': True,
                'mensaje': f'Bienvenido al portal, {usuario.nombre}',
                'datos': {
                    'nombre': usuario.nombre,
                    'rut': usuario.rut,
                    'rol': usuario.rol
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'exito': False, 
                'error': 'Contraseña incorrecta'
            }, status=status.HTTP_401_UNAUTHORIZED)

    except Usuario.DoesNotExist:
        return Response({
            'exito': False, 
            'error': 'El RUT ingresado no existe en el sistema'
        }, status=status.HTTP_404_NOT_FOUND)
    


@api_view(['GET'])
def stats_admin(request):
    hoy = timezone.now().date()
    dias_historial = int(request.GET.get('dias', 7))
    
    total_alumnos = Usuario.objects.filter(rol='CLIENTE').count()
    activos = Mensualidad.objects.filter(fecha_vencimiento__gte=hoy).count()
    asistencias_hoy = Asistencia.objects.filter(fecha_hora__date=hoy).count()

    ultimos_ingresos = Asistencia.objects.select_related('usuario').order_by('-fecha_hora')[:6]
    historial = []
    for a in ultimos_ingresos:
        nombre_corto = " ".join(a.usuario.nombre.split()[:2])
        historial.append({
            'nombre': nombre_corto, 
            'fecha': a.fecha_hora.strftime('%d/%m'),
            'hora': a.fecha_hora.strftime('%H:%M')
        })

    # Gráfico Dinámico ssegun los días pedidos
    grafico_trafico = []
    dias_semana = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']
    
    for i in range(dias_historial - 1, -1, -1):
        fecha_evaluar = hoy - timedelta(days=i)
        cantidad_asistencias = Asistencia.objects.filter(fecha_hora__date=fecha_evaluar).count()
        
        grafico_trafico.append({
            'dia': dias_semana[fecha_evaluar.weekday()],
            'fecha': fecha_evaluar.strftime('%d/%m'),
            'total': cantidad_asistencias
        })

    return Response({
        'total_alumnos': total_alumnos,
        'alumnos_activos': activos,
        'asistencias_hoy': asistencias_hoy,
        'historial': historial,
        'grafico': grafico_trafico
    })

@api_view(['GET'])
def stats_cliente(request, rut):
    try:
        usuario = Usuario.objects.get(rut=rut)
        mensualidad = usuario.mensualidad
        dias_restantes = (mensualidad.fecha_vencimiento - timezone.now().date()).days
        
        asistencias_mes = Asistencia.objects.filter(
            usuario=usuario, 
            fecha_hora__month=timezone.now().month
        ).count()

        # LEE EL FILTRO DESDE REACT
        dias_historial = int(request.GET.get('dias', 7))
        
        hoy = timezone.now().date()
        datos_grafico = []
        
        for i in range(dias_historial - 1, -1, -1): 
            fecha_evaluar = hoy - timedelta(days=i)
            vino = Asistencia.objects.filter(usuario=usuario, fecha_hora__date=fecha_evaluar).exists()
            
            datos_grafico.append({
                'fecha': fecha_evaluar.strftime('%d/%m'),
                'asistio': 1 if vino else 0
            })

        return Response({
            'estado': 'Al Día' if mensualidad.acceso_permitido() else 'Vencido',
            'vence': mensualidad.fecha_vencimiento.strftime('%d/%m/%Y'),
            'dias_pago': max(0, dias_restantes),
            'asistencias_mes': asistencias_mes,
            'grafico': datos_grafico 
        })
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    

#Configuracion de grok
cliente_ia = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

@api_view(['POST'])
def analizar_comida(request):
    if 'imagen' not in request.FILES:
        return Response({'error': 'No se envió ninguna imagen. Abortando protocolo.'}, status=400)

    imagen_archivo = request.FILES['imagen']
    
    try:
        #imageen a texto basse64
        imagen_bytes = imagen_archivo.read()
        imagen_base64 = base64.b64encode(imagen_bytes).decode('utf-8')
        
        # Obtiene el tipo de imagen
        tipo_mime = getattr(imagen_archivo, 'content_type', 'image/jpeg')

        prompt = """
        Eres la IA nutricional de un centro de alto rendimiento llamado SKILL. Analiza la imagen.
        Estima las calorías y los macronutrientes de la porción mostrada.
        Devuelve SOLO un objeto JSON válido, sin texto adicional.
        Estructura estricta:
        {
          "comida": "Nombre del platillo",
          "calorias": 0,
          "macros": {
            "proteinas": "0g",
            "carbos": "0g",
            "grasas": "0g"
          },
          "comentario": "Tu análisis experto, muy breve y técnico."
        }
        Si no es comida, calorias: 0 y coméntalo. SIN SALUDOS, SOLO EL JSON.
        """
        respuesta_ia = cliente_ia.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{tipo_mime};base64,{imagen_base64}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.2
        )
        
        #Extrae y limpia la respuesta
        texto_respuesta = respuesta_ia.choices[0].message.content
        texto_limpio = texto_respuesta.replace('```json', '').replace('```', '').strip()
        
        datos_json = json.loads(texto_limpio)
        return Response(datos_json)

    except Exception as e:
        print("Error en IA (Groq):", str(e))
        return Response({'error': 'Interferencia en la red neuronal Groq. Intenta de nuevo.'}, status=500)

@api_view(['GET', 'POST'])
def mi_rutina(request, rut):
    try:
        usuario = Usuario.objects.get(rut=rut)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)

    #pide la rutina
    if request.method == 'GET':
        rutinas_db = RutinaCliente.objects.filter(usuario=usuario)
        hoy = timezone.now().date()
        
        datos_rutina = []
        for r in rutinas_db:
            # Revisa si el alumno ya guardó progreso hoy para este ejercicio
            progreso_hoy = ProgresoRutina.objects.filter(rutina_cliente=r, fecha=hoy).first()
            
            datos_rutina.append({
                'id': r.id,
                'dia_nombre': r.dia_nombre,
                'ejercicio': r.ejercicio.nombre,
                'grupo_muscular': r.ejercicio.grupo_muscular,
                'series': r.series,
                'repeticiones': r.repeticiones,
                'completado_hoy': True if progreso_hoy else False,
                'peso_hoy': progreso_hoy.peso_levantado if progreso_hoy else ""
            })
            
        return Response({'rutina': datos_rutina})

    #se envia el peso levantado
    elif request.method == 'POST':
        rutina_id = request.data.get('rutina_id')
        peso = request.data.get('peso')

        try:
            rutina_asignada = RutinaCliente.objects.get(id=rutina_id, usuario=usuario)
            hoy = timezone.now().date()
            
            # Guarda o actualiza el peso levantado hoy
            ProgresoRutina.objects.update_or_create(
                usuario=usuario,
                rutina_cliente=rutina_asignada,
                fecha=hoy,
                defaults={'peso_levantado': peso, 'completado': True}
            )
            return Response({'status': 'ok', 'mensaje': 'Entrenamiento registrado con éxito'})
            
        except RutinaCliente.DoesNotExist:
            return Response({'error': 'Este ejercicio no pertenece a tu rutina'}, status=403)


@api_view(['GET'])
def lista_alumnos(request):
    # Busca solo a los usuarios que son CLIENTES
    alumnos_db = Usuario.objects.filter(rol='CLIENTE').order_by('nombre')
    
    datos_alumnos = []
    for alumno in alumnos_db:
        #obtiene su mensualidad
        try:
            mensualidad = alumno.mensualidad
            estado = 'Al Día' if mensualidad.acceso_permitido() else 'Vencido'
            vence = mensualidad.fecha_vencimiento.strftime('%d/%m/%Y')

            nombre_plan = mensualidad.tipo_plan
        except:
            estado = 'Sin Mensualidad'
            vence = 'No registra'
            nombre_plan = 'Sin Plan'
            
        #asistencia total
        asistencias_totales = Asistencia.objects.filter(usuario=alumno).count()
        
        datos_alumnos.append({
            'rut': alumno.rut,
            'nombre': alumno.nombre,
            'estado': estado,
            'vence': vence,
            'asistencias': asistencias_totales,
            'plan': nombre_plan
        })
        
    return Response(datos_alumnos)

@api_view(['GET'])
def detalle_alumno_admin(request, rut):
    try:
        alumno = Usuario.objects.get(rut=rut)
        mensualidad = alumno.mensualidad
        
        # el mapa de calor de 60 días para este alumno específico
        hoy = timezone.now().date()
        grafico_individual = []
        for i in range(59, -1, -1):
            fecha_evaluar = hoy - timedelta(days=i)
            vino = Asistencia.objects.filter(usuario=alumno, fecha_hora__date=fecha_evaluar).exists()
            grafico_individual.append({
                'fecha': fecha_evaluar.strftime('%d/%m'),
                'asistio': 1 if vino else 0
            })

        #Obtien su rutina de hoy (si tiene)
        rutina_hoy = RutinaCliente.objects.filter(usuario=alumno)
        lista_ejercicios = [r.ejercicio.nombre for r in rutina_hoy]

        return Response({
            'rut': alumno.rut,
            'nombre': alumno.nombre,
            'vencimiento': mensualidad.fecha_vencimiento.strftime('%d/%m/%Y'),
            'dias_restantes': (mensualidad.fecha_vencimiento - hoy).days,
            'grafico': grafico_individual,
            'resumen_rutina': lista_ejercicios
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def renovar_mensualidad(request, rut):
    try:
        alumno = Usuario.objects.get(rut=rut)
        mensualidad = alumno.mensualidad
        
        # Si ya está vencida, renovamos desde hoy. Si no, sumamos 30 días al vencimiento actual.
        hoy = timezone.now().date()
        base_fecha = max(mensualidad.fecha_vencimiento, hoy)
        mensualidad.fecha_vencimiento = base_fecha + timedelta(days=30)
        mensualidad.activa = True
        mensualidad.save()
        
        return Response({'status': 'ok', 'nuevo_vencimiento': mensualidad.fecha_vencimiento.strftime('%d/%m/%Y')})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    



@api_view(['GET', 'POST'])
def gestion_ejercicios(request):
    if request.method == 'GET':
        # Deveulvee todos los ejercicios ordenados por músculo
        ejercicios = Ejercicio.objects.all().order_by('grupo_muscular', 'nombre')
        data = [{'id': e.id, 'nombre': e.nombre, 'grupo_muscular': e.grupo_muscular} for e in ejercicios]
        return Response(data)
        
    elif request.method == 'POST':
        nombre = request.data.get('nombre')
        grupo = request.data.get('grupo_muscular')
        
        if nombre and grupo:
            nuevo = Ejercicio.objects.create(nombre=nombre, grupo_muscular=grupo)
            return Response({'status': 'ok', 'id': nuevo.id, 'nombre': nuevo.nombre, 'grupo_muscular': nuevo.grupo_muscular})
        return Response({'error': 'Faltan datos'}, status=400)

@api_view(['GET', 'POST'])
def constructor_rutinas(request, rut):
    try:
        alumno = Usuario.objects.get(rut=rut, rol='CLIENTE')
        
        if request.method == 'GET':
            # Leer la rutina actual del alumno
            rutinas = RutinaCliente.objects.filter(usuario=alumno).order_by('dia_nombre')
            data = [{
                'id': r.id,
                'dia_nombre': r.dia_nombre,
                'ejercicio_id': r.ejercicio.id,
                'ejercicio_nombre': r.ejercicio.nombre,
                'series': r.series,
                'repeticiones': r.repeticiones
            } for r in rutinas]
            return Response(data)
            
        elif request.method == 'POST':
            RutinaCliente.objects.filter(usuario=alumno).delete()
            
            nuevas_rutinas = request.data.get('rutinas', [])
            for r in nuevas_rutinas:
                ejercicio = Ejercicio.objects.get(id=r['ejercicio_id'])
                RutinaCliente.objects.create(
                    usuario=alumno,
                    dia_nombre=r['dia_nombre'],
                    ejercicio=ejercicio,
                    series=r['series'],
                    repeticiones=r['repeticiones']
                )
            return Response({'status': 'ok', 'mensaje': 'Rutina actualizada correctamente'})
            
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['POST'])
def webhook_mercadopago(request):
    try:
        topic = request.GET.get('topic') or request.data.get('type')
        if topic == 'payment':
            # Saca el ID del pago
            payment_id = request.GET.get('data.id') or request.data.get('data', {}).get('id')
            if payment_id:
                #le preegunta a Mercado Pago los detalles reales de este pago
                payment_info = sdk.payment().get(payment_id)
                payment = payment_info["response"]
                #Verifica si el pago fue apro
                if payment.get("status") == "approved":
                    #Recupera el rut
                    rut_cliente = payment.get("external_reference")
                    # activa su meensualidad
                    try:
                        mensualidad = Mensualidad.objects.get(usuario__rut=rut_cliente)
                        mensualidad.activa = True
                        mensualidad.save()
                        print(f"Pago recibido. Cuenta activada para el RUT: {rut_cliente}")
                    except Mensualidad.DoesNotExist:
                        print(f"Pagó el RUT {rut_cliente} pero no existe en la BD.")
        return Response({'status': 'ok'}, status=200)

    except Exception as e:
        print("❌ ERROR EN WEBHOOK:", str(e))
        return Response({'error': str(e)}, status=200)