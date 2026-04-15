import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CreditCard, CheckCircle2, ArrowLeft, Search, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function Pagos() {
  const navigate = useNavigate();
  const [listaAlumnos, setListaAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargarPagos = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/acceso/alumnos/');
      setListaAlumnos(res.data);
    } catch (err) {
      console.error("Error cargando finanzas", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  const registrarPagoManual = async (rut, nombre) => {
    if(window.confirm(`¿Confirmas el pago manual de ${nombre}? Se sumarán 30 días a su membresía.`)) {
      try {
        await axios.post(`http://127.0.0.1:8000/api/acceso/alumnos/renovar/${rut}/`);
        alert("Pago registrado con éxito. Membresía actualizada.");
        cargarPagos(); 
      } catch (err) {
        console.error("Error registrando pago", err);
        alert("Hubo un error al registrar el pago.");
      }
    }
  };

  // KPIs
  const alumnosAlDia = listaAlumnos.filter(a => a.estado === 'Al Día');
  const alumnosMorosos = listaAlumnos.filter(a => a.estado !== 'Al Día');

  //filtro buscador
  const listaFiltrada = listaAlumnos.filter(a => 
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.rut.includes(busqueda)
  );

  return (
    <div className="pagos-container full-screen">
      {/* heeader*/}
      <header className="header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          <ArrowLeft size={20} /> AL PANEL
        </button>
        <div className="logo-container text-center" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Ir al Inicio">
          <h1 className="logo-text">SKILL</h1>
          <span className="logo-subtext">TRAINING CENTER</span>
        </div>
        <div style={{ width: '150px', textAlign: 'right' }}>
          <span className="badge-rol">TESORERÍA</span>
        </div>
      </header>

      <main className="main-content-pagos fade-in-item">
        <div className="section-title">
          <h2 style={{ margin: 0, fontFamily: 'Impact', fontSize: '2rem', letterSpacing: '1px' }}>
            MÓDULO DE FINANZAS
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Control de ingresos y estado de membresías.</p>
        </div>

        {cargando ? (
          <div className="loading-text" style={{ justifyContent: 'center', margin: '50px 0' }}>
            <span className="dot-blink"></span> Sincronizando bóveda...
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="kpi-grid">
              <div className="kpi-card glass-panel">
                <div className="kpi-icon bg-green-glow"><Users size={24} color="#22c55e" /></div>
                <div>
                  <p className="kpi-label">MEMBRESÍAS AL DÍA</p>
                  <p className="kpi-value text-green">{alumnosAlDia.length}</p>
                </div>
              </div>

              <div className="kpi-card glass-panel">
                <div className="kpi-icon bg-red-glow"><AlertCircle size={24} color="#FF2A2A" /></div>
                <div>
                  <p className="kpi-label">CUENTAS VENCIDAS</p>
                  <p className="kpi-value text-skill-red">{alumnosMorosos.length}</p>
                </div>
              </div>
              
              <div className="kpi-card glass-panel">
                <div className="kpi-icon bg-blue-glow"><TrendingUp size={24} color="#3b82f6" /></div>
                <div>
                  <p className="kpi-label">TOTAL REGISTRADOS</p>
                  <p className="kpi-value">{listaAlumnos.length}</p>
                </div>
              </div>
            </div>

            {/* GRILLA DE PANELES */}
            <div className="dt-grid">
              
              {/*morosos*/}
              <div className="dt-card">
                <div className="dt-card-header">
                  <h3><AlertCircle size={20} className="text-skill-red inline-icon"/> ACCIÓN REQUERIDA</h3>
                  <p>Cobros pendientes o cuentas vencidas.</p>
                </div>
                
                <div className="ejercicios-list">
                  {alumnosMorosos.length > 0 ? (
                    alumnosMorosos.map((alumno, index) => (
                      <div key={index} className="ejercicio-tag" style={{ justifyContent: 'space-between', borderLeft: '3px solid var(--skill-red)' }}>
                        <div>
                          <span className="ej-nombre" style={{display: 'block'}}>{alumno.nombre}</span>
                          <span className="text-muted" style={{fontSize: '0.75rem', fontFamily: 'monospace'}}>{alumno.rut}</span>
                        </div>
                        <button onClick={() => registrarPagoManual(alumno.rut, alumno.nombre)} className="btn-action btn-pay">
                          <DollarSign size={14} style={{marginRight:'5px'}}/>
                          Pago Manual
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <CheckCircle2 size={40} className="text-green opacity-50" />
                      <p>¡Excelente! No hay clientes morosos.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* registro y buscador*/}
              <div className="dt-card">
                <div className="dt-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3><CreditCard size={20} className="text-blue inline-icon"/> REGISTRO GENERAL</h3>
                    <p>Base de datos completa de clientes.</p>
                  </div>
                  
                  {/*buscador */}
                  <div className="search-box-small">
                    <Search size={16} className="search-icon" />
                    <input type="text" placeholder="Buscar RUT o Nombre..."  value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="search-input-small"/>
                  </div>
                </div>
                
                <div className="table-container glass-panel" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="skill-table">
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                      <tr>
                        <th>CLIENTE</th>
                        <th>ESTADO</th>
                        <th>VENCIMIENTO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaFiltrada.length > 0 ? (
                        listaFiltrada.map((alumno, index) => (
                          <tr key={index}>
                            <td>
                              <p className="td-name">{alumno.nombre}</p>
                              <p className="td-rut">{alumno.rut}</p>
                            </td>
                            <td>
                              <span className={`status-badge ${alumno.estado === 'Al Día' ? 'badge-green' : 'badge-red'}`}>
                                {alumno.estado.toUpperCase()}
                              </span>
                            </td>
                            <td className="td-text font-mono">{alumno.vence}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center text-muted" style={{padding: '30px'}}>
                            No se encontraron coincidencias.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}
      </main>

      <style>
        {`
          :root {
            --bg-dark: #0B0E14; --bg-panel: #11151C; --skill-red: #FF2A2A; --skill-red-glow: rgba(255, 42, 42, 0.4);
            --text-main: #FFFFFF; --text-muted: #A0AEC0; --border-color: rgba(255, 255, 255, 0.05);
          }
          
          .full-screen { min-height: 100vh; background-color: var(--bg-dark); color: var(--text-main); font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; }
          .text-skill-red { color: var(--skill-red); } .text-green { color: #22c55e; } .text-blue { color: #3b82f6; }
          .opacity-50 { opacity: 0.5; }
          
          /* HEADER */
          .header { width: 100%; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-panel); border-bottom: 1px solid var(--border-color); z-index: 10; box-sizing: border-box; }
          .btn-back { display: flex; align-items: center; gap: 10px; background: transparent; color: var(--text-muted); border: 1px solid rgba(255, 42, 42, 0.3); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s; flex-shrink: 0; }
          .btn-back:hover { background: rgba(255, 42, 42, 0.1); color: var(--skill-red); border-color: var(--skill-red); }
          .logo-container { text-align: center; }
          .logo-text { margin: 0; font-size: 2.2rem; color: var(--skill-red); font-family: 'Impact', sans-serif; letter-spacing: 2px; font-style: italic; text-shadow: 0 0 10px var(--skill-red-glow); }
          .logo-subtext { display: block; font-size: 0.7rem; letter-spacing: 4px; color: var(--text-main); margin-top: -5px;}
          .badge-rol { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid var(--border-color); padding: 5px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; letter-spacing: 1px; }

          /* CONTENIDO PRINCIPAL */
          .main-content-pagos { padding: 40px; max-width: 1400px; margin: 0 auto; width: 100%; box-sizing: border-box; flex-grow: 1; }
          .section-title { margin-bottom: 30px; }
          
          /* TARJETAS KPI */
          .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .kpi-card { background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 20px; }
          .kpi-icon { width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
          .bg-green-glow { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); }
          .bg-red-glow { background: rgba(255, 42, 42, 0.1); border: 1px solid rgba(255, 42, 42, 0.2); }
          .bg-blue-glow { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
          .kpi-label { margin: 0; font-size: 0.8rem; color: var(--text-muted); font-weight: bold; letter-spacing: 1px; }
          .kpi-value { margin: 5px 0 0 0; font-size: 2rem; font-family: 'Impact'; }

          /* GRILLA INFERIOR Y PANELES */
          .dt-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 25px; align-items: start;}
          .dt-card { background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .dt-card-header { margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;}
          .dt-card-header h3 { margin: 0; font-family: 'Impact', sans-serif; font-size: 1.2rem; letter-spacing: 1px; display: flex; align-items: center;}
          .inline-icon { margin-right: 10px; flex-shrink: 0; }
          
          /* BUSCADOR */
          .search-box-small { position: relative; display: flex; align-items: center; }
          .search-icon { position: absolute; left: 10px; color: var(--text-muted); }
          .search-input-small { background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: white; padding: 8px 10px 8px 35px; border-radius: 6px; font-size: 0.85rem; width: 220px; outline: none; transition: border-color 0.3s; }
          .search-input-small:focus { border-color: #3b82f6; }

          /* LISTAS Y TABLAS */
          .ejercicios-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto;}
          .ejercicio-tag { background: rgba(255,255,255,0.02); padding: 15px; border-radius: 6px; display: flex; align-items: center; }
          .btn-action { background: transparent; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s; font-size: 0.8rem; border: 1px solid; flex-shrink: 0; }
          .btn-pay { border-color: rgba(34,197,94,0.5); color: #22c55e; display: flex; align-items: center; }
          .btn-pay:hover { background: rgba(34,197,94,0.1); border-color: #22c55e; }
          
          .empty-state { text-align: center; padding: 40px 20px; color: var(--text-muted); }
          
          .skill-table { width: 100%; border-collapse: collapse; text-align: left; }
          .skill-table th { padding: 15px; color: var(--text-muted); font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); text-transform: uppercase; letter-spacing: 1px;}
          .skill-table td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.02); }
          .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: inline-block; white-space: nowrap;}
          .badge-green { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
          .badge-red { background: rgba(255,42,42,0.1); color: var(--skill-red); border: 1px solid rgba(255,42,42,0.2); }
          .td-name { margin: 0; font-weight: bold; font-size: 0.95rem; white-space: nowrap; }
          .td-rut { margin: 3px 0 0 0; font-size: 0.8rem; color: var(--text-muted); }
          .font-mono { font-family: monospace; white-space: nowrap;}
          
          .fade-in-item { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .dot-blink { width: 10px; height: 10px; background: var(--skill-red); border-radius: 50%; display: inline-block; animation: blink 1s infinite; margin-right: 10px; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
          
          @media (max-width: 1024px) {
            .dt-grid { grid-template-columns: 1fr; }
            .dt-card-header { flex-direction: column; gap: 15px; align-items: flex-start !important; }
            .search-box-small { width: 100%; }
            .search-input-small { width: 100%; }
          }

          @media (max-width: 768px) {
            .header { flex-direction: column; gap: 15px; padding: 20px 10px; text-align: center; }
            .header > div:last-child { display: none; }
            .btn-back { width: 100%; justify-content: center; }
            
            .main-content-pagos { padding: 20px 15px; }
            .section-title h2 { font-size: 1.8rem !important; text-align: center; }
            .section-title p { text-align: center; }
            .kpi-grid { grid-template-columns: 1fr; gap: 15px; margin-bottom: 20px; }
            
            .dt-card { padding: 15px; }
            .ejercicio-tag { flex-direction: column; gap: 15px; align-items: flex-start; }
            .btn-pay { width: 100%; justify-content: center; padding: 10px; }
            
            .table-container { border-radius: 8px; }
            .skill-table th, .skill-table td { padding: 12px 10px; font-size: 0.85rem; }
            .td-name { font-size: 0.85rem; }
            .status-badge { font-size: 0.7rem; padding: 4px 8px; }
          }
        `}
      </style>
    </div>
  );
}