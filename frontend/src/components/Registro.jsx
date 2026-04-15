import { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import { ArrowLeft, Camera, RefreshCcw, UserPlus, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';

export default function Registro() {
  const navigate = useNavigate();
  const location = useLocation();
  const webcamRef = useRef(null);
  
  const [formData, setFormData] = useState({ rut: '', nombre: '', fecha_nacimiento: '', password: '' });
  const [planSeleccionado, setPlanSeleccionado] = useState(location.state?.planElegido || 'BASICA');
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const capturarFoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFoto(imageSrc);
  }, [webcamRef]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new Blob([u8arr], {type:mime});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foto) {
      setMensaje({ texto: 'Debes capturar tu rostro para el acceso a la puerta.', tipo: 'error' });
      return;
    }

    setLoading(true);
    setMensaje({ texto: 'Procesando registro y preparando pago de Mercado Pago...', tipo: 'info' });

    try {
      const submitData = new FormData();
      submitData.append('rut', formData.rut);
      submitData.append('nombre', formData.nombre);
      submitData.append('fecha_nacimiento', formData.fecha_nacimiento);
      submitData.append('password', formData.password);
      submitData.append('tipo_plan', planSeleccionado); 
      
      const archivoFoto = dataURLtoBlob(foto);
      submitData.append('foto', archivoFoto, 'perfil.jpg');

      // datos enviados a django
      const respuesta = await axios.post('http://127.0.0.1:8000/api/acceso/registrar/', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // link mercadopago
      if (respuesta.data.url_pago) {
        setMensaje({ texto: '¡Registro listo! Llevándote a la pasarela de pago seguro...', tipo: 'exito' });
        
        setTimeout(() => {
          window.location.href = respuesta.data.url_pago;
        }, 1500); 

      } else {
        // Fallback
        setMensaje({ texto: respuesta.data.mensaje || 'Registro exitoso', tipo: 'exito' });
        setTimeout(() => navigate('/login'), 2000);
      }

    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al conectar con el servidor';
      setMensaje({ texto: errorMsg, tipo: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="registro-container full-screen">
      
      {/*Header */}
      <header className="kiosco-header">
        <button onClick={() => navigate('/')} className="btn-logout" style={{margin: 0, padding: '10px 20px'}}>
          <ArrowLeft size={20} /> <span className="hide-mobile">VOLVER AL INICIO</span>
        </button>
        <div className="logo-container">
            <span className="text-skill-red italic-logo">SKILL</span>
            <span className="text-tc">TRAINING CENTER</span>
        </div>
        <div className="kiosco-status-top" style={{ width: '160px', textAlign: 'right' }}>
            <span className="badge-rol">PORTAL INSCRIPCIÓN</span>
        </div>
      </header>

      <main className="main-content" style={{ padding: '40px 15px', alignItems: 'flex-start' }}>
        <div className="card-registro box-glow fade-in-up" style={{ maxWidth: '1000px' }}>
          
          <div className="card-header">
            <h2>ÚNETE A SKILL</h2>
            <p>Selecciona tu plan, ingresa tus datos y configura tu acceso facial.</p>
          </div>

          {mensaje.texto && (
            <div className={`alerta ${mensaje.tipo}`}>
              {mensaje.tipo === 'error' && <AlertCircle size={24} className="shrink-0" />}
              {mensaje.tipo === 'exito' && <CheckCircle2 size={24} className="shrink-0" />}
              {mensaje.tipo === 'info' && <RefreshCcw size={24} className="animate-spin shrink-0" />}
              <span>{mensaje.texto}</span>
            </div>
          )}

          <div className="registro-grid">
            
            {/* lado izq plan y form*/}
            <div className="form-section">
              
              {/* Planes*/}
              <h3 className="section-title">1. ELIGE TU SUSCRIPCIÓN (30 DÍAS)</h3>
              <div className="planes-grid">
                
                <div className={`plan-card ${planSeleccionado === 'BASICA' ? 'selected' : ''}`} onClick={() => setPlanSeleccionado('BASICA')}>
                  <h4>BÁSICA</h4>
                  <p className="precio">$25.000</p>
                  <span className="check-indicator"><CheckCircle2 size={18} /></span>
                </div>

                <div className={`plan-card ${planSeleccionado === 'VIDA_SANA' ? 'selected' : ''}`} onClick={() => setPlanSeleccionado('VIDA_SANA')}>
                  <h4>VIDA SANA</h4>
                  <p className="precio text-skill-red">$30.000</p>
                  <span className="check-indicator"><CheckCircle2 size={18} /></span>
                </div>

                <div className={`plan-card ${planSeleccionado === 'RENDIMIENTO' ? 'selected' : ''}`} onClick={() => setPlanSeleccionado('RENDIMIENTO')}>
                  <h4>RENDIMIENTO</h4>
                  <p className="precio text-green">$40.000</p>
                  <span className="check-indicator"><CheckCircle2 size={18} /></span>
                </div>

              </div>

              <h3 className="section-title" style={{marginTop: '25px'}}>2. TUS DATOS DE ACCESO</h3>
              <form id="registroForm" onSubmit={handleSubmit} className="form-grid" style={{ gap: '15px' }}>
                
                <div className="input-group">
                  <label>RUT</label>
                  <input type="text" name="rut" value={formData.rut} onChange={handleChange} required placeholder="Ej: 12345678-9" className="skill-input" />
                </div>
                
                <div className="input-group">
                  <label>NOMBRE COMPLETO</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Tus nombres y apellidos" className="skill-input" />
                </div>

                <div className="two-col-grid">
                  <div className="input-group">
                    <label>FECHA DE NACIMIENTO</label>
                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className="skill-input date-input" />
                  </div>
                  
                  <div className="input-group">
                    <label>CREA TU CONTRASEÑA</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="skill-input" />
                  </div>
                </div>
              </form>
            </div>

            {/* lado derec cam y pago */}
            <div className="camera-section">
              <h3 className="section-title">3. ESCÁNER DE PUERTA</h3>
              <div className="camera-frame">
                {!foto ? (
                  <>
                    <div className="video-wrapper">
                      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-view" videoConstraints={{ facingMode: "user" }} />
                      <div className="focus-frame"></div>
                    </div>
                    <button onClick={capturarFoto} type="button" className="btn-action btn-blue mt-10">
                      <Camera size={20} /> TOMAR FOTO FACIAL
                    </button>
                  </>
                ) : (
                  <>
                    <div className="video-wrapper">
                      <img src={foto} alt="Captura" className="foto-preview" />
                    </div>
                    <button onClick={() => setFoto(null)} type="button" className="btn-action btn-red mt-10">
                      <RefreshCcw size={20} /> REPETIR FOTO
                    </button>
                  </>
                )}
              </div>

              <button type="submit" form="registroForm" disabled={loading} className={`btn-deploy mt-20 ${loading ? 'btn-disabled' : ''}`} style={{ padding: '20px' }}>
                {loading ? (
                  <><RefreshCcw size={24} className="animate-spin shrink-0"/> PROCESANDO...</>
                ) : (
                  <><CreditCard size={24} className="shrink-0" /> PAGAR E INSCRIBIRSE</>
                )}
              </button>
            </div>

          </div>
        </div>
      </main>

      <style>
        {`
          :root {
            --bg-dark: #0B0E14; --bg-panel: #11151C; --skill-red: #FF2A2A; --skill-red-glow: rgba(255, 42, 42, 0.4);
            --text-main: #FFFFFF; --text-muted: #A0AEC0; --border-color: rgba(255, 255, 255, 0.05); --green-color: #22C55E;
          }
          .full-screen { min-height: 100vh; background-color: var(--bg-dark); color: var(--text-main); font-family: 'Inter', system-ui, sans-serif; }
          .registro-container { display: flex; flex-direction: column; position: relative; background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 30px 30px; }
          
          .kiosco-header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-panel); border-bottom: 1px solid var(--border-color); }
          .italic-logo { font-style: italic; font-weight: 900; font-family: 'Impact'; font-size: 2.2rem; }
          .text-skill-red { color: var(--skill-red); text-shadow: 0 0 10px var(--skill-red-glow); }
          .text-tc { display: block; color: var(--text-main); font-size: 0.7rem; letter-spacing: 4px; margin-top: -5px; }
          .badge-rol { background: rgba(255, 42, 42, 0.1); color: var(--skill-red); border: 1px solid rgba(255, 42, 42, 0.3); padding: 5px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;}
          .btn-logout { background: transparent; color: var(--text-muted); border: 1px solid rgba(255, 42, 42, 0.3); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: bold; transition: 0.3s; }
          .btn-logout:hover { background: rgba(255, 42, 42, 0.1); color: var(--skill-red); border-color: var(--skill-red); }

          .main-content { flex: 1; display: flex; justify-content: center; align-items: center; }
          .card-registro { background-color: var(--bg-panel); width: 100%; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; position: relative; }
          .box-glow { box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
          .card-registro::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--skill-red); box-shadow: 0 0 15px var(--skill-red); }
          
          .card-header { padding: 30px 30px 15px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.02); }
          .card-header h2 { margin: 0; font-family: 'Impact', sans-serif; font-size: 2rem; letter-spacing: 1.5px; color: var(--text-main); }
          .card-header p { margin: 10px 0 0 0; color: var(--text-muted); font-size: 1rem; font-weight: bold;}
          
          .registro-grid { display: grid; grid-template-columns: 1.2fr 1fr; padding: 25px; gap: 30px; }
          
          /*PLANES*/
          .section-title { font-size: 0.85rem; color: var(--text-muted); letter-spacing: 1.5px; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;}
          .planes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
          
          .plan-card { 
            background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
          }
          .plan-card:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.02); }
          .plan-card h4 { margin: 0 0 5px 0; font-size: 0.85rem; color: var(--text-main); font-weight: 800; letter-spacing: 1px;}
          .plan-card .precio { margin: 0; font-size: 1.2rem; font-weight: 900; font-family: 'Impact'; }
          .text-green { color: var(--green-color); }
          
          .check-indicator { position: absolute; top: -20px; right: 10px; color: var(--green-color); opacity: 0; transition: 0.3s; }
          .plan-card.selected { border-color: var(--green-color); background: rgba(34, 197, 94, 0.05); transform: translateY(-3px); box-shadow: 0 5px 15px rgba(34, 197, 94, 0.15);}
          .plan-card.selected .check-indicator { top: 10px; opacity: 1; }

          /* form y cAMARA  */
          .form-grid { display: flex; flex-direction: column; }
          .two-col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; } /* 👈 NUEVA CLASE */
          .input-group { display: flex; flex-direction: column; gap: 8px; }
          .input-group label { font-weight: bold; color: var(--text-muted); font-size: 0.75rem; letter-spacing: 1px; }
          .skill-input { width: 100%; padding: 12px 15px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: white; transition: all 0.3s; outline: none; box-sizing: border-box; }
          .date-input { color-scheme: dark; }
          .skill-input:focus { border-color: var(--skill-red); box-shadow: 0 0 10px rgba(255,42,42,0.2); }

          .camera-section { display: flex; flex-direction: column; }
          .camera-frame { background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1); display: flex; flex-direction: column; }
          .video-wrapper { position: relative; width: 100%; aspect-ratio: 4/3; border-radius: 8px; overflow: hidden; background: #000; }
          .webcam-view, .foto-preview { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); display: block; }
          .foto-preview { border: 2px solid var(--green-color); transform: scaleX(1); }
          .focus-frame { position: absolute; top: 15%; left: 15%; right: 15%; bottom: 15%; border: 2px dashed rgba(255, 255, 255, 0.3); border-radius: 50%; pointer-events: none; }

          .btn-action { width: 100%; padding: 12px; border: none; border-radius: 8px; font-weight: bold; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: white; transition: all 0.2s; letter-spacing: 1px; }
          .btn-blue { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-main); }
          .btn-blue:hover { background: rgba(255,255,255,0.1); border-color: var(--text-main); }
          .btn-red { background: rgba(255, 42, 42, 0.1); border: 1px solid rgba(255, 42, 42, 0.3); color: var(--skill-red); }
          .btn-red:hover { background: rgba(255, 42, 42, 0.2); border-color: var(--skill-red); }

          .btn-deploy { background: var(--skill-red); color: white; border: none; border-radius: 8px; font-weight: 900; font-size: 1.1rem; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255,42,42,0.2); width: 100%; }
          .btn-deploy:hover:not(.btn-disabled) { background: #FF3B3B; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,42,42,0.4); }
          .btn-disabled { opacity: 0.7; cursor: not-allowed; background: #555; box-shadow: none; }

          .mt-10 { margin-top: 15px; } .mt-20 { margin-top: 20px; }
          .shrink-0 { flex-shrink: 0; }

          .alerta { margin: 0 30px; padding: 15px 20px; border-radius: 8px; display: flex; align-items: center; gap: 12px; font-weight: bold; font-size: 0.95rem; animation: fadeIn 0.3s ease; }
          .error { background: rgba(255,42,42,0.1); color: var(--skill-red); border: 1px solid rgba(255,42,42,0.3); }
          .exito { background: rgba(34,197,94,0.1); color: var(--green-color); border: 1px solid rgba(34,197,94,0.3); }
          .info  { background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); }

          /*animaciones*/
          .fade-in-up { animation: slideUp 0.5s ease-out; }
          @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }


          @media (max-width: 900px) {
            .registro-grid { grid-template-columns: 1fr; gap: 40px; }
            .kiosco-header { padding: 15px 20px; }
          }

          @media (max-width: 768px) {
            .main-content { padding: 20px 10px; }
            .kiosco-header { flex-direction: column; gap: 15px; text-align: center; }
            .kiosco-status-top { display: none; }
            .btn-logout { width: 100%; justify-content: center; }
            .hide-mobile { display: none; }

            .card-header { padding: 20px 15px 10px; }
            .card-header h2 { font-size: 1.6rem; }
            
            .registro-grid { padding: 15px; gap: 30px; }
            .planes-grid { grid-template-columns: 1fr; }
            .two-col-grid { grid-template-columns: 1fr; }
            
            .camera-frame { padding: 10px; }
            .alerta { margin: 0 15px; font-size: 0.85rem; }
            .btn-deploy { font-size: 1rem; padding: 15px !important; }
          }
        `}
      </style>
    </div>
  );
}