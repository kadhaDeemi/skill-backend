import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import { CheckCircle2, XCircle, Scan, ArrowLeft } from 'lucide-react';

export default function Kiosco() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  };

  const verificarAcceso = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setLoading(true);

    try {
      const archivoFoto = dataURLtoBlob(imageSrc);
      const submitData = new FormData();
      submitData.append('foto', archivoFoto, 'intento_acceso.jpg');

      const respuesta = await axios.post('http://127.0.0.1:8000/api/acceso/verificar/', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (respuesta.data.mensaje.includes('Acércate')) {
        setLoading(false);
        return;
      }

      setResultado(respuesta.data);

      setTimeout(() => {
        setResultado(null);
        setLoading(false);
      }, 4000); 

    } catch (error) {
      console.error('Error del servidor:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading || resultado) return;
    const temporizador = setTimeout(() => {
      verificarAcceso();
    }, 1500);
    return () => clearTimeout(temporizador);
  }, [loading, resultado, verificarAcceso]);

  const nombreUsuario = resultado?.mensaje.replace('¡Bienvenido, ', '').replace('!', '') || '';

  return (
    <div className="kiosco-container">
      
      {/* headeer */}
      <header className="header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          <ArrowLeft size={20} /> SALIR AL PANEL
        </button>
        <div className="logo-container text-center">
          <h1 className="logo-text">SKILL</h1>
          <span className="logo-subtext">TRAINING CENTER</span>
        </div>
        <div style={{ width: '160px', textAlign: 'right' }}>
          <span className="badge-rol">TERMINAL 01</span>
        </div>
      </header>

      {/* escaneo */}
      <main className="main-content">
        <div className="camera-wrapper box-glow">
          
          <div className="camera-header">
            <Scan size={20} className="text-skill-red" />
            <span>SISTEMA DE ACCESO BIOMÉTRICO</span>
          </div>

          <div className="video-container">
            {/* camara */}
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ width: 720, height: 540, facingMode: "user" }} className={`webcam ${resultado ? (resultado.acceso ? 'border-success' : 'border-error') : 'border-scan'}`}/>
            {/* Efecto escaneando*/}
            {!resultado && (
              <div className="scanner-overlay">
                <div className="laser-line"></div>
              </div>
            )}
          </div>

          {/* Texto de estado */}
          {!resultado && (
            <div className="status-badge">
              <div className={`status-dot ${loading ? 'dot-yellow' : 'dot-red'}`}></div>
              <span>{loading ? 'ANALIZANDO IDENTIDAD...' : 'POSICIONE SU ROSTRO EN EL RECUADRO'}</span>
            </div>
          )}
        </div>
      </main>

      {/* resultado */}
      {resultado && (
        <div className={`result-overlay ${resultado.acceso ? 'bg-success' : 'bg-error'}`}>
          <div className="result-content fade-in-item">
            <div className="icon-container">
              {resultado.acceso ? (
                <CheckCircle2 size={120} className="text-green animate-pop" strokeWidth={2} />
              ) : (
                <XCircle size={120} className="text-skill-red animate-shake" strokeWidth={2} />
              )}
            </div>

            {/* Texto Principal */}
            <h1 className={`result-title ${resultado.acceso ? 'text-green-glow' : 'text-red-glow'}`}>
              {resultado.acceso ? 'ACCESO AUTORIZADO' : 'ACCESO DENEGADO'}
            </h1>
            
            {/* Nombre del usuario o mensaje de error */}
            <div className="user-card">
              <h2 className="result-subtitle">
                {resultado.acceso ? (
                  <>
                    <CheckCircle2 size={28} className="text-green" style={{ marginRight: '10px' }} />
                    {nombreUsuario}
                  </>
                ) : (
                  nombreUsuario
                )}
              </h2>
            </div>

          </div>
        </div>
      )}
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
            --green-color: #22C55E;
          }

          html, body { margin: 0; padding: 0; background-color: var(--bg-dark); overflow: hidden; }

          .kiosco-container {
            background-color: var(--bg-dark);
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            font-family: 'Inter', system-ui, sans-serif;
            overflow: hidden;
            position: relative;
            color: var(--text-main);
            box-sizing: border-box;
          }

          /* HEADER */
          .header {
            width: 100%;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-panel);
            border-bottom: 1px solid var(--border-color);
            z-index: 10;
            box-sizing: border-box;
          }

          .btn-back {
            display: flex;
            align-items: center;
            gap: 10px;
            background: transparent;
            color: var(--text-muted);
            border: 1px solid rgba(255, 42, 42, 0.3);
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
          }
          .btn-back:hover {
            background: rgba(255, 42, 42, 0.1);
            color: var(--skill-red);
            border-color: var(--skill-red);
          }

          .logo-container { text-align: center; }
          .logo-text {
            margin: 0;
            font-size: 2.2rem;
            color: var(--skill-red);
            font-family: 'Impact', sans-serif;
            letter-spacing: 2px;
            font-style: italic;
            text-shadow: 0 0 10px var(--skill-red-glow);
          }
          .logo-subtext { display: block; font-size: 0.7rem; letter-spacing: 4px; color: var(--text-main); margin-top: -5px;}
          .badge-rol { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid var(--border-color); padding: 5px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; letter-spacing: 1px; }

          .main-content {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            min-height: 0;
            box-sizing: border-box;
          }

          .camera-wrapper {
            background: var(--bg-panel);
            padding: 25px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 800px;
            width: 100%;
            max-height: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            box-sizing: border-box;
          }

          .camera-header {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            margin-bottom: 20px;
            color: var(--text-muted);
            font-size: 0.85rem;
            font-weight: bold;
            letter-spacing: 1.5px;
            justify-content: center;
            flex-shrink: 0;
          }
          .text-skill-red { color: var(--skill-red); }

          .video-container {
            position: relative;
            width: 100%;
            max-height: 60vh;
            aspect-ratio: 4/3;
            border-radius: 8px;
            overflow: hidden;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 1;
          }

          .webcam {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform: scaleX(-1);
            transition: all 0.3s ease;
            display: block;
          }
          .border-scan { border: 2px solid var(--border-color); }
          .border-success { border: 4px solid var(--green-color); box-shadow: inset 0 0 20px rgba(34,197,94,0.4); }
          .border-error { border: 4px solid var(--skill-red); box-shadow: inset 0 0 20px rgba(255,42,42,0.4); }

          /* escaneR */
          .scanner-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 5; overflow: hidden; }
          .laser-line {
            width: 100%;
            height: 2px;
            background: var(--skill-red);
            box-shadow: 0 0 15px 3px var(--skill-red);
            position: absolute;
            animation: scanMove 2.5s infinite linear;
          }

          /* STATUS BADGE */
          .status-badge {
            margin-top: 25px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border-color);
            padding: 12px 25px;
            border-radius: 30px;
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--text-main);
            font-weight: bold;
            letter-spacing: 1px;
            font-size: 0.85rem;
            flex-shrink: 0;
          }
          .status-dot { width: 10px; height: 10px; border-radius: 50%; }
          .dot-red { background: var(--skill-red); box-shadow: 0 0 10px var(--skill-red); animation: pulse 1s infinite; }
          .dot-yellow { background: #EAB308; box-shadow: 0 0 10px #EAB308; animation: pulse 0.5s infinite; }

          /* OVERLAY DE RESULTADOS*/
          .result-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(12px);
            animation: fadeInOverlay 0.3s ease;
          }
          .bg-success { background: rgba(11, 25, 20, 0.85); }
          .bg-error { background: rgba(25, 11, 11, 0.85); }

          .result-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 40px;
          }

          .icon-container { margin-bottom: 20px; }
          .text-green { color: var(--green-color); }

          .result-title {
            font-size: 4rem;
            font-family: 'Impact', sans-serif;
            margin: 0;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .text-green-glow { color: var(--green-color); text-shadow: 0 0 30px rgba(34,197,94,0.4); }
          .text-red-glow { color: var(--skill-red); text-shadow: 0 0 30px rgba(255,42,42,0.4); }

          .user-card {
            background: var(--bg-panel);
            border: 1px solid var(--border-color);
            padding: 15px 40px;
            border-radius: 50px;
            margin-top: 30px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
          }

          .result-subtitle {
            font-size: 1.8rem;
            color: var(--text-main);
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          /* ANIMACIONES */
          @keyframes scanMove { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
          @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.95); } }
          @keyframes fadeInOverlay { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(12px); } }
          .fade-in-item { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          
          .animate-pop { animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
          @keyframes pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
          
          .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
          @keyframes shake {
            10%, 90% { transform: translate3d(-2px, 0, 0); }
            20%, 80% { transform: translate3d(4px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
            40%, 60% { transform: translate3d(8px, 0, 0); }

          @media (max-width: 900px) {
            .header > div:last-child { display: none; }
          }

          @media (max-width: 768px) {
            .header {
              flex-direction: column;
              gap: 15px;
              padding: 20px 15px;
              text-align: center;
            }
            .btn-back {
              width: 100%;
              justify-content: center;
            }
            .logo-text { font-size: 2.5rem; }
            .logo-subtext { font-size: 0.65rem; }
            .main-content {
              padding: 15px;
            }
            .camera-wrapper {
              padding: 15px;
              border-radius: 8px;
            }
            .camera-header {
              font-size: 0.75rem;
              margin-bottom: 15px;
              text-align: center;
            }
            .video-container {
              max-height: 50vh; 
            }
            .status-badge {
              margin-top: 15px;
              padding: 10px 15px;
              font-size: 0.75rem;
              width: 100%;
              justify-content: center;
              text-align: center;
            }
            .result-content {
              padding: 20px;
            }

            .icon-container svg {
              width: 80px;
              height: 80px;
            }

            .result-title {
              font-size: 2.5rem;
              letter-spacing: 1px;
            }
            .user-card {
              padding: 10px 25px;
              margin-top: 20px;
            }
            .result-subtitle {
              font-size: 1.3rem;
            }
          }
          @media (max-width: 480px) {
            .result-title {
              font-size: 2rem;
            }
            .result-subtitle {
              font-size: 1.1rem;
            }
          }
          }
        `}
      </style>
    </div>
  );
}