import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, UploadCloud, ScanLine, Flame, Beef, Wheat, Droplet } from 'lucide-react';
import axios from 'axios';

export default function CamaraFitness() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [imagenUrl, setImagenUrl] = useState(null);
  const [archivoOriginal, setArchivoOriginal] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorIA, setErrorIA] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoOriginal(file);
      const imageUrl = URL.createObjectURL(file);
      setImagenUrl(imageUrl);
      setResultado(null);
      setErrorIA(null);
    }
  };

  const analizarComida = async () => {
    if (!archivoOriginal) return;
    
    setIsScanning(true);
    setErrorIA(null);
    
    try {
      const formData = new FormData();
      formData.append('imagen', archivoOriginal);

      const respuesta = await axios.post('http://127.0.0.1:8000/api/acceso/analizar-comida/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResultado(respuesta.data);
    } catch (error) {
      console.error("Error en la conexión con IA:", error);
      setErrorIA("Interferencia en la señal. La red neuronal no pudo procesar la imagen.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="camara-container full-screen">
      {/* HEADER */}
      <header className="camara-header wide-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back-skill">
          <ArrowLeft size={18} /> VOLVER AL PORTAL
        </button>
        <h1 className="header-title">
          <span className="text-skill-red italic-logo">SKILL</span> <span className="text-white font-light text-tc">TRAINING CENTER</span>
        </h1>
      </header>

      <main className="camara-main dashboard-layout">
        <div className="vision-panel glass-panel widescreen-panel">
          
          <div className="panel-header text-center mb-10">
            <ScanLine className="text-skill-red pulse-icon inline-block mb-2" size={32} />
            <h2 className="title-mega">ESCÁNER NUTRICIONAL</h2>
            <p className="panel-desc large-desc">Carga la imagen en el sistema para analizar su composición molecular y macronutrientes en tiempo real.</p>
          </div>

          <div className="split-view">
            
            {/* lado izq VISOR */}
            <div className="visor-section">
              <div className="visor-area large-visor">
                {!imagenUrl ? (
                  <div className="visor-empty">
                    <Camera size={60} className="text-gray-light mb-4" />
                    <p className="tracking-widest">ESPERANDO ENTRADA VISUAL...</p>
                  </div>
                ) : (
                  <div className="visor-image-container">
                    <img src={imagenUrl} alt="Comida a analizar" className="comida-img" />
                    {isScanning && <div className="laser-scanner"></div>}
                    
                    <div className="target-corner top-left"></div>
                    <div className="target-corner top-right"></div>
                    <div className="target-corner bottom-left"></div>
                    <div className="target-corner bottom-right"></div>
                  </div>
                )}
              </div>
            </div>

            {/* lado drecho CONTROLES Y RESULTADOS */}
            <div className="control-section">
              <div className="control-buttons flex-col">
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }}/>
                <button className="btn-skill-outline btn-huge" onClick={() => fileInputRef.current.click()}>
                  <UploadCloud size={24} /> {imagenUrl ? 'RECALIBRAR IMAGEN (CAMBIAR)' : 'SELECCIONAR / CAPTURAR'}
                </button>

                {imagenUrl && !resultado && !isScanning && (
                  <button className="btn-skill-solid btn-huge mt-4" onClick={analizarComida}>
                    <ScanLine size={24} /> INICIAR SISTEMA IA
                  </button>
                )}

                {isScanning && (
                  <div className="scanning-status btn-huge mt-4">
                    <span className="dot-blink"></span> PROCESANDO RED NEURONAL...
                  </div>
                )}

                {errorIA && (
                  <div className="error-box mt-4">
                    {errorIA}
                  </div>
                )}
              </div>

              {/* RESULTADOS IA */}
              {resultado && (
                <div className="results-panel slide-up mt-8">
                  <h3 className="text-white result-title">{resultado.comida.toUpperCase()}</h3>
                  
                  <div className="macros-grid large-grid">
                    <div className="macro-box box-cal">
                      <Flame className="text-skill-red" size={28}/>
                      <span className="macro-value">{resultado.calorias}</span>
                      <span className="macro-label">KCAL</span>
                    </div>
                    <div className="macro-box">
                      <Beef className="text-prot" size={28}/>
                      <span className="macro-value">{resultado.macros.proteinas}</span>
                      <span className="macro-label">PROT</span>
                    </div>
                    <div className="macro-box">
                      <Wheat className="text-carb" size={28}/>
                      <span className="macro-value">{resultado.macros.carbos}</span>
                      <span className="macro-label">CARB</span>
                    </div>
                    <div className="macro-box">
                      <Droplet className="text-gras" size={28}/>
                      <span className="macro-value">{resultado.macros.grasas}</span>
                      <span className="macro-label">GRAS</span>
                    </div>
                  </div>

                  <div className="ai-comment large-comment">
                    <strong className="text-skill-red"> ANÁLISIS DE SISTEMA:</strong> {resultado.comentario}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <style>
        {`
          :root { 
            --neon-red: #ff2a2a; 
            --neon-red-glow: rgba(255, 42, 42, 0.6);
          }

          html, body { 
            margin: 0; padding: 0; 
            max-width: 100vw; 
            overflow-x: hidden; 
            background-color: #0B0E14;
          }
          * { box-sizing: border-box; }

          .full-screen {
            min-height: 100vh;
            width: 100%;
            background-color: #0B0E14; 
            color: #E2E8F0;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
          }

          .text-skill-red { color: #FF2A2A;text-shadow: 0 0 10px var(--neon-red-glow); }
          .text-white { color: #FFFFFF; }
          .text-gray-light { color: #A0AEC0; }
          .text-prot { color: #3b82f6; } 
          .text-carb { color: #eab308; } 
          .text-gras { color: #22c55e; } 
          
          .font-light { font-weight: 300; }
          .italic-logo { font-style: italic; font-weight: 900; }
          .text-tc { color: white; font-family: 'Arial', sans-serif; font-style: normal; font-size: 0.8rem; letter-spacing: 4px; text-shadow: none;}

          .mt-4 { margin-top: 1rem; }
          .mt-8 { margin-top: 2rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-10 { margin-bottom: 2.5rem; }
          .text-center { text-align: center; }
          .inline-block { display: inline-block; }
          .tracking-widest { letter-spacing: 0.1em; }
          .flex-col { display: flex; flex-direction: column; }

          .wide-header {
            padding: 20px 50px;
            display: flex;
            justify-content: space-between; 
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            background: #0B0E14;
            z-index: 10;
          }

          .btn-back-skill {
            display: flex; align-items: center; gap: 8px;
            background: transparent; color: #A0AEC0;
            border: 1px solid rgba(255,42,42,0.3);
            padding: 10px 20px; border-radius: 4px;
            cursor: pointer; font-weight: 600; transition: all 0.3s;
            font-size: 0.9rem; letter-spacing: 1px;
          }
          .btn-back-skill:hover { border-color: #FF2A2A; color: #FF2A2A; }

          .header-title { font-family: 'Impact', sans-serif; font-size: 2rem; margin: 0; }

          .dashboard-layout {
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 40px 20px;
          }

          .widescreen-panel {
            background: #11151C; 
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 40px;
            width: 100%;
            max-width: 1200px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.8);
          }

          .title-mega { margin: 0; font-size: 2.5rem; font-weight: 800; letter-spacing: 2px; color: white;}
          .large-desc { color: #A0AEC0; font-size: 1.1rem; max-width: 700px; margin: 10px auto 0;}

          .split-view { display: grid; grid-template-columns: 1fr; gap: 40px; }
          @media (min-width: 900px) {
            .split-view { grid-template-columns: 1fr 1fr; align-items: start; }
          }

          /* VISOR */
          .large-visor {
            width: 100%; aspect-ratio: 4 / 3;
            background: #000; border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.1);
            position: relative; overflow: hidden;
            display: flex; justify-content: center; align-items: center;
          }

          .visor-empty { text-align: center; color: #4A5568; display: flex; flex-direction: column; align-items: center;}
          .visor-image-container { position: relative; width: 100%; height: 100%; }
          .comida-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; filter: contrast(1.1); }

          .target-corner { position: absolute; width: 40px; height: 40px; border-color: #FF2A2A; border-style: solid; z-index: 10;}
          .top-left { top: 20px; left: 20px; border-width: 3px 0 0 3px; }
          .top-right { top: 20px; right: 20px; border-width: 3px 3px 0 0; }
          .bottom-left { bottom: 20px; left: 20px; border-width: 0 0 3px 3px; }
          .bottom-right { bottom: 20px; right: 20px; border-width: 0 3px 3px 0; }

          .laser-scanner {
            position: absolute; left: 0; width: 100%; height: 3px;
            background: #FF2A2A; box-shadow: 0 0 15px #FF2A2A, 0 0 30px #FF2A2A;
            z-index: 15;
            animation: scanSmooth 2.5s ease-in-out infinite alternate;
          }
          @keyframes scanSmooth {
            0% { top: 0%; }
            100% { top: 98%; } /* Ahora viaja desde el 0% al 98% del contenedor sin importar su tamaño */
          }

          .btn-huge {
            width: 100%; padding: 18px; font-size: 1.1rem; font-weight: 800; border-radius: 6px;
            display: flex; justify-content: center; align-items: center; gap: 12px;
            cursor: pointer; transition: all 0.2s; letter-spacing: 1px;
          }
          
          .btn-skill-outline {
            background: transparent; color: #FFFFFF;
            border: 2px solid rgba(255,255,255,0.2);
          }
          .btn-skill-outline:hover { border-color: #FFFFFF; background: rgba(255,255,255,0.05); }

          .btn-skill-solid {
            background: #FF2A2A; color: #FFFFFF; border: none;
            box-shadow: 0 4px 15px rgba(255,42,42,0.3);
          }
          .btn-skill-solid:hover { background: #FF3B3B; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,42,42,0.4); }

          .scanning-status {
            background: rgba(255,42,42,0.1); border: 1px solid rgba(255,42,42,0.3);
            color: #FF2A2A; font-weight: bold; text-align: center;
          }

          .error-box {
            background: rgba(255, 42, 42, 0.1); border: 1px solid #FF2A2A;
            color: #FF2A2A; padding: 15px; text-align: center; border-radius: 6px; font-weight: bold;
          }

          .dot-blink { width: 10px; height: 10px; background: #FF2A2A; border-radius: 50%; box-shadow: 0 0 10px #FF2A2A; animation: blink 1s infinite; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

          /* RESULTADOS */
          .results-panel {
            background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05);
            border-radius: 8px; padding: 30px;
          }
          .result-title { margin: 0 0 20px 0; font-size: 1.5rem; font-weight: 800; letter-spacing: 1px; }

          .large-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
          @media (min-width: 1200px) { .large-grid { grid-template-columns: repeat(4, 1fr); } }
          
          .macro-box {
            background: rgba(255,255,255,0.02); padding: 20px 10px; border-radius: 8px;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
            border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s;
          }
          .box-cal { border-color: rgba(255,42,42,0.2); background: rgba(255,42,42,0.05); }

          .macro-value { font-family: 'Impact', sans-serif; font-size: 2rem; color: white; }
          .macro-label { font-size: 0.9rem; color: #A0AEC0; font-weight: bold; letter-spacing: 1px; }

          .large-comment {
            font-size: 1rem; color: #E2E8F0; line-height: 1.6; padding: 20px; 
            background: rgba(255,255,255,0.02); border-left: 3px solid #FF2A2A; border-radius: 0 6px 6px 0; 
          }

          .pulse-icon { animation: pulse 2s infinite; }
          @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
          
          .slide-up { animation: slideUp 0.5s ease-out; }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

          @media (max-width: 768px) {
            .wide-header {
              flex-direction: column;
              gap: 15px;
              padding: 15px 20px;
            }
            .btn-back-skill {
              width: 100%;
              justify-content: center;
            }
            .text-tc { display: none; }
            .header-title { font-size: 1.8rem; text-align: center; }

            .dashboard-layout { padding: 15px 10px; }
            .widescreen-panel { padding: 20px 15px; border-radius: 8px; }
            
            .title-mega { font-size: 1.6rem; }
            .large-desc { font-size: 0.95rem; margin-bottom: 20px; }
            
            .split-view { gap: 20px; }          

            .btn-huge { padding: 15px; font-size: 0.95rem; }
            .visor-empty p { font-size: 0.75rem; }
            .scanning-status { font-size: 0.85rem; padding: 15px; }

            .results-panel { padding: 20px 15px; }
            .result-title { font-size: 1.3rem; text-align: center; }
            
            .large-grid { gap: 10px; }
            .macro-value { font-size: 1.5rem; }
            .macro-box { padding: 12px 5px; }
            
            .large-comment { padding: 15px; font-size: 0.9rem; }
          }
        `}
      </style>
    </div>
  );
}