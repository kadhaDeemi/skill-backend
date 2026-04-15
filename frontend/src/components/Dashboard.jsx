import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, Calendar, CreditCard, Activity, Camera, BarChart2, Zap, X, UserCircle, RefreshCw, Dumbbell, Plus, Trash2, Save, BookOpen, Menu, Aperture, UserPlus } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [usuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem('usuarioSkill');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });
  
  const [stats, setStats] = useState(null);
  const [rangoDias, setRangoDias] = useState(7); 
  const [vistaActiva, setVistaActiva] = useState('inicio'); 
  const [listaAlumnos, setListaAlumnos] = useState([]); 
  const [busqueda, setBusqueda] = useState(''); 

  // ESTADOS DEL PANEL LATERAL
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [renovando, setRenovando] = useState(false);

  // direccion tecnica
  const [ejercicios, setEjercicios] = useState([]);
  const [nuevoEjer, setNuevoEjer] = useState({ nombre: '', grupo_muscular: '' });
  const [builderAlumnoRut, setBuilderAlumnoRut] = useState('');
  const [rutinaBuilder, setRutinaBuilder] = useState([]); 
  const [nuevoDiaNombre, setNuevoDiaNombre] = useState('');
  const [guardandoRutina, setGuardandoRutina] = useState(false);

//hamburguesa
const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        let url = usuario.rol === 'ADMIN' 
          ? `http://127.0.0.1:8000/api/acceso/stats/admin/?dias=${rangoDias}` 
          : `http://127.0.0.1:8000/api/acceso/stats/cliente/${usuario.rut}/?dias=${rangoDias}`;
        
        const res = await axios.get(url);
        setStats(res.data);
      } catch (err) {
        console.error("Error cargando estadísticas", err);
      }
    };

    cargarDatos();
  }, [navigate, usuario, rangoDias]);

  const handleLogout = () => {
    localStorage.removeItem('usuarioSkill');
    navigate('/login');
  };

  const maxAsistenciasAdmin = stats?.grafico ? Math.max(...stats.grafico.map(d => d.total), 1) : 1;

  // cargar datos
  const cargarAlumnos = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/acceso/alumnos/');
      setListaAlumnos(res.data);
      setVistaActiva('alumnos'); 
    } catch (err) {
      console.error("Error cargando alumnos", err);
    }
  };

  const cargarDireccionTecnica = async () => {
    try {
      //carga alumnos
      const resAlumnos = await axios.get('http://127.0.0.1:8000/api/acceso/alumnos/');
      setListaAlumnos(resAlumnos.data);
      
      const resEjercicios = await axios.get('http://127.0.0.1:8000/api/acceso/ejercicios/');
      setEjercicios(resEjercicios.data);
      
      setVistaActiva('direccion_tecnica');
    } catch (err) {
      console.error("Error cargando dirección técnica", err);
    }
  };

  //funcion panel lateral
  const abrirPerfil = async (rut) => {
    setPanelAbierto(true);
    setCargandoPerfil(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/acceso/alumnos/detalle/${rut}/`);
      setAlumnoSeleccionado(res.data);
    } catch (err) {
      console.error("Error cargando perfil", err);
      setPanelAbierto(false);
    } finally {
      setCargandoPerfil(false);
    }
  };

  const cerrarPerfil = () => {
    setPanelAbierto(false);
    setTimeout(() => setAlumnoSeleccionado(null), 300); 
  };

  const renovarMensualidad = async () => {
    if (!alumnoSeleccionado) return;
    setRenovando(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/acceso/alumnos/renovar/${alumnoSeleccionado.rut}/`);
      setAlumnoSeleccionado(prev => ({
        ...prev,
        vencimiento: res.data.nuevo_vencimiento,
        dias_restantes: prev.dias_restantes > 0 ? prev.dias_restantes + 30 : 30
      }));
      cargarAlumnos();
    } catch (err) {
      console.error("Error renovando", err);
    } finally {
      setRenovando(false);
    }
  };

  // funcion direccion tecnica
  const crearEjercicio = async (e) => {
    e.preventDefault();
    if (!nuevoEjer.nombre || !nuevoEjer.grupo_muscular) return;
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/acceso/ejercicios/', nuevoEjer);
      setEjercicios([...ejercicios, res.data]);
      setNuevoEjer({ nombre: '', grupo_muscular: '' });
    } catch (err) {
      console.error("Error creando ejercicio", err);
    }
  };

  const cargarRutinaAlumno = async (rut) => {
    setBuilderAlumnoRut(rut);
    if (!rut) {
      setRutinaBuilder([]);
      return;
    }
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/acceso/rutinas/constructor/${rut}/`);
      // Agrupa la rutina por "dia_nombre" para la UI de columnas
      const grouped = [];
      res.data.forEach(item => {
        let day = grouped.find(d => d.dia === item.dia_nombre);
        if(!day) {
          day = { dia: item.dia_nombre, ejercicios: [] };
          grouped.push(day);
        }
        day.ejercicios.push({
          ej_id: item.ejercicio_id,
          series: item.series,
          reps: item.repeticiones,
          id_temp: Math.random().toString() // ID temporal para React key
        });
      });
      setRutinaBuilder(grouped);
    } catch (err) {
      console.error("Error cargando rutina", err);
    }
  };

  const agregarDiaBuilder = () => {
    if(!nuevoDiaNombre.trim()) return;
    setRutinaBuilder([...rutinaBuilder, { dia: nuevoDiaNombre.trim(), ejercicios: [] }]);
    setNuevoDiaNombre('');
  };

  const eliminarDiaBuilder = (dayIndex) => {
    if(window.confirm("¿Seguro que deseas eliminar este día completo?")) {
      const nuevo = [...rutinaBuilder];
      nuevo.splice(dayIndex, 1);
      setRutinaBuilder(nuevo);
    }
  };

  const agregarEjercicioAlDia = (dayIndex) => {
    const nuevo = [...rutinaBuilder];
    nuevo[dayIndex].ejercicios.push({ ej_id: '', series: '', reps: '', id_temp: Math.random().toString() });
    setRutinaBuilder(nuevo);
  };

  const eliminarEjercicioDelDia = (dayIndex, ejIndex) => {
    const nuevo = [...rutinaBuilder];
    nuevo[dayIndex].ejercicios.splice(ejIndex, 1);
    setRutinaBuilder(nuevo);
  };

  const actualizarEjercicioBuilder = (dayIndex, ejIndex, field, value) => {
    const nuevo = [...rutinaBuilder];
    nuevo[dayIndex].ejercicios[ejIndex][field] = value;
    setRutinaBuilder(nuevo);
  };

  const limpiarTodaLaRutina = () => {
    if(window.confirm("¿Estás seguro de vaciar toda la mesa de trabajo?")) {
      setRutinaBuilder([]);
    }
  }

  const guardarRutinaDesplegada = async () => {
    if (!builderAlumnoRut) {
      alert("Selecciona un alumno primero.");
      return;
    }
    setGuardandoRutina(true);
    try {
      // aplana el arreglo
      const flatRutina = [];
      rutinaBuilder.forEach(d => {
        d.ejercicios.forEach(e => {
          if (e.ej_id && e.series && e.reps) { // Solo se envia si esta todo
            flatRutina.push({
              dia_nombre: d.dia,
              ejercicio_id: e.ej_id,
              series: e.series,
              repeticiones: e.reps
            });
          }
        });
      });

      await axios.post(`http://127.0.0.1:8000/api/acceso/rutinas/constructor/${builderAlumnoRut}/`, { rutinas: flatRutina });
      alert("¡Protocolo de entrenamiento desplegado con éxito!");
    } catch (err) {
      console.error("Error guardando", err);
      alert("Error al guardar la rutina.");
    } finally {
      setGuardandoRutina(false);
    }
  };

  if (!usuario) return null;

  return (
    <div className="dashboard-layout full-screen">
      
      {/* btn hamburguesa */}
      <button className="btn-mobile-menu" onClick={() => setMenuAbierto(true)}>
        <Menu size={24} />
      </button>
      <div className={`sidebar-overlay ${menuAbierto ? 'visible' : ''}`} onClick={() => setMenuAbierto(false)}></div>
      
      {/* BARRA LATERAL */}
      <aside className={`sidebar ${menuAbierto ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Ir al Inicio">
            <span className="text-skill-red italic-logo">SKILL</span>
            <span className="text-tc">TRAINING CENTER</span>
          </div>
          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
            <span className="badge-rol">{usuario.rol}</span>
            <button className="btn-close-mobile" onClick={() => setMenuAbierto(false)}>
              <X size={20}/>
            </button>
          </div>
        </div>
        
        <div className="user-profile">
          <div className="avatar">{usuario.nombre.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <p className="user-name">{usuario.nombre}</p>
            <p className="user-rut">{usuario.rut}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => setVistaActiva('inicio')} className={`nav-item btn-nav-trans ${vistaActiva === 'inicio' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> INICIO
          </button>
          
          {(usuario.rol === 'ADMIN' || usuario.rol === 'RECEPCION') && (
            <>
              <button onClick={cargarAlumnos} className={`nav-item btn-nav-trans ${vistaActiva === 'alumnos' ? 'active' : ''}`}>
                <Users size={20} /> ALUMNOS
              </button>

              <button onClick={cargarDireccionTecnica} className={`nav-item btn-nav-trans ${vistaActiva === 'direccion_tecnica' ? 'active' : ''}`}>
                <Dumbbell size={20} /> DIRECCIÓN TÉCNICA
              </button>

              <Link to="/kiosco" className="nav-item btn-nav-trans">
                <Aperture size={20} /> KIOSCO ACCESO
              </Link>

              <Link to="/registro" className="nav-item btn-nav-trans">
                <UserPlus size={20} /> REGISTRAR CUENTA
              </Link>

              <button onClick={() => {
                  setMenuAbierto(false); 
                  navigate('/pagos');
                }} 
                className="nav-item btn-nav-trans">
                <CreditCard size={20} /> PAGOS Y FINANZAS
              </button>
            </>
          )}

          {usuario.rol === 'CLIENTE' && (
            <>
              <button onClick={() => navigate('/rutina')} className="nav-item btn-nav-trans" >
                <Activity size={20} /> MI RUTINA
              </button>
              <button onClick={() => navigate('/camara')} className="nav-item btn-nav-trans">
                <Camera size={20} className="text-skill-red" /> MÓDULO IA NUTRICIÓN
              </button>
            </>
          )}
        </nav>

        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={20} /> CERRAR SESIÓN
        </button>
      </aside>

      <main className="dashboard-content relative-main">
        
        {/* Inicio */}
        {vistaActiva === 'inicio' && (
          <div className="fade-in-item">
            <header className="content-header">
              <h1>BIENVENIDO AL SISTEMA, {usuario.nombre.split(' ')[0].toUpperCase()}</h1>
              <p>{usuario.rol === 'ADMIN' ? 'Centro de comando y monitoreo general.' : 'Resumen telemétrico de tu cuenta.'}</p>
            </header>

            {!stats && (
              <div className="loading-text">
                <span className="dot-blink"></span> Sincronizando base de datos...
              </div>
            )}

            {usuario.rol === 'ADMIN' && stats && (
              <div className="admin-grid">
                
                <div className="stat-card box-glow">
                  <div className="stat-icon red-bg"><Users size={30} /></div>
                  <div className="stat-info">
                    <h3>CLIENTES REGISTRADOS</h3>
                    <p className="stat-value">{stats.total_alumnos}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue-bg"><CreditCard size={30} /></div>
                  <div className="stat-info">
                    <h3>MENSUALIDADES ACTIVAS</h3>
                    <p className="stat-value text-blue">{stats.alumnos_activos}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon green-bg"><Activity size={30} /></div>
                  <div className="stat-info">
                    <h3>ASISTENCIAS DE HOY</h3>
                    <p className="stat-value text-green">{stats.asistencias_hoy}</p>
                  </div>
                </div>

                <div className="admin-bottom-row">
                  
                  <div className="chart-card admin-chart">
                    <div className="chart-header">
                      <div>
                        <h3><BarChart2 size={24} className="text-skill-red" style={{display:'inline', verticalAlign:'middle', marginRight:'10px'}}/> TRÁFICO DEL GIMNASIO</h3>
                        <p>Flujo de usuarios (Tendencia global)</p>
                      </div>

                      <select className="date-filter" value={rangoDias} onChange={(e) => setRangoDias(Number(e.target.value))}>
                        <option value={7}>Últimos 7 días</option>
                        <option value={15}>Últimos 15 días</option>
                        <option value={30}>Último Mes</option>
                        <option value={60}>Últimos 2 Meses</option>
                      </select>
                    </div>
                    
                    <div className="svg-chart-container">
                      {stats.grafico && stats.grafico.length > 0 ? (
                        <svg viewBox="0 0 800 200" className="trend-svg">
                          <defs>
                            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FF2A2A" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="#FF2A2A" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path 
                            d={`
                              ${stats.grafico.map((d, i) => 
                                `${i === 0 ? 'M' : 'L'} ${(i / (stats.grafico.length - 1)) * 800} ${200 - (d.total / maxAsistenciasAdmin) * 160}`
                              ).join(' ')}
                              L 800 200 L 0 200 Z
                            `} 
                            fill="url(#redGradient)" 
                          />
                          <path 
                            d={`
                              ${stats.grafico.map((d, i) => 
                                `${i === 0 ? 'M' : 'L'} ${(i / (stats.grafico.length - 1)) * 800} ${200 - (d.total / maxAsistenciasAdmin) * 160}`
                              ).join(' ')}
                            `} 
                            fill="none" 
                            stroke="#FF2A2A" 
                            strokeWidth="3" 
                            strokeLinejoin="round" 
                            strokeLinecap="round" 
                            style={{ filter: 'drop-shadow(0px 4px 6px rgba(255, 42, 42, 0.4))' }}
                          />
                          {stats.grafico.map((d, i) => {
                            const cx = (i / (stats.grafico.length - 1)) * 800;
                            const cy = 200 - (d.total / maxAsistenciasAdmin) * 160;
                            return (
                              <g key={i} className="chart-node">
                                <circle cx={cx} cy={cy} r="5" fill="#11151C" stroke="#FF2A2A" strokeWidth="2" />
                                <circle cx={cx} cy={cy} r="15" fill="transparent">
                                  <title>{`${d.fecha}: ${d.total} asistencias`}</title>
                                </circle>
                              </g>
                            );
                          })}
                        </svg>
                      ) : null}

                      {stats.grafico && stats.grafico.length > 0 && (
                        <div className="chart-x-axis">
                          <span>{stats.grafico[0].fecha}</span>
                          <span>{stats.grafico[Math.floor(stats.grafico.length / 2)].fecha}</span>
                          <span>{stats.grafico[stats.grafico.length - 1].fecha}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="recent-list admin-feed">
                    <h3 className="feed-title"><Zap size={20} className="text-skill-red" style={{display:'inline', verticalAlign:'middle'}}/> INGRESO EN VIVO</h3>
                    <div className="feed-container">
                      {stats.historial && stats.historial.length > 0 ? (
                        stats.historial.map((a, i) => (
                          <div key={i} className="recent-item fade-in-item">
                            <div className="recent-user">
                              <div className="status-dot pulse-dot"></div>
                              <span className="recent-name">{a.nombre}</span>
                            </div>
                            <span className="recent-time" style={{ letterSpacing: '0.5px' }}>
                              {a.fecha} <span style={{ color: 'var(--skill-red)', margin: '0 4px' }}>|</span> {a.hora} hr
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="empty-text">Aún no hay ingresos hoy.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {usuario.rol === 'CLIENTE' && stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon green-bg"><Activity size={30} /></div>
                  <div className="stat-info">
                    <h3>ESTADO MENSUALIDAD</h3>
                    <p className="stat-value" style={{color: stats.estado === 'Al Día' ? '#22c55e' : '#ef4444'}}>
                      {stats.estado.toUpperCase()}
                    </p>
                    <p className="stat-desc">Vence el {stats.vence}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon blue-bg"><Calendar size={30} /></div>
                  <div className="stat-info">
                    <h3>ENTRENAMIENTOS ESTE MES</h3>
                    <p className="stat-value">{stats.asistencias_mes}</p>
                    <p className="stat-desc">¡Vas por buen camino!</p>
                  </div>
                </div>

                <div id="modulo-asistencias" className="chart-card">
                  <div className="chart-header">
                    <div>
                      <h3><Activity size={24} className="text-skill-red" style={{display:'inline', verticalAlign:'middle', marginRight:'10px'}}/> MATRIZ DE ENTRENAMIENTO</h3>
                      <p>Historial telemétrico de asistencia</p>
                    </div>
                    
                    <select className="date-filter" value={rangoDias} onChange={(e) => setRangoDias(Number(e.target.value))}>
                      <option value={7}>Últimos 7 días</option>
                      <option value={15}>Últimos 15 días</option>
                      <option value={30}>Último Mes</option>
                      <option value={60}>Últimos 2 Meses</option>
                    </select>
                  </div>
                  
                  <div className="heatmap-container">
                    {stats.grafico && stats.grafico.map((dia, index) => (
                      <div key={index} className={`heatmap-square ${dia.asistio === 1 ? 'active' : ''}`} title={`${dia.fecha} - ${dia.asistio === 1 ? 'Entrenamiento' : 'Descanso'}`}>
                        {rangoDias <= 30 && <span className="square-date">{dia.fecha.split('/')[0]}</span>}
                      </div>
                    ))}
                  </div>

                  <div className="heatmap-legend">
                    <span className="legend-item"><div className="heatmap-square mini"></div> Descanso</span>
                    <span className="legend-item"><div className="heatmap-square active mini"></div> Entrenó</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* gestion alumnos */}
        {vistaActiva === 'alumnos' && (
          <div className="alumnos-view slide-up">
            <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
              <div>
                <h1>BASE DE DATOS: ALUMNOS</h1>
                <p>Gestión y monitoreo de clientes registrados.</p>
              </div>
              
              <div className="search-box">
                <input type="text" placeholder="Buscar por nombre o RUT..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="search-input"/>
              </div>
            </header>

            <div className="table-container glass-panel">
              <table className="skill-table">
                <thead>
                  <tr>
                    <th>NOMBRE Y RUT</th>
                    <th>PLAN ASIGNADO</th>
                    <th>VENCIMIENTO</th>
                    <th>ASISTENCIAS</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {listaAlumnos
                    .filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.rut.includes(busqueda))
                    .map((alumno, index) => (
                    <tr key={index}>
                      <td>
                        <div className="td-user">
                          <div className="td-avatar">{alumno.nombre.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="td-name">{alumno.nombre}</p>
                            <p className="td-rut">{alumno.rut}</p>
                          </div>
                        </div>
                      </td>
                      <td className="td-text">{alumno.plan}</td>
                      <td className="td-text font-mono">{alumno.vence}</td>
                      <td className="td-text text-center"><span className="badge-asistencias">{alumno.asistencias}</span></td>
                      <td>
                        <span className={`status-badge ${alumno.estado === 'Al Día' ? 'badge-green' : 'badge-red'}`}>
                          {alumno.estado.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button className="btn-action" onClick={() => abrirPerfil(alumno.rut)}>Ver Perfil</button>
                      </td>
                    </tr>
                  ))}
                  {listaAlumnos.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.rut.includes(busqueda)).length === 0 && (
                    <tr><td colSpan="6" className="text-center p-20 text-muted" style={{padding: '30px', textAlign: 'center'}}>No hay alumnos que coincidan con la búsqueda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* direccion tecnica */}
        {vistaActiva === 'direccion_tecnica' && (
          <div className="dt-view slide-up">
            <header className="content-header" style={{ marginBottom: '30px' }}>
              <h1>DIRECCIÓN TÉCNICA</h1>
              <p>Diseño y asignación de protocolos de entrenamiento.</p>
            </header>

            <div className="dt-grid">
              
              {/* panel izq ejrcicios */}
              <div className="dt-card">
                <div className="dt-card-header">
                  <h3><BookOpen size={20} className="text-skill-red inline-icon"/> CATÁLOGO GLOBAL</h3>
                  <p>Añade nuevos movimientos a la base de datos.</p>
                </div>
                
                <form className="dt-form" onSubmit={crearEjercicio}>
                  <input type="text" placeholder="Ej: Press Militar con Mancuernas" className="dt-input" value={nuevoEjer.nombre} onChange={(e) => setNuevoEjer({...nuevoEjer, nombre: e.target.value})}
                    required/>
                  <select className="dt-input" value={nuevoEjer.grupo_muscular} onChange={(e) => setNuevoEjer({...nuevoEjer, grupo_muscular: e.target.value})} required>
                    <option value="">Selecciona el grupo muscular</option>
                    <option value="Pecho">Pecho</option>
                    <option value="Espalda">Espalda</option>
                    <option value="Piernas">Piernas</option>
                    <option value="Hombros">Hombros</option>
                    <option value="Brazos">Brazos</option>
                    <option value="Core">Core / Abdomen</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                  <button type="submit" className="btn-dt-add"><Plus size={18} /> AGREGAR AL CATÁLOGO</button>
                </form>

                <div className="ejercicios-list">
                  {ejercicios.map((ej) => (
                    <div key={ej.id} className="ejercicio-tag">
                      <span className="ej-musculo">{ej.grupo_muscular}</span>
                      <span className="ej-nombre">{ej.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* panl derecho rutinas */}
              <div className="dt-card dt-workspace">
                <div className="workspace-top">
                  <div>
                    <h3><Dumbbell size={20} className="text-skill-red inline-icon"/> CONSTRUCTOR DE RUTINAS</h3>
                    <p>Selecciona un alumno para diseñar su semana.</p>
                  </div>
                  <div className="workspace-actions">
                    <select className="dt-input select-alumno" value={builderAlumnoRut} onChange={(e) => cargarRutinaAlumno(e.target.value)}>
                      <option value="">-- Seleccionar Alumno --</option>
                      {listaAlumnos.filter(a => a.rut).map((a) => (
                        <option key={a.rut} value={a.rut}>{a.nombre} ({a.rut})</option>
                      ))}
                    </select>
                    {builderAlumnoRut && (
                      <button className="btn-dt-clear" onClick={limpiarTodaLaRutina}>
                        <Trash2 size={18} /> VACIAR
                      </button>
                    )}
                  </div>
                </div>

                {builderAlumnoRut ? (
                  <div className="workspace-board">
                    {/* agregar dias*/}
                    <div className="add-day-row">
                      <input type="text" placeholder="Ej: DÍA 1: PECHO Y TRÍCEPS" className="dt-input" value={nuevoDiaNombre} onChange={(e) => setNuevoDiaNombre(e.target.value)}/>
                      <button className="btn-dt-add-day" onClick={agregarDiaBuilder}><Plus size={18}/> AGREGAR COLUMNA</button>
                    </div>

                    {/* mesa de trabajo*/}
                    <div className="builder-columns">
                      {rutinaBuilder.map((dia, dIndex) => (
                        <div key={dIndex} className="builder-day-card">
                          <div className="day-header">
                            <h4>{dia.dia}</h4>
                            <button className="btn-icon-red" onClick={() => eliminarDiaBuilder(dIndex)} title="Eliminar Día"><Trash2 size={16}/></button>
                          </div>
                          
                          <div className="day-exercises">
                            {dia.ejercicios.map((ej, eIndex) => (
                              <div key={ej.id_temp} className="builder-exercise-row">
                                <select className="ej-select" value={ej.ej_id} onChange={(e) => actualizarEjercicioBuilder(dIndex, eIndex, 'ej_id', e.target.value)}>
                                  <option value="">Seleccione Ejercicio</option>
                                  {ejercicios.map(e_db => (
                                    <option key={e_db.id} value={e_db.id}>{e_db.nombre}</option>
                                  ))}
                                </select>
                                <div className="ej-inputs">
                                  <input type="number" placeholder="Series" value={ej.series} onChange={(e) => actualizarEjercicioBuilder(dIndex, eIndex, 'series', e.target.value)} />
                                  <span className="text-muted">x</span>
                                  <input type="number" placeholder="Reps" value={ej.reps} onChange={(e) => actualizarEjercicioBuilder(dIndex, eIndex, 'reps', e.target.value)} />
                                  <button className="btn-icon-red sm" onClick={() => eliminarEjercicioDelDia(dIndex, eIndex)}><X size={14}/></button>
                                </div>
                              </div>
                            ))}
                            
                            <button className="btn-add-ej" onClick={() => agregarEjercicioAlDia(dIndex)}>+ Ejercicio</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* btn */}
                    {rutinaBuilder.length > 0 && (
                      <div className="deploy-row">
                        <button className="btn-deploy" onClick={guardarRutinaDesplegada} disabled={guardandoRutina}>
                          {guardandoRutina ? <RefreshCw size={20} className="spin-icon" /> : <Save size={20} />}
                          {guardandoRutina ? 'DESPLEGANDO...' : 'DESPLEGAR RUTINA AL CLIENTE'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="workspace-empty">
                    <UserCircle size={48} className="text-gray-light mb-2" />
                    <p>Selecciona un alumno en el menú superior para comenzar a diseñar.</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </main>

      {/* PANEL LATERAL*/}
      <div className={`slide-over-overlay ${panelAbierto ? 'visible' : ''}`} onClick={cerrarPerfil}></div>
      
      <div className={`slide-over-panel ${panelAbierto ? 'open' : ''}`}>
        <div className="panel-lateral-header">
          <h2>DETALLE DEL ALUMNO</h2>
          <button className="btn-close-panel" onClick={cerrarPerfil}><X size={24} /></button>
        </div>

        <div className="panel-lateral-content">
          {cargandoPerfil ? (
            <div className="loading-text" style={{justifyContent: 'center', marginTop: '50px'}}>
              <span className="dot-blink"></span> Descargando expediente...
            </div>
          ) : alumnoSeleccionado ? (
            <div className="fade-in-item">
              <div className="perfil-card text-center">
                <UserCircle size={64} className="text-gray-light mx-auto mb-2" style={{margin: '0 auto'}}/>
                <h3 className="perfil-name">{alumnoSeleccionado.nombre}</h3>
                <p className="perfil-rut">{alumnoSeleccionado.rut}</p>
              </div>

              <div className="perfil-section">
                <h4>MEMBRESÍA</h4>
                <div className={`membresia-box ${alumnoSeleccionado.dias_restantes > 0 ? 'activa' : 'vencida'}`}>
                  <div className="membresia-info">
                    <span className="membresia-status">
                      {alumnoSeleccionado.dias_restantes > 0 ? 'AL DÍA' : 'VENCIDA'}
                    </span>
                    <span className="membresia-fecha">Vence: {alumnoSeleccionado.vencimiento}</span>
                  </div>
                  <div className="membresia-dias">
                    <strong>{alumnoSeleccionado.dias_restantes}</strong> días
                  </div>
                </div>
                <button className="btn-renovar" onClick={renovarMensualidad} disabled={renovando}>
                  {renovando ? <RefreshCw size={18} className="spin-icon" /> : <CreditCard size={18} />}
                  {renovando ? 'PROCESANDO...' : 'RENOVAR +30 DÍAS'}
                </button>
              </div>

              <div className="perfil-section">
                <h4>CONSTANCIA (60 DÍAS)</h4>
                <div className="heatmap-container bg-dark-box">
                  {alumnoSeleccionado.grafico.map((dia, index) => (
                    <div 
                      key={index} 
                      className={`heatmap-square mini ${dia.asistio === 1 ? 'active' : ''}`} 
                      title={dia.fecha}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="perfil-section">
                <h4>RUTINA ASIGNADA</h4>
                {alumnoSeleccionado.resumen_rutina && alumnoSeleccionado.resumen_rutina.length > 0 ? (
                  <ul className="rutina-list">
                    {alumnoSeleccionado.resumen_rutina.map((ej, idx) => (
                      <li key={idx}><Activity size={14} className="text-skill-red"/> {ej}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted text-sm">No tiene rutina asignada en el sistema.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style>
        {`
          :root {
            --bg-dark: #0B0E14; --bg-panel: #11151C; --skill-red: #FF2A2A; --skill-red-glow: rgba(255, 42, 42, 0.4);
            --text-main: #FFFFFF; --text-muted: #A0AEC0; --border-color: rgba(255, 255, 255, 0.05);
          }
          html { scroll-behavior: smooth; overflow-x: hidden; }
          .full-screen { min-height: 100vh; width: 100%; background-color: var(--bg-dark); color: var(--text-main); font-family: 'Inter', system-ui, sans-serif; }
          .dashboard-layout { display: flex; }
          .btn-mobile-menu { display: none; position: fixed; top: 20px; right: 20px; z-index: 90; background: var(--bg-panel); border: 1px solid var(--border-color); color: var(--text-main); padding: 10px; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5);}
          .sidebar-overlay { display: none; }
          .btn-close-mobile { display: none; }

          .text-skill-red { color: var(--skill-red); text-shadow: 0 0 10px var(--skill-red-glow); }
          .text-blue { color: #3b82f6; } .text-green { color: #22c55e; } .text-gray-light { color: var(--text-muted); }
          .italic-logo { font-style: italic; font-weight: 900; font-family: 'Impact', sans-serif; font-size: 2rem; }
          .text-tc { display: block; color: var(--text-main); font-family: 'Arial', sans-serif; font-size: 0.7rem; letter-spacing: 4px; margin-top: -5px; }

          .sidebar { width: 280px; background-color: var(--bg-panel); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; z-index: 10; height: 100vh; position: sticky; box-sizing: border-box; }
          .sidebar-header { padding: 25px; display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid var(--border-color); }
          .badge-rol { background-color: rgba(255, 42, 42, 0.1); color: var(--skill-red); border: 1px solid rgba(255, 42, 42, 0.3); padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; letter-spacing: 1px; }
          .user-profile { padding: 25px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid var(--border-color); }
          .avatar { width: 45px; height: 45px; background-color: var(--skill-red); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; font-family: 'Impact'; box-shadow: 0 0 15px var(--skill-red-glow); }
          .user-info .user-name { margin: 0; font-weight: bold; font-size: 1rem; } .user-info .user-rut { margin: 5px 0 0 0; font-size: 0.8rem; color: var(--text-muted); }
          .sidebar-nav { padding: 10px 0; flex-grow: 1; display: flex; flex-direction: column; overflow-y: auto; }
          .nav-item { padding: 15px 25px; color: var(--text-muted); text-decoration: none; display: flex; align-items: center; gap: 15px; font-weight: 600; font-size: 0.9rem; letter-spacing: 1px; transition: all 0.3s; border-left: 3px solid transparent; }
          .nav-item:hover, .nav-item.active { color: var(--text-main); background-color: rgba(255,255,255,0.02); border-left-color: var(--skill-red); }
          .btn-nav-trans { background: transparent; border: none; text-align: left; cursor: pointer; font-family: inherit; }
          .btn-logout { margin: 10px 20px 20px 20px; padding: 12px; background-color: transparent; color: var(--text-muted); border: 1px solid rgba(255, 42, 42, 0.3); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: bold; transition: all 0.3s; flex-shrink: 0; }
          .btn-logout:hover { background-color: rgba(255, 42, 42, 0.1); color: var(--skill-red); border-color: var(--skill-red); }

          .relative-main { position: relative; }
          .dashboard-content { flex-grow: 1; padding: 50px; overflow-y: auto; height: 100vh; }
          .content-header h1 { margin: 0; font-family: 'Impact', sans-serif; font-size: 2.5rem; letter-spacing: 2px; }
          .content-header p { color: var(--text-muted); font-size: 1.1rem; margin-top: 10px; }
          .loading-text { margin-top: 40px; color: var(--text-muted); font-weight: bold; display: flex; align-items: center; gap: 10px; }
          .dot-blink { width: 10px; height: 10px; background: var(--skill-red); border-radius: 50%; animation: blink 1s infinite; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

          /* CARDS & GRIDS */
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-top: 40px; animation: fadeIn 0.5s ease-out; }
          .stat-card { background: rgba(255,255,255,0.02); padding: 25px; border-radius: 12px; display: flex; align-items: center; gap: 20px; border: 1px solid var(--border-color); transition: transform 0.3s, border-color 0.3s; }
          .stat-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.1); }
          .box-glow:hover { border-color: rgba(255, 42, 42, 0.3); box-shadow: 0 10px 30px rgba(255, 42, 42, 0.05); }
          .stat-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .red-bg { background: rgba(255, 42, 42, 0.1); color: var(--skill-red); border: 1px solid rgba(255, 42, 42, 0.2); }
          .blue-bg { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
          .green-bg { background: rgba(34, 197, 94, 0.1); color: #22C55E; border: 1px solid rgba(34, 197, 94, 0.2); }
          .stat-info h3 { margin: 0; color: var(--text-muted); font-size: 0.8rem; letter-spacing: 2px;}
          .stat-info .stat-value { margin: 5px 0 0 0; font-size: 2.5rem; font-family: 'Impact';}
          .stat-info .stat-desc { margin: 5px 0 0 0; font-size: 0.9rem; color: var(--text-muted); }

          .admin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-top: 40px; animation: fadeIn 0.5s ease-out; }
          .admin-bottom-row { grid-column: 1 / -1; display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }

          .chart-card { background: var(--bg-panel); padding: 30px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.5); grid-column: 1 / -1;}
          .admin-chart { grid-column: 1 / 2; }
          .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;}
          .chart-header h3 { margin: 0; font-family: 'Impact', sans-serif; font-size: 1.5rem; letter-spacing: 1px; }
          .chart-header p { margin: 0; color: var(--text-muted); font-size: 0.9rem; font-weight: bold;}

          .svg-chart-container { width: 100%; height: 240px; display: flex; flex-direction: column; position: relative; margin-top: 10px; }
          .trend-svg { width: 100%; height: 200px; overflow: visible; }
          .chart-node circle:first-child { transition: all 0.2s ease; }
          .chart-node:hover circle:first-child { fill: var(--skill-red); r: 7; cursor: pointer; }
          .chart-x-axis { display: flex; justify-content: space-between; width: 100%; margin-top: 15px; color: var(--text-muted); font-size: 0.8rem; font-weight: 800; letter-spacing: 1px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }

          .admin-feed { grid-column: 2 / 3; background: var(--bg-panel); padding: 30px; border-radius: 12px; border: 1px solid var(--border-color); display: flex; flex-direction: column; }
          .feed-title { margin: 0 0 20px 0; font-family: 'Impact', sans-serif; font-size: 1.2rem; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;}
          .feed-container { display: flex; flex-direction: column; gap: 15px; flex-grow: 1; overflow-y: auto; max-height: 250px;}
          .recent-item { display: flex; justify-content: space-between; padding: 12px 15px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.03); align-items: center; }
          .recent-user { display: flex; align-items: center; gap: 12px; }
          .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #22c55e; box-shadow: 0 0 10px #22c55e; animation: pulse 2s infinite; }
          .recent-name { font-weight: 600; font-size: 0.9rem; }
          .recent-time { color: var(--text-muted); font-size: 0.75rem; font-weight: bold; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 20px; }

          .date-filter { background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px solid var(--border-color); padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; outline: none; }
          .date-filter option { background: var(--bg-panel); color: white; }
          .heatmap-container { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 0; }
          .heatmap-square { width: 28px; height: 28px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; display: flex; align-items: center; justify-content: center; cursor: pointer; }
          .heatmap-square:hover { border-color: rgba(255,255,255,0.4); transform: scale(1.15); z-index: 2; }
          .heatmap-square.active { background: var(--skill-red); border-color: #ff4d4d; box-shadow: 0 0 10px var(--skill-red-glow); }
          .square-date { font-size: 0.65rem; color: rgba(255,255,255,0.3); font-weight: bold; user-select: none; }
          .heatmap-square.active .square-date { color: #FFFFFF; }
          .heatmap-legend { display: flex; gap: 20px; margin-top: 20px; justify-content: flex-end; font-size: 0.85rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 15px; }
          .legend-item { display: flex; align-items: center; gap: 8px; font-weight: bold;}
          .heatmap-square.mini { width: 16px; height: 16px; cursor: default; }

          /* ALUMNOS vista */
          .alumnos-view { animation: slideUp 0.4s ease-out; }
          .search-input { background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: white; padding: 12px 20px; border-radius: 30px; width: 300px; outline: none; transition: all 0.3s; font-family: inherit;}
          .search-input:focus { border-color: var(--skill-red); box-shadow: 0 0 10px rgba(255,42,42,0.2); width: 350px;}
          .table-container { background: var(--bg-panel); border-radius: 12px; border: 1px solid var(--border-color); overflow-x: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .skill-table { width: 100%; border-collapse: collapse; text-align: left; }
          .skill-table th { padding: 20px; color: var(--text-muted); font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .skill-table td { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle; }
          .skill-table tr:hover { background: rgba(255,255,255,0.01); }
          
          .td-user { display: flex; align-items: center; gap: 15px; }
          .td-avatar { width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--skill-red); font-family: 'Impact'; border: 1px solid rgba(255,42,42,0.2); }
          .td-name { margin: 0; font-weight: bold; font-size: 0.95rem; color: var(--text-main); }
          .td-rut { margin: 3px 0 0 0; font-size: 0.8rem; color: var(--text-muted); }
          .td-text { color: var(--text-muted); font-weight: 500; font-size: 0.9rem; }
          .font-mono { font-family: monospace; font-size: 1rem; }
          
          .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; }
          .badge-green { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
          .badge-red { background: rgba(255,42,42,0.1); color: var(--skill-red); border: 1px solid rgba(255,42,42,0.2); }
          .badge-asistencias { background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 6px; font-weight: bold; color: white;}
          
          .btn-action { background: transparent; color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s; font-size: 0.8rem;}
          .btn-action:hover { background: rgba(59,130,246,0.1); border-color: #3b82f6; }


          /* DIRECCIÓN TÉCNICA  */
          .dt-view { animation: slideUp 0.4s ease-out; }
          .dt-grid { display: grid; grid-template-columns: 300px 1fr; gap: 25px; align-items: start;}
          .dt-card { background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .dt-card-header { margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;}
          .dt-card-header h3 { margin: 0; font-family: 'Impact', sans-serif; font-size: 1.2rem; letter-spacing: 1px; display: flex; align-items: center;}
          .dt-card-header p { margin: 5px 0 0 0; color: var(--text-muted); font-size: 0.8rem; font-weight: bold;}
          .inline-icon { margin-right: 10px; }

          .dt-form { display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px; }
          .dt-input { background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: white; padding: 12px 15px; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.3s; }
          .dt-input:focus { border-color: var(--skill-red); }
          .dt-input option { background: var(--bg-panel); }
          .btn-dt-add { background: transparent; color: var(--skill-red); border: 1px dashed var(--skill-red); padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;}
          .btn-dt-add:hover { background: rgba(255,42,42,0.1); border-style: solid; }

          .ejercicios-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; padding-right: 5px;}
          .ejercicio-tag { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; display: flex; align-items: center; gap: 10px; }
          .ej-musculo { background: rgba(255,255,255,0.05); font-size: 0.65rem; padding: 3px 8px; border-radius: 4px; color: var(--text-muted); font-weight: bold; text-transform: uppercase; }
          .ej-nombre { font-size: 0.85rem; font-weight: 600; }

          .workspace-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px;}
          .workspace-top h3 { margin: 0; font-family: 'Impact', sans-serif; font-size: 1.5rem; letter-spacing: 1px; display: flex; align-items: center;}
          .workspace-top p { margin: 5px 0 0 0; color: var(--text-muted); font-size: 0.9rem; font-weight: bold;}
          .workspace-actions { display: flex; gap: 15px; align-items: center; }
          .select-alumno { width: 300px; border-color: rgba(59,130,246,0.5); font-weight: bold;}
          .select-alumno:focus { border-color: #3b82f6; box-shadow: 0 0 10px rgba(59,130,246,0.2); }
          .btn-dt-clear { background: transparent; color: var(--text-muted); border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: bold; font-size: 0.8rem; transition: color 0.2s;}
          .btn-dt-clear:hover { color: var(--skill-red); }

          .workspace-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: var(--text-muted); text-align: center; }
          .add-day-row { display: flex; gap: 15px; margin-bottom: 25px; }
          .btn-dt-add-day { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;}
          .btn-dt-add-day:hover { background: rgba(255,255,255,0.1); border-color: white;}

          .builder-columns { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; padding-bottom: 20px; }
          .builder-day-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; display: flex; flex-direction: column; height: fit-content; animation: fadeIn 0.3s ease-out; }

          .builder-day-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; width: 350px; min-width: 350px; display: flex; flex-direction: column; }
          .day-header { background: rgba(255,255,255,0.02); padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; }
          .day-header h4 { margin: 0; font-size: 1rem; font-weight: 800; letter-spacing: 1px; color: var(--text-main); }
          .btn-icon-red { background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: color 0.2s; padding: 5px; display: flex;}
          .btn-icon-red:hover { color: var(--skill-red); }
          .btn-icon-red.sm { padding: 0; }

          .day-exercises { 
          padding: 15px; 
          display: flex; 
          flex-direction: column; 
          gap: 10px; 
          max-height: 320px; 
          overflow-y: auto; 
          }

          .day-exercises::-webkit-scrollbar { width: 6px; }
          .day-exercises::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
          .day-exercises::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
          .day-exercises::-webkit-scrollbar-thumb:hover { background: var(--skill-red); }
          
          .builder-exercise-row { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 10px; animation: fadeIn 0.3s ease-out; }
          .ej-select { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px; border-radius: 4px; font-size: 0.85rem; outline: none; width: 100%;}
          .ej-select option { background: var(--bg-panel); }
          .ej-inputs { display: flex; align-items: center; gap: 10px; }
          .ej-inputs input { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px; border-radius: 4px; font-size: 0.85rem; width: 70px; text-align: center; outline: none;}
          .ej-inputs input:focus { border-color: var(--skill-red); }
          .btn-add-ej { background: transparent; border: 1px dashed rgba(255,255,255,0.2); color: var(--text-muted); padding: 10px; border-radius: 6px; font-weight: bold; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; margin-top: 5px;}
          .btn-add-ej:hover { border-color: var(--text-main); color: var(--text-main); }

          .deploy-row { margin-top: 20px; display: flex; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;}
          .btn-deploy { background: var(--skill-red); color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: 800; font-size: 1rem; letter-spacing: 1.5px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255,42,42,0.2); }
          .btn-deploy:hover:not(:disabled) { background: #FF3B3B; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,42,42,0.4); }
          .btn-deploy:disabled { opacity: 0.7; cursor: not-allowed; }


          /*PANEL LATERAl  */
          .slide-over-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 100; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
          .slide-over-overlay.visible { opacity: 1; pointer-events: auto; }
          
          .slide-over-panel { position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: var(--bg-panel); border-left: 1px solid var(--border-color); box-shadow: -10px 0 30px rgba(0,0,0,0.8); z-index: 101; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; }
          .slide-over-panel.open { transform: translateX(0); }
          
          .panel-lateral-header { padding: 25px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
          .panel-lateral-header h2 { margin: 0; font-family: 'Impact', sans-serif; font-size: 1.5rem; letter-spacing: 1px; color: var(--text-main); }
          .btn-close-panel { background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: color 0.2s; display: flex; align-items: center; justify-content: center; }
          .btn-close-panel:hover { color: var(--skill-red); }
          
          .panel-lateral-content { padding: 30px; overflow-y: auto; flex-grow: 1; }
          
          .perfil-card { margin-bottom: 30px; }
          .perfil-name { margin: 10px 0 5px 0; font-size: 1.5rem; font-weight: 800; }
          .perfil-rut { margin: 0; color: var(--text-muted); font-size: 0.9rem; font-family: monospace; }
          
          .perfil-section { margin-bottom: 30px; }
          .perfil-section h4 { font-size: 0.8rem; color: var(--text-muted); letter-spacing: 1.5px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; margin-bottom: 15px; }
          
          .membresia-box { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid; }
          .membresia-box.activa { background: rgba(34,197,94,0.05); border-color: rgba(34,197,94,0.2); }
          .membresia-box.vencida { background: rgba(255,42,42,0.05); border-color: rgba(255,42,42,0.2); }
          .membresia-status { display: block; font-weight: 900; font-size: 1.1rem; margin-bottom: 5px; }
          .membresia-box.activa .membresia-status { color: #22c55e; }
          .membresia-box.vencida .membresia-status { color: var(--skill-red); }
          .membresia-fecha { color: var(--text-muted); font-size: 0.8rem; }
          .membresia-dias { font-size: 0.9rem; color: var(--text-muted); text-align: right; }
          .membresia-dias strong { font-size: 1.5rem; color: var(--text-main); font-family: 'Impact'; }
          
          .btn-renovar { width: 100%; background: var(--skill-red); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255,42,42,0.2); }
          .btn-renovar:hover:not(:disabled) { background: #FF3B3B; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,42,42,0.4); }
          .btn-renovar:disabled { opacity: 0.7; cursor: not-allowed; }
          .spin-icon { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }

          .bg-dark-box { background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); }
          
          .rutina-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
          .rutina-list li { background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 0.9rem; }

          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }


          /* RESPONSIV  */
          @media (max-width: 1024px) {
            
            .btn-mobile-menu { display: block; }
            .btn-close-mobile { display: block; background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center;}
            
            .sidebar {
              position: fixed;
              left: 0;
              top: 0;
              transform: translateX(-100%);
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 10px 0 30px rgba(0,0,0,0.8);
            }
            .sidebar.open {
              transform: translateX(0);
            }
            
            .sidebar-overlay {
              display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 9; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
            }
            .sidebar-overlay.visible {
              opacity: 1; pointer-events: auto;
            }

            .dashboard-content {
              padding: 80px 20px 20px 20px;
            }
            .content-header h1 { font-size: 1.8rem; }
            .dt-grid { grid-template-columns: 1fr; }
            .workspace-top { flex-direction: column; gap: 15px; }
            .workspace-actions { width: 100%; flex-direction: column; align-items: flex-start;}
            .select-alumno { width: 100%; }
            .builder-columns { grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)); }
            .builder-day-card { min-width: 100%; }
            .search-input, .search-input:focus { width: 100%; }
            /* ========================================= */
          /* 📱 RESPONSIVE DESIGN (MÓVILES Y TABLETS)  */
          /* ========================================= */
          
          /* Ajustes generales para evitar scroll horizontal en toda la app */
          html, body { 
            margin: 0; padding: 0; 
            max-width: 100vw; 
            overflow-x: hidden; 
          }
          * { box-sizing: border-box; }

          @media (max-width: 1024px) {
            
            .btn-mobile-menu { display: block; }
            .btn-close-mobile { display: block; background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center;}
            .admin-bottom-row {
              grid-template-columns: 1fr;
            .admin-chart {
              grid-column: 1 / -1;
            }
            .admin-feed {
              grid-column: 1 / -1;
            }
            .sidebar {
              position: fixed;
              left: 0;
              top: 0;
              transform: translateX(-100%);
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 10px 0 30px rgba(0,0,0,0.8);
            }
            .sidebar.open { transform: translateX(0); }
            
            .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 9; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
            .sidebar-overlay.visible { opacity: 1; pointer-events: auto; }

            .dashboard-content { padding: 80px 20px 20px 20px; }
            
            .content-header h1 { font-size: 1.8rem; line-height: 1.2; }
            .content-header p { font-size: 0.95rem; }

            /* Dirección Técnica */
            .dt-grid { grid-template-columns: 1fr; }
            .workspace-top { flex-direction: column; gap: 15px; }
            .workspace-actions { width: 100%; flex-direction: column; align-items: flex-start;}
            .select-alumno { width: 100%; }
            .builder-columns { grid-template-columns: 1fr; }
            .builder-day-card { min-width: 100%; width: 100%; }
            .search-input, .search-input:focus { width: 100%; }

            .table-container { border-radius: 8px; }
          }

          @media (max-width: 768px) {
            
            /* Gráficos y KPIs */
            .admin-grid { grid-template-columns: 1fr; gap: 15px; margin-top: 20px; }
            .admin-bottom-row { grid-template-columns: 1fr; gap: 15px; }
            .stats-grid { grid-template-columns: 1fr; gap: 15px; margin-top: 20px; }
            
            .stat-card { padding: 15px; }
            .stat-info .stat-value { font-size: 2rem; }
            
            .chart-card { padding: 20px 15px; }
            .chart-header { flex-direction: column; align-items: flex-start; gap: 15px; }
            .date-filter { width: 100%; }
            
            /* Vista de Alumnos */
            .alumnos-view .content-header { flex-direction: column; align-items: flex-start; gap: 15px; }
            .search-box { width: 100%; }
            
            .skill-table th, .skill-table td { padding: 12px 10px; font-size: 0.85rem; }
            .td-name { font-size: 0.85rem; white-space: nowrap; }
            .td-rut { font-size: 0.75rem; }
            .status-badge { font-size: 0.7rem; padding: 4px 8px; white-space: nowrap; }
            .font-mono { white-space: nowrap; }
            

            .slide-over-panel { width: 100%; }
            
            /* 4. Dirección Técnica (Ajustes finos para constructor) */
            .add-day-row { flex-direction: column; }
            .btn-dt-add-day { width: 100%; justify-content: center; padding: 12px; }
            .builder-exercise-row { padding: 8px; }
            .ej-inputs { flex-wrap: wrap; justify-content: center; }
            .ej-inputs input { width: 40%; }
            .btn-deploy { padding: 15px; font-size: 0.95rem; }
          }
          }
        `}
      </style>
    </div>
  );
}