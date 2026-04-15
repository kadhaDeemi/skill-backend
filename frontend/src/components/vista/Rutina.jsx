import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Dumbbell, CheckCircle2, Timer, Save } from 'lucide-react';

export default function Rutina() {
  const navigate = useNavigate();
  
  const [usuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem('usuarioSkill');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  const [rutina, setRutina] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pesosInput, setPesosInput] = useState({});
  

  const [diasDisponibles, setDiasDisponibles] = useState([]);
  const [diaActivo, setDiaActivo] = useState('');

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    const cargarRutina = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/acceso/rutina/${usuario.rut}/`);
        const datosRutina = res.data.rutina;
        
        setRutina(datosRutina);
        
        // EXTRAER dias
        const diasUnicos = [...new Set(datosRutina.map(item => item.dia_nombre))];
        setDiasDisponibles(diasUnicos);
        
        // Selecciona el primer dia por defecto si hay rutinas
        if (diasUnicos.length > 0) {
          setDiaActivo(diasUnicos[0]);
        }
        
        const inputsIniciales = {};
        datosRutina.forEach(item => {
          if (item.peso_hoy) {
            inputsIniciales[item.id] = item.peso_hoy;
          }
        });
        setPesosInput(inputsIniciales);

      } catch (err) {
        console.error("Error cargando rutina", err);
      } finally {
        setCargando(false);
      }
    };

    cargarRutina();
  }, [navigate, usuario]);

  const handlePesoChange = (id, valor) => {
    setPesosInput(prev => ({...prev, [id]: valor}));
  };

  const guardarEjercicio = async (rutina_id) => {
    const peso = pesosInput[rutina_id];
    
    if (!peso || peso <= 0) {
      alert("Por favor, ingresa un peso válido antes de guardar.");
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:8000/api/acceso/rutina/${usuario.rut}/`, {
        rutina_id: rutina_id,
        peso: peso
      });

      setRutina(prevRutina => 
        prevRutina.map(item => 
          item.id === rutina_id ? { ...item, completado_hoy: true, peso_hoy: peso } : item
        )
      );

    } catch (err) {
      console.error("Error al guardar el progreso", err);
      alert("Hubo un error al guardar. Intenta de nuevo.");
    }
  };

  if (!usuario) return null;

  // FILTRA LOS EJERCICIOS DEL DIa SELECCIONADO
  const ejerciciosDelDia = rutina.filter(item => item.dia_nombre === diaActivo);
  
  // CALCULA EL PROGRESO SOLO DEL DIA SELECCIONADO
  const totalEjerciciosDia = ejerciciosDelDia.length;
  const completadosDia = ejerciciosDelDia.filter(r => r.completado_hoy).length;
  const porcentaje = totalEjerciciosDia === 0 ? 0 : Math.round((completadosDia / totalEjerciciosDia) * 100);

  return (
    <div className="rutina-container full-screen">
      
      <header className="camara-header wide-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back-skill">
          <ArrowLeft size={18} /> VOLVER AL DASHBOARD
        </button>
        <div className="header-title">
          <span className="text-skill-red italic-logo">SKILL</span> <span className="text-tc">TRAINING CENTER</span>
        </div>
      </header>

      <main className="rutina-main dashboard-layout">
        <div className="vision-panel glass-panel widescreen-panel">
          
          <div className="panel-header text-center mb-10">
            <Dumbbell className="text-skill-red pulse-icon inline-block mb-2" size={32} />
            <h2 className="title-mega">TU PROTOCOLO DE ENTRENAMIENTO</h2>
          </div>

          {cargando ? (
            <div className="loading-text" style={{justifyContent: 'center', margin: '50px 0'}}>
              <span className="dot-blink"></span> Descargando protocolo de entrenamiento...
            </div>
          ) : rutina.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={48} className="text-gray-light mb-4" />
              <h3>DÍA DE DESCANSO</h3>
              <p>No tienes ejercicios asignados. Disfruta tu recuperación.</p>
            </div>
          ) : (
            <>
              {/* SISTEMA DE PESTAÑAS*/}
              <div className="tabs-container">
                {diasDisponibles.map((dia, idx) => (
                  <button 
                    key={idx}
                    className={`tab-button ${diaActivo === dia ? 'active' : ''}`}
                    onClick={() => setDiaActivo(dia)}
                  >
                    {dia.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* BARRA DE PROGRESO */}
              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-title">PROGRESO: {diaActivo.toUpperCase()}</span>
                  <span className="progress-percent text-skill-red">{porcentaje}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width: `${porcentaje}%`}}></div>
                </div>
              </div>

              {/* LISTA DE EJERCICIOS*/}
              <div className="ejercicios-grid slide-up">
                {ejerciciosDelDia.map((item) => (
                  <div key={item.id} className={`ejercicio-card ${item.completado_hoy ? 'completado' : ''}`}>
                    
                    <div className="ejercicio-header">
                      <span className="musculo-badge">{item.grupo_muscular}</span>
                      {item.completado_hoy && <CheckCircle2 size={24} className="text-green-500" />}
                    </div>

                    <h3 className="ejercicio-nombre">{item.ejercicio}</h3>
                    
                    <div className="ejercicio-stats">
                      <div className="stat-box">
                        <Timer size={18} className="text-gray-light" />
                        <span>{item.series} Series</span>
                      </div>
                      <div className="stat-box">
                        <Dumbbell size={18} className="text-gray-light" />
                        <span>{item.repeticiones} Reps</span>
                      </div>
                    </div>

                    <div className="ejercicio-action">
                      <div className="input-group">
                        <input type="number" placeholder="KG" className="peso-input" value={pesosInput[item.id] || ''} onChange={(e) => handlePesoChange(item.id, e.target.value)} 
                        disabled={item.completado_hoy}/>
                        <span className="unidad-label">KG</span>
                      </div>
                      
                      {!item.completado_hoy ? (
                        <button className="btn-guardar" onClick={() => guardarEjercicio(item.id)}>
                          <Save size={18} /> GUARDAR
                        </button>
                      ) : (
                        <button className="btn-completado" disabled>
                          ¡LISTO!
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <style>
        {`
          :root {
            --bg-dark: #0B0E14;
            --bg-panel: #11151C;
            --skill-red: #FF2A2A;
            --skill-red-glow: rgba(255, 42, 42, 0.4);
            --text-main: #FFFFFF;
            --text-muted: #A0AEC0;
            --border-color: rgba(255, 255, 255, 0.05);
          }

          html, body { 
            margin: 0; padding: 0; 
            max-width: 100vw; 
            overflow-x: hidden; 
            background-color: var(--bg-dark);
          }
          * { box-sizing: border-box; }

          .full-screen { min-height: 100vh; width: 100%; color: var(--text-main); font-family: 'Inter', system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; }
          .text-skill-red { color: var(--skill-red); text-shadow: 0 0 10px var(--skill-red-glow); }
          .italic-logo { font-style: italic; font-weight: 900; font-family: 'Impact', sans-serif; font-size: 2rem; }
          .text-tc { display: inline-block; color: var(--text-main); font-family: 'Arial', sans-serif; font-size: 0.8rem; letter-spacing: 4px; margin-left: 5px; }
          .text-gray-light { color: var(--text-muted); }
          .text-green-500 { color: #22c55e; filter: drop-shadow(0 0 5px rgba(34,197,94,0.5)); }

          .wide-header { padding: 20px 50px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); background: var(--bg-dark); z-index: 10; }
          .btn-back-skill { display: flex; align-items: center; gap: 8px; background: transparent; color: var(--text-muted); border: 1px solid rgba(255,42,42,0.3); padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.3s; font-size: 0.9rem; letter-spacing: 1px; }
          .btn-back-skill:hover { border-color: var(--skill-red); color: var(--skill-red); }
          
          .dashboard-layout { flex-grow: 1; display: flex; justify-content: center; align-items: flex-start; padding: 40px 20px; }
          .widescreen-panel { background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 12px; padding: 40px; width: 100%; max-width: 1000px; box-shadow: 0 25px 60px rgba(0,0,0,0.8); }

          .text-center { text-align: center; }
          .mb-10 { margin-bottom: 2.5rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .inline-block { display: inline-block; }
          .title-mega { margin: 0; font-size: 2.5rem; font-weight: 800; letter-spacing: 2px; color: white;}
          .pulse-icon { animation: pulse 2s infinite; }
          @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

          /* PESTAÑAS */
          .tabs-container { display: flex; gap: 10px; overflow-x: auto; margin-bottom: 30px; border-bottom: 1px solid var(--border-color); padding-bottom: 2px; }
          .tabs-container::-webkit-scrollbar { height: 4px; }
          .tabs-container::-webkit-scrollbar-track { background: transparent; }
          .tabs-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

          .tab-button { background: transparent; color: var(--text-muted); border: none; border-bottom: 3px solid transparent; padding: 12px 20px; cursor: pointer; font-weight: 800; font-size: 1rem; letter-spacing: 1.5px; transition: all 0.3s; white-space: nowrap; }
          .tab-button:hover { color: var(--text-main); }
          .tab-button.active { color: var(--skill-red); border-bottom-color: var(--skill-red); text-shadow: 0 0 10px rgba(255, 42, 42, 0.3); }

          .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 0; color: var(--text-muted); text-align: center; }
          .empty-state h3 { font-family: 'Impact', sans-serif; font-size: 1.8rem; letter-spacing: 1px; margin-bottom: 10px; color: var(--text-main); }
          
          .loading-text { color: var(--text-muted); font-weight: bold; display: flex; align-items: center; gap: 10px; justify-content: center; margin: 50px 0;}
          .dot-blink { width: 10px; height: 10px; background: var(--skill-red); border-radius: 50%; animation: blink 1s infinite; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

          /* BARRA DE PROGRESO */
          .progress-section { margin-bottom: 40px; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); }
          .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-weight: 800; font-size: 0.9rem; letter-spacing: 1px; color: var(--text-main); }
          .progress-percent { font-family: 'Impact', sans-serif; font-size: 1.5rem; }
          .progress-bar-bg { width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
          .progress-bar-fill { height: 100%; background: var(--skill-red); box-shadow: 0 0 10px var(--skill-red-glow); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }

          /* GRID DE EJERCICIOS */
          .ejercicios-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
          
          .slide-up { animation: slideUp 0.4s ease-out; }
          @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

          .ejercicio-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 25px; transition: all 0.3s; display: flex; flex-direction: column; }
          .ejercicio-card:hover { border-color: rgba(255,255,255,0.1); transform: translateY(-3px); }
          .ejercicio-card.completado { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.02); opacity: 0.8; }

          .ejercicio-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .musculo-badge { background: rgba(255,255,255,0.05); color: var(--text-muted); padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
          .ejercicio-nombre { margin: 0 0 20px 0; font-size: 1.4rem; color: var(--text-main); font-weight: 800; line-height: 1.2; }

          .ejercicio-stats { display: flex; gap: 20px; margin-bottom: 25px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; }
          .stat-box { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-main); font-weight: 600; }
          .ejercicio-action { display: flex; gap: 15px; align-items: center; margin-top: auto; }
          
          .input-group { position: relative; flex-grow: 1; }
          .peso-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: white; padding: 12px 15px; border-radius: 6px; font-size: 1.1rem; font-weight: bold; outline: none; transition: border-color 0.3s; box-sizing: border-box; }
          .peso-input:focus { border-color: var(--skill-red); }
          .peso-input:disabled { background: rgba(0,0,0,0.1); color: var(--text-muted); cursor: not-allowed; }
          .unidad-label { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.8rem; font-weight: bold; }

          .btn-guardar { background: var(--skill-red); color: white; border: none; padding: 12px 20px; border-radius: 6px; font-weight: 800; font-size: 0.9rem; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255,42,42,0.2); }
          .btn-guardar:hover { background: #FF3B3B; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,42,42,0.4); }
          .btn-completado { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); padding: 12px 20px; border-radius: 6px; font-weight: 800; font-size: 0.9rem; letter-spacing: 1px; width: 100px; text-align: center; }

          input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }

          @media (max-width: 768px) {
            .wide-header {
              padding: 15px 20px;
              flex-direction: column;
              gap: 15px;
            }
            .btn-back-skill {
              width: 100%;
              justify-content: center;
              padding: 12px;
            }
            .text-tc { display: none; }
            .logo-text { font-size: 1.8rem; }

            .dashboard-layout {
              padding: 15px 10px;
            }
            .widescreen-panel {
              padding: 20px 15px; /
              border-radius: 8px;
            }

            .title-mega { font-size: 1.6rem; text-align: center; }
            .mb-10 { margin-bottom: 1.5rem; }
            .pulse-icon { width: 28px; height: 28px; }

            .tab-button {
              padding: 10px 15px;
              font-size: 0.85rem;
            }

            .ejercicios-grid {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            .ejercicio-card {
              padding: 15px;/
            }
            .ejercicio-nombre {
              font-size: 1.25rem;
              margin-bottom: 15px;
            }
            
            .ejercicio-stats {
              flex-wrap: wrap; 
              gap: 15px;
              padding-bottom: 15px;
              margin-bottom: 15px;
            }

            .ejercicio-action {
              gap: 10px;
            }
            .peso-input {
              padding: 12px 10px 12px 15px;
              font-size: 16px;
            }
            .btn-guardar {
              flex-grow: 1;
              padding: 12px;
              font-size: 0.85rem;
              justify-content: center;
            }
            .btn-completado {
              width: 100%;
            }
          }

          @media (max-width: 480px) {
            .ejercicio-action {
              flex-direction: column;
            }
            .input-group { width: 100%; }
            .btn-guardar { width: 100%; margin-top: 5px; }
          }
        `}
      </style>
    </div>
  );
}