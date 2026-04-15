import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, LogIn, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [credenciales, setCredenciales] = useState({ rut: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 


  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioSkill');
    if (usuarioGuardado) {
      navigate('/dashboard');
    }
  }, [navigate])

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const respuesta = await axios.post('http://127.0.0.1:8000/api/acceso/login/', credenciales);

      if (respuesta.data.exito) {
        localStorage.setItem('usuarioSkill', JSON.stringify(respuesta.data.datos));
        navigate('/dashboard'); 
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container full-screen">
      
      {/* btn volver */}
      <button onClick={() => navigate('/')} className="btn-back-floating">
        <ArrowLeft size={20} /> VOLVER
      </button>

      <div className="login-card fade-in-up">
        
        <div className="login-header">
          <div className="logo-container">
            <h1 className="logo-text text-skill-red">SKILL</h1>
            <span className="logo-subtext">TRAINING CENTER</span>
          </div>
          <div className="badge-rol" style={{marginTop: '15px', display: 'inline-block'}}>PORTAL DE ACCESO</div>
        </div>


        {/*FORM Login*/}
        <form onSubmit={handleLogin} className="login-form">
          
          {error && (
            <div className="error-alert shake-animation">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label>RUT DE USUARIO</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input type="text" name="rut" value={credenciales.rut} onChange={handleChange} placeholder="Ej: 12345678-9" required className="skill-input"/>
            </div>
          </div>

          <div className="input-group">
            <label>CONTRASEÑA</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input type="password" name="password" value={credenciales.password} onChange={handleChange} placeholder="••••••••" required className="skill-input"/>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-deploy mt-20">
            {loading ? (
              <>INICIANDO SESIÓN <span className="dot-blink" style={{marginLeft: '10px'}}></span></>
            ) : (
              <>INGRESAR AL SISTEMA <LogIn size={20} /></>
            )}
          </button>

        </form>

        <div className="login-footer">
          <p>¿Olvidaste tu contraseña? <br/><span className="text-skill-red" style={{cursor: 'pointer'}}>Solicítala en recepción</span></p>
        </div>
      </div>

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
            margin: 0;
            padding: 0;
            max-width: 100vw;
            overflow-x: hidden;
            background-color: var(--bg-dark);
          }
          * { box-sizing: border-box; }

          .full-screen { 
            min-height: 100vh; 
            width: 100%;
            background-color: var(--bg-dark); 
            color: var(--text-main); 
            font-family: 'Inter', system-ui, sans-serif; 
          }

          .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 30px 30px;
            padding: 20px;
          }

          .btn-back-floating {
            position: absolute;
            top: 30px;
            left: 30px;
            background: transparent;
            color: var(--text-muted);
            border: 1px solid rgba(255, 42, 42, 0.3);
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
            z-index: 10;
          }
          .btn-back-floating:hover {
            background: rgba(255, 42, 42, 0.1);
            color: var(--skill-red);
            border-color: var(--skill-red);
          }

          .login-card {
            background: var(--bg-panel);
            width: 100%;
            max-width: 420px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
            overflow: hidden;
            position: relative;
            z-index: 1;
          }

          .login-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 4px;
            background: var(--skill-red);
            box-shadow: 0 0 15px var(--skill-red);
          }

          .login-header {
            padding: 40px 30px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.02);
          }

          .logo-text {
            margin: 0;
            font-size: 3rem;
            font-family: 'Impact', sans-serif;
            letter-spacing: 2px;
            font-style: italic;
            text-shadow: 0 0 15px var(--skill-red-glow);
          }
          .logo-subtext { display: block; font-size: 0.8rem; letter-spacing: 4px; color: var(--text-main); margin-top: -5px; }
          .badge-rol { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid var(--border-color); padding: 5px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; letter-spacing: 1px; }

          .login-form {
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .error-alert {
            background-color: rgba(255, 42, 42, 0.1);
            color: var(--skill-red);
            border: 1px solid rgba(255, 42, 42, 0.3);
            padding: 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
            font-weight: bold;
          }

          .input-group { display: flex; flex-direction: column; gap: 8px; }
          .input-group label {
            font-weight: bold;
            color: var(--text-muted);
            font-size: 0.8rem;
            letter-spacing: 1px;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-icon {
            position: absolute;
            left: 15px;
            color: var(--text-muted);
            transition: color 0.3s;
          }

          .skill-input {
            width: 100%;
            padding: 15px 15px 15px 45px;
            background: rgba(0,0,0,0.4);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 1rem;
            color: white;
            transition: all 0.3s;
            outline: none;
            box-sizing: border-box;
          }

          .skill-input:focus {
            border-color: var(--skill-red);
            box-shadow: 0 0 10px rgba(255,42,42,0.2);
          }
          .skill-input:focus + .input-icon { color: var(--skill-red); }

          .btn-deploy { 
            background: var(--skill-red); 
            color: white; 
            border: none; 
            padding: 18px; 
            border-radius: 8px; 
            font-weight: 800; 
            font-size: 1rem; 
            letter-spacing: 1.5px; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            gap: 10px; 
            transition: all 0.2s; 
            box-shadow: 0 4px 15px rgba(255,42,42,0.2); 
            width: 100%;
          }
          .btn-deploy:hover:not(:disabled) { 
            background: #FF3B3B; 
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(255,42,42,0.4); 
          }
          .btn-deploy:disabled { opacity: 0.7; cursor: not-allowed; }
          
          .mt-20 { margin-top: 10px; }

          .dot-blink { width: 8px; height: 8px; background: white; border-radius: 50%; display: inline-block; animation: blink 1s infinite; }

          .login-footer {
            background: rgba(0,0,0,0.2);
            padding: 20px;
            text-align: center;
            font-size: 0.85rem;
            color: var(--text-muted);
            border-top: 1px solid rgba(255,255,255,0.02);
            font-weight: bold;
          }
          .text-skill-red { color: var(--skill-red); }

          /* ANIMACIONES */
          .fade-in-up { animation: slideUp 0.5s ease-out; }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .shake-animation { animation: shake 0.4s ease-in-out; }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }


          @media (max-width: 768px) {
            .login-container {
              flex-direction: column;
              padding: 20px 15px;
            }

            .btn-back-floating {
              position: relative; 
              top: 0;
              left: 0;
              align-self: flex-start;
              margin-bottom: 20px;
              width: 100%;
              justify-content: center;
            }

            .login-card {
              width: 100%;
              max-width: 100%;
            }

            .login-header {
              padding: 30px 20px 15px;
            }

            .logo-text {
              font-size: 2.5rem;
            }
            .login-form {
              padding: 20px
              gap: 15px;
            }
            .skill-input {
              padding: 12px 12px 12px 40px;
              font-size: 16px;
            }
            .btn-deploy {
              padding: 15px;
              font-size: 0.95rem;
            }
          }
        `}
      </style>
    </div>
  );
}