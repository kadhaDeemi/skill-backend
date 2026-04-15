import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Bot, Dumbbell, HeartPulse, Zap, CheckCircle2, Clock, MapPin, ChevronRight, User } from 'lucide-react';

export default function App() {
  const navigate = useNavigate();
  const equipo = [
    { nombre: "Carlos R.", rol: "Preparador Físico (Fuerza)", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=200&h=200", desc: "Especialista en hipertrofia y levantamiento olímpico. Te ayudará a romper tus récords personales sin estancamientos." },
    { nombre: "Valentina M.", rol: "Preparadora Física (HIIT)", img: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=200&h=200", desc: "Alta intensidad y resistencia. Prepárate para sudar, quemar calorías y llevar tu capacidad cardiovascular al límite." },
    { nombre: "Diego S.", rol: "Preparador Físico (Movilidad)", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200&h=200", desc: "Prevención de lesiones y biomecánica. Optimiza tus rangos de movimiento para entrenar pesado y seguro." },
    { nombre: "Andrea L.", rol: "Nutricionista Deportiva", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200", desc: "Planes enfocados en recomposición corporal. Nutrición inteligente, adaptable a tu estilo de vida y sin dietas extremas." }
  ];

  const [usuarioLocal] = useState(() => {
    const usuarioGuardado = localStorage.getItem('usuarioSkill');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  const estaLogueado = !!usuarioLocal; 
  const nombreUsuario = usuarioLocal ? usuarioLocal.nombre.split(' ')[0] : '';


  const [activeTrainer, setActiveTrainer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveTrainer((prev) => (prev + 1) % equipo.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, equipo.length]);

  return (
    <div className="landing-wrapper futuristic-theme">
      
      {/* LUCES DE NEÓN DE FONDO */}
      <div className="ambient-light light-red"></div>
      <div className="ambient-light light-blue"></div>
      <div className="ambient-light light-purple"></div>

      {/* NAVBAR GLASSMORPHISM */}
      <nav className="navbar glass-panel">
        <div className="nav-container">
          <div className="nav-logo">
            SKILL <span className="logo-thin">TRAINING CENTER</span>
          </div>
          <div className="nav-links">
            <a href="#planes">Suscripciones</a>
            <a href="#equipo">Especialistas</a>
            <a href="#tecnologia">Módulos IA</a>
          </div>
          {estaLogueado ? (
            <button onClick={() => navigate('/dashboard')} className="btn-neon">
              <User size={18} /> PANEL DE {nombreUsuario.toUpperCase()}
            </button>
          ) : (
            <Link to="/login" className="btn-neon">
              <User size={18} /> PORTAL ACCESO
            </Link>
          )}
        </div>
      </nav>

      {/*Seccion hero */}
      <section className="hero-section">
        <div className="hero-bg-container">
          <div className="hero-bg"></div>
        </div>
        <div className="hero-overlay-dark"></div>
        <div className="hero-content">
          <div className="badge-tech glass-badge">
            <span className="dot-blink"></span> PROTOCOLO DE ENTRENAMIENTO ACTIVO
          </div>
          <h1 className="hero-title">
            DESATA TU <br />
            <span className="text-neon-red">MÁXIMO POTENCIAL</span>
          </h1>
          <p className="hero-subtitle text-glow">
            Interfaz humana-digital. Entrena con preparadores de élite y optimiza tu evolución con Inteligencia Artificial y Biometría Integrada.
          </p>
          <div className="hero-actions">
            <a href="#planes" className="btn-solid-neon">INICIAR SISTEMA <ChevronRight size={20}/></a>
          </div>
        </div>
      </section>

      {/* Cinta dinamica */}
      <div className="marquee-container">
        <div className="marquee-content">
          <span>ENTRENAMIENTO PERSONALIZADO 🟢</span><span> AMBIENTE FAMILIAR 🟢</span><span> ANÁLISIS NUTRICIONAL 🟢</span><span> EQUILIBRIO DE LA VIDA 🟢</span>
          <span>ENTRENAMIENTO PERSONALIZADO 🟢</span><span> AMBIENTE FAMILIAR 🟢</span><span> ANÁLISIS NUTRICIONAL 🟢</span><span> EQUILIBRIO DE LA VIDA 🟢</span>
        </div>
      </div>

      {/*Plan */}
      <section id="planes" className="section relative">
        <div className="container">
          <div className="section-header text-white">
            <h2 className="title-glow">ELIGE TU <span className="text-neon-red">NIVEL DE ACCESO</span></h2>
            <p className="subtitle-glow">Suscripciones modulares. Cancela cuando quieras.</p>
          </div>

          <div className="grid-responsive align-center">
            {/*Plan A*/}
            <div className="pricing-card glass-card">
              <div className="pricing-header">
                <Dumbbell size={32} className="text-neon-blue" />
                <h3>BÁSICO</h3>
                <p>Nivel 1: Entrenamiento Base</p>
              </div>
              <div className="price-tag">$25.000<span className="period">/mes</span></div>
              <ul className="feature-list">
                <li><CheckCircle2 size={18} className="text-neon-red"/> Acceso a todas las áreas del gimnasio</li>
                <li><CheckCircle2 size={18} className="text-neon-red"/> Módulo Cámara Fitness IA</li>
                <li><CheckCircle2 size={18} className="text-neon-red"/> Acceso a entrenamiento persolizado</li>
              </ul>
              <button className="btn-glass" onClick={() => navigate('/registro', { state: { planElegido: 'BASICA' } })}>
                SELECCIONAR NIVEL
              </button>
            </div>

            {/*PLan B*/}
            <div className="pricing-card glass-card featured-hologram">
              <div className="popular-badge"> ÓPTIMO</div>
              <div className="pricing-header">
                <HeartPulse size={32} className="text-neon-red" />
                <h3 className="text-neon-red">VIDA SANA</h3>
                <p>Nivel 2: Asistencia IA</p>
              </div>
              <div className="price-tag text-white">$30.000<span className="period">/mes</span></div>
              <ul className="feature-list">
                <li><CheckCircle2 size={18} className="text-neon-red"/> <b>Escaneo Nutricional</b></li>
                <li><CheckCircle2 size={18} className="text-neon-red"/> <b>Algoritmo de Rutina</b></li>
                <li><CheckCircle2 size={18} className="text-neon-red"/> Acceso API (Bot Nutricionista)</li>
                <li><CheckCircle2 size={18} className="text-neon-red"/> Todo el Nivel 1</li>
              </ul>
              <button className="btn-solid-neon w-100" onClick={() => navigate('/registro', { state: { planElegido: 'VIDA_SANA' } })}>
                DESBLOQUEAR NIVEL
              </button>
            </div>

            {/*Plan C */}
            <div className="pricing-card glass-card">
              <div className="pricing-header">
                <Zap size={32} className="text-neon-blue" />
                <h3>RENDIMIENTO</h3>
                <p>Nivel MAX: Élite Deportiva</p>
              </div>
              <div className="price-tag">$40.000<span className="period">/mes</span></div>
              <ul className="feature-list">
                <li><CheckCircle2 size={18} className="text-neon-red"/> <b>Guía Humana (Trainer 3x)</b></li>
                <li><CheckCircle2 size={18} className="text-neon-red"/> Módulo Cámara Fitness IA</li>
                <li><CheckCircle2 size={18} className="text-neon-red"/> Diagnóstico Biométrico</li>
                <li><CheckCircle2 size={18} className="text-neon-red"/> Todo el Nivel 2</li>
              </ul>
              <button className="btn-glass" onClick={() => navigate('/registro', { state: { planElegido: 'RENDIMIENTO' } })}>
                SELECCIONAR NIVEL
              </button>
            </div>
          </div>
        </div>
      </section>

      {/*Team */}
      <section id="equipo" className="section relative">
        <div className="container">
          <div className="section-header text-white">
            <h2 className="title-glow">UNIDAD DE <span className="text-neon-red">ESPECIALISTAS</span></h2>
            <p className="subtitle-glow">Directores de tu evolución física.</p>
          </div>
          
          <div className="trainer-showcase-wrapper" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div className="trainer-card-large glass-card holographic-border" key={activeTrainer}>
              <div className="trainer-img-layout">
                <div className="scanner-line"></div>
                <img src={equipo[activeTrainer].img} alt={equipo[activeTrainer].nombre} />
              </div>
              <div className="trainer-info-layout text-white">
                <h4 className="text-glow">{equipo[activeTrainer].nombre}</h4>
                <span className="team-role neon-badge">{equipo[activeTrainer].rol}</span>
                <p className="team-desc">{equipo[activeTrainer].desc}</p>
              </div>
            </div>

            <div className="trainer-dots">
              {equipo.map((_, index) => (
                <div key={index} className={`dot-cyber ${index === activeTrainer ? 'active' : ''}`} onClick={() => setActiveTrainer(index)}></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*Tecnologia */}
      <section id="tecnologia" className="section relative">
        <div className="container">
          <div className="section-header text-white">
            <h2 className="title-glow">INTEGRACIÓN <span className="text-neon-red">TECNOLÓGICA</span></h2>
            <p className="subtitle-glow">Herramientas neuronales disponibles en tu dispositivo móvil.</p>
          </div>
          
          <div className="grid-responsive">
            <div className="tech-card glass-card hover-glow-blue">
              <div className="tech-icon-wrapper neon-blue-bg">
                <Camera size={40} className="icon-pulse text-white" />
              </div>
              <h3 className="text-white">CÁMARA FITNESS [IA]</h3>
              <p className="text-gray-light">Escanea tu plato con la cámara. Nuestra red neuronal calcula instantáneamente los macronutrientes y carga calórica estimada. Visión por computadora aplicada a tu dieta.</p>
            </div>
            
            <div className="tech-card glass-card hover-glow-red">
              <div className="tech-icon-wrapper neon-red-bg">
                <Bot size={40} className="icon-float text-white" />
              </div>
              <h3 className="text-white">BOT NUTRICIONAL [API]</h3>
              <p className="text-gray-light">Ingresa tus insumos disponibles y parámetros metabólicos. El algoritmo generará recetas dinámicas optimizadas para tus objetivos de hipertrofia o déficit.</p>
            </div>
          </div>
        </div>
      </section>

      {/*horario */}
      <section id="horarios" className="section relative">
        <div className="container">
          <div className="schedule-wrapper glass-card holographic-border">
            <h2 className="section-title text-white text-center" style={{marginBottom: '40px'}}>
              CRONOGRAMA DE <span className="text-neon-red">SISTEMA</span>
            </h2>
            
            {/* listaddo*/}
            <div className="schedule-list vertical-schedule">
              
              <div className="cyber-row day-row">
                <div className="day-name text-neon-red">LUNES </div>
                <div className="day-slots text-neon-blue">
                  <span className="slot">09:00 - 12:30 [Entrenamiento]</span>
                  <span className="slot">17:00 - 22:30 [Musculación]</span>
                </div>
              </div>

              <div className="cyber-row day-row">
                <div className="day-name text-neon-red">MARTES </div>
                <div className="day-slots text-neon-blue">
                  <span className="slot">17:00 - 22:30 [Reacción]</span>
                </div>
              </div>

              <div className="cyber-row day-row">
                <div className="day-name text-neon-red">MIÉRCOLES </div>
                <div className="day-slots text-neon-blue">
                  <span className="slot">09:00 - 12:30 [Musculación]</span>
                  <span className="slot">17:00 - 22:30 [Explosividad]</span>
                </div>
              </div>

              <div className="cyber-row day-row">
                <div className="day-name text-neon-red">JUEVES </div>
                <div className="day-slots text-neon-blue">
                  <span className="slot">16:00 - 21:30 [Musculación]</span>
                </div>
              </div>

              <div className="cyber-row day-row">
                <div className="day-name text-neon-red">VIERNES </div>
                <div className="day-slots text-neon-blue">
                  <span className="slot">09:00 - 12:30 [Musculación]</span>
                  <span className="slot">17:00 - 22:30 [Full Body]</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>  

      {/*footr*/}
      <footer className="footer-modern">
        <div className="container">
          <div className="footer-grid">
            <div className="brand-col">
              <h2 className="logo-text">SKILL</h2>
              <p>El primer centro de entrenamiento potenciado por Inteligencia Artificial en Chile.</p>
            </div>
            <div className="contact-col">
              <h4>CONTACTO</h4>
              <p><MapPin size={16} className="text-red"/> Av. Providencia 1234, Santiago</p>
              <p><Clock size={16} className="text-red"/> Lun a Sáb: 06:00 - 23:00</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 SKILL Training Center. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/*CSS*/}
      <style>
        {`
          html, body, #root { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100vw !important; overflow-x: hidden; scroll-behavior: smooth; background-color: #020617; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Rajdhani', 'Inter', 'Segoe UI', sans-serif; }
          
          :root { 
            --neon-red: #ff2a2a; 
            --neon-red-glow: rgba(255, 42, 42, 0.6);
            --neon-blue: #00f0ff;
            --neon-blue-glow: rgba(0, 240, 255, 0.6);
            --bg-deep: #020617; 
            --glass-bg: rgba(15, 23, 42, 0.4); 
            --glass-border: rgba(255, 255, 255, 0.08);
          }

          .futuristic-theme {
            background-color: var(--bg-deep);
            color: #E2E8F0;
            position: relative;
            z-index: 0;
            background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
            background-size: 30px 30px;
          }

          .ambient-light { position: absolute; border-radius: 50%; filter: blur(120px); z-index: -1; opacity: 0.4; animation: drift 20s infinite alternate; }
          .light-red { top: 10%; left: -10%; width: 500px; height: 500px; background: var(--neon-red); }
          .light-blue { top: 40%; right: -10%; width: 600px; height: 600px; background: var(--neon-blue); animation-delay: -5s; }
          .light-purple { bottom: 10%; left: 30%; width: 700px; height: 400px; background: #8b5cf6; animation-delay: -10s; }
          @keyframes drift { 0% { transform: translate(0, 0); } 100% { transform: translate(100px, 100px); } }

          .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 10;}
          .section { padding: 120px 0; width: 100%; }
          .relative { position: relative; }

          .text-neon-red { color: var(--neon-red); text-shadow: 0 0 10px var(--neon-red-glow); }
          .text-neon-blue { color: var(--neon-blue); text-shadow: 0 0 10px var(--neon-blue-glow); }
          .text-white { color: #ffffff; }
          .text-gray-light { color: #94A3B8; }
          
          .section-header { 
            text-align: center; 
            margin-bottom: 70px !important;
            padding: 0 20px;
            position: relative;
            z-index: 20;
          }
          
          .grid-responsive { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 40px; 
            margin-top: 30px; 
            position: relative;
            z-index: 15;
          }

          .trainer-showcase-wrapper { 
            max-width: 900px; 
            margin: 20px auto 0; 
            position: relative; 
            z-index: 15;
          }

          .schedule-wrapper {
             margin-top: 30px;
          }


          .title-glow { font-family: 'Impact', sans-serif; font-size: clamp(2.5rem, 5vw, 3.5rem); margin-bottom: 15px; letter-spacing: 2px;}
          .subtitle-glow { font-size: 1.2rem; color: #94A3B8; letter-spacing: 1px; text-transform: uppercase; }
          .text-glow { text-shadow: 0 0 15px rgba(255,255,255,0.3); }

          .navbar { position: fixed; top: 0; left: 0; width: 100%; background: rgba(2, 6, 23, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,42,42,0.3); z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .nav-container { display: flex; justify-content: space-between; align-items: center; max-width: 1400px; margin: 0 auto; padding: 15px 20px; }
          .nav-logo { font-size: 2rem; font-family: 'Impact', sans-serif; color: var(--neon-red); font-style: italic; text-shadow: 0 0 10px var(--neon-red-glow);}
          .logo-thin { color: white; font-family: 'Arial', sans-serif; font-style: normal; font-size: 0.8rem; letter-spacing: 4px; text-shadow: none;}
          .nav-links { display: flex; gap: 40px; }
          .nav-links a { color: #CBD5E1; text-decoration: none; font-weight: bold; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; }
          .nav-links a:hover { color: white; text-shadow: 0 0 10px white; }
          
          .btn-neon { display: flex; align-items: center; gap: 8px; background: transparent; color: var(--neon-red); border: 1px solid var(--neon-red); padding: 8px 20px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 0.9rem; transition: all 0.3s; box-shadow: inset 0 0 10px rgba(255,42,42,0), 0 0 10px rgba(255,42,42,0); }
          .btn-neon:hover { background: rgba(255,42,42,0.1); box-shadow: inset 0 0 10px var(--neon-red-glow), 0 0 20px var(--neon-red-glow); color: white;}
          
          .btn-solid-neon { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: var(--neon-red); color: white; padding: 18px 40px; border: none; border-radius: 4px; font-family: 'Impact', sans-serif; font-size: 1.5rem; text-decoration: none; letter-spacing: 2px; box-shadow: 0 0 20px var(--neon-red-glow); cursor: pointer; transition: all 0.3s; text-transform: uppercase; }
          .btn-solid-neon:hover { transform: scale(1.05); box-shadow: 0 0 40px var(--neon-red); background: #ff4b4b; }
          .w-100 { width: 100%; }

          .btn-glass { width: 100%; padding: 18px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white; font-weight: bold; font-size: 1rem; letter-spacing: 1px; border-radius: 4px; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px); }
          .btn-glass:hover { background: rgba(255,255,255,0.1); border-color: white; box-shadow: 0 0 15px rgba(255,255,255,0.2); }

          .hero-section { min-height: 100vh; width: 100vw; position: relative; display: flex; align-items: center; justify-content: center; text-align: center; padding: 160px 20px 100px; overflow: hidden; }
          .hero-bg-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; }
          .hero-bg { width: 100%; height: 100%; background-image: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920'); background-size: cover; background-position: center; filter: grayscale(80%) contrast(1.2); animation: zoomCinematico 30s infinite alternate linear; }
          .hero-overlay-dark { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; background: radial-gradient(circle at center, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.98) 100%); }
          .hero-content { position: relative; z-index: 2; max-width: 900px; display: flex; flex-direction: column; align-items: center;}
          
          .glass-badge { background: rgba(255,42,42,0.1); border: 1px solid var(--neon-red); color: white; padding: 8px 25px; border-radius: 30px; font-size: 0.85rem; font-weight: bold; letter-spacing: 3px; margin-bottom: 30px; display: flex; align-items: center; gap: 10px; backdrop-filter: blur(10px); box-shadow: 0 0 20px rgba(255,42,42,0.2); }
          .dot-blink { width: 8px; height: 8px; background: var(--neon-red); border-radius: 50%; box-shadow: 0 0 8px var(--neon-red); animation: blink 1.5s infinite; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

          .hero-title { font-family: 'Impact', sans-serif; font-size: clamp(3.5rem, 8vw, 6.5rem); line-height: 0.95; margin: 0 0 25px 0; color: white; text-shadow: 0 10px 40px rgba(0,0,0,0.8); }
          .hero-subtitle { font-size: clamp(1.1rem, 2vw, 1.3rem); color: #94A3B8; margin-bottom: 40px; line-height: 1.6; max-width: 700px; }

          .marquee-container { background: rgba(2,6,23,0.9); border-top: 1px solid var(--neon-red); border-bottom: 1px solid var(--neon-red); color: var(--neon-red); padding: 12px 0; overflow: hidden; white-space: nowrap; display: flex; align-items: center; position: relative; z-index: 10; backdrop-filter: blur(10px); box-shadow: 0 0 20px rgba(255,42,42,0.1); }
          .marquee-content { display: flex; gap: 50px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem; letter-spacing: 4px; animation: scrollMarquee 25s linear infinite; }



          /* TARJETAS */
          .glass-card { 
            background: var(--glass-bg); 
            backdrop-filter: blur(16px); 
            -webkit-backdrop-filter: blur(16px); 
            border: 1px solid var(--glass-border); 
            border-radius: 16px; 
            padding: 40px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05); 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            position: relative;
            overflow: hidden;
          }
          .glass-card::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent); transform: skewX(-20deg); transition: 0.5s; }
          .glass-card:hover::before { left: 200%; }
          .glass-card:hover { transform: translateY(-10px); border-color: rgba(255,255,255,0.2); box-shadow: 0 30px 60px rgba(0,0,0,0.6); }

          /* PLANES */
          .featured-hologram { background: rgba(255, 42, 42, 0.05); border-color: rgba(255,42,42,0.4); box-shadow: 0 0 30px rgba(255,42,42,0.15), inset 0 0 20px rgba(255,42,42,0.05); transform: scale(1.05); }
          .featured-hologram:hover { border-color: var(--neon-red); box-shadow: 0 0 50px rgba(255,42,42,0.3); transform: scale(1.05) translateY(-10px); }
          @media (max-width: 992px) { .featured-hologram { transform: scale(1); } .featured-hologram:hover { transform: translateY(-10px); } }
          
          .popular-badge { position: absolute; top: 0; right: 0; background: var(--neon-red); color: white; padding: 5px 15px; border-bottom-left-radius: 16px; font-weight: bold; font-size: 0.8rem; letter-spacing: 2px; }
          .pricing-header h3 { font-family: 'Impact', sans-serif; font-size: 2.5rem; margin: 15px 0 5px; color: white; letter-spacing: 2px;}
          .pricing-header p { color: #94A3B8; font-family: 'Courier New', monospace; font-size: 0.9rem; margin-bottom: 30px; text-transform: uppercase;}
          .price-tag { font-size: clamp(2.5rem, 4vw, 3.5rem); font-family: 'Impact', sans-serif; margin-bottom: 30px; color: white; text-shadow: 0 0 10px rgba(255,255,255,0.3);}
          .price-tag .period { font-size: 1rem; font-family: 'Arial', sans-serif; font-weight: normal; color: #64748B;}
          
          .feature-list { list-style: none; margin-bottom: 40px; flex-grow: 1; }
          .feature-list li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px; color: #CBD5E1; font-size: 1.05rem; }

          /* Team */
          .trainer-card-large { display: flex; align-items: center; gap: 50px; padding: 50px; animation: slideFadeIn 0.5s ease-out forwards; }
          @media (max-width: 768px) { .trainer-card-large { flex-direction: column; text-align: center; padding: 30px; gap: 30px;} }
          
          .holographic-border { border: 1px solid rgba(0,240,255,0.3); box-shadow: 0 0 30px rgba(0,240,255,0.1), inset 0 0 20px rgba(0,240,255,0.05); }
          .holographic-border:hover { border-color: var(--neon-blue); box-shadow: 0 0 50px rgba(0,240,255,0.2); }

          .trainer-img-layout { width: 220px; height: 220px; flex-shrink: 0; border-radius: 50%; border: 2px solid var(--neon-blue); padding: 8px; position: relative; background: rgba(0,240,255,0.1); box-shadow: 0 0 20px var(--neon-blue-glow); }
          .trainer-img-layout img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; filter: contrast(1.1); }
          .scanner-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--neon-blue); box-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue); border-radius: 50%; z-index: 10; animation: scan 3s ease-in-out infinite alternate; opacity: 0.7;}
          @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

          .trainer-info-layout h4 { font-family: 'Impact', sans-serif; font-size: 3.5rem; margin-bottom: 5px; letter-spacing: 2px;}
          .neon-badge { display: inline-block; background: rgba(0,240,255,0.1); border: 1px solid var(--neon-blue); color: var(--neon-blue); padding: 6px 15px; border-radius: 4px; font-size: 0.9rem; font-family: 'Courier New', monospace; font-weight: bold; margin-bottom: 25px; margin-top: 30px; box-shadow: 0 0 10px rgba(0,240,255,0.2);}
          .team-desc { color: #CBD5E1; font-size: 1.15rem; line-height: 1.7; }

          .trainer-dots { display: flex; justify-content: center; gap: 15px; margin-top: 40px; }
          .dot-cyber { width: 40px; height: 4px; background: rgba(255,255,255,0.2); cursor: pointer; transition: all 0.3s; border-radius: 2px; }
          .dot-cyber:hover { background: rgba(255,255,255,0.5); }
          .dot-cyber.active { background: var(--neon-blue); box-shadow: 0 0 10px var(--neon-blue); width: 60px; }

          /* Tecnologia */
          .tech-card { text-align: center; }
          .hover-glow-blue:hover { border-color: var(--neon-blue); box-shadow: 0 0 40px rgba(0,240,255,0.2); }
          .hover-glow-red:hover { border-color: var(--neon-red); box-shadow: 0 0 40px rgba(255,42,42,0.2); }
          .tech-icon-wrapper { width: 90px; height: 90px; margin: 0 auto 30px; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
          .neon-blue-bg { background: rgba(0,240,255,0.1); border: 1px solid var(--neon-blue); box-shadow: 0 0 20px rgba(0,240,255,0.3); }
          .neon-red-bg { background: rgba(255,42,42,0.1); border: 1px solid var(--neon-red); box-shadow: 0 0 20px rgba(255,42,42,0.3); }
          .tech-card h3 { font-family: 'Impact', sans-serif; font-size: 2rem; margin-bottom: 20px; letter-spacing: 1px;}
          .tech-card p { line-height: 1.7; font-size: 1.05rem;}

          /* horarios */
          .schedule-list { position: relative; z-index: 1;}
          .vertical-schedule { display: flex; flex-direction: column; gap: 15px; }
          
          .cyber-row { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); border-radius: 8px; transition: all 0.3s; }
          .cyber-row:hover { background: rgba(0,240,255,0.05); border-left: 4px solid var(--neon-blue); transform: translateX(10px); }
          
          .day-row { align-items: flex-start; }
          .day-name { font-family: 'Impact', sans-serif; font-size: 1.8rem; letter-spacing: 2px; width: 180px; flex-shrink: 0;}
          
          .day-slots { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; width: 100%;}
          .slot { background: rgba(0,240,255,0.08); padding: 8px 15px; border-radius: 4px; border-left: 2px solid var(--neon-blue); font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 1px; font-size: 1.05rem; width: fit-content; box-shadow: inset 0 0 10px rgba(0,240,255,0);}
          .cyber-row:hover .slot { box-shadow: inset 0 0 10px rgba(0,240,255,0.2); }

          /* responsive */
          @media (max-width: 768px) {
            .day-row { flex-direction: column; gap: 20px; align-items: center; text-align: center; }
            .day-name { width: 100%; }
            .day-slots { align-items: center; }
          }

          /* footer */
          .footer-modern { background: var(--bg-deep); color: #9CA3AF; padding: 80px 0 30px; border-top: 1px solid var(--neon-red); position: relative; z-index: 10;}
          .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 50px; margin-bottom: 30px;}
          .brand-col p { margin-top: 15px; line-height: 1.6; max-width: 300px; font-size: 1.1rem;}
          .contact-col h4 { color: white; margin-bottom: 25px; font-size: 1.2rem; letter-spacing: 1px;}
          .contact-col p { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-size: 1.05rem;}
          .footer-bottom { text-align: center; font-size: 0.9rem; }

          /* animaciones */
          @keyframes slideFadeIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes zoomCinematico { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
          @keyframes scrollMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
          .icon-float { animation: float 3s ease-in-out infinite; }
          @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
          .icon-pulse { animation: pulse 2s ease-in-out infinite; }

          @media (max-width: 992px) {
            .hero-title { font-size: clamp(3rem, 6vw, 4.5rem); }
            .title-glow { font-size: clamp(2.2rem, 4vw, 3rem); }
            .featured-hologram { transform: scale(1); }
            .featured-hologram:hover { transform: translateY(-10px); }
          }

          @media (max-width: 768px) {
            /*NAVBAR*/
            .nav-container { flex-direction: column; gap: 15px; padding: 15px; }
            .nav-links { flex-wrap: wrap; justify-content: center; gap: 15px; }
            .nav-links a { font-size: 0.85rem; }
            .btn-neon { width: 100%; justify-content: center; }

            /*HERO*/
            .hero-section { padding: 180px 20px 80px; }
            .hero-title { font-size: 2.8rem; letter-spacing: 1px; line-height: 1.1; }
            .hero-subtitle { font-size: 1rem; margin-bottom: 30px; }
            .glass-badge { font-size: 0.7rem; padding: 6px 15px; flex-wrap: wrap; justify-content: center; text-align: center; }


            .section { padding: 80px 0; }
            .section-header { margin-bottom: 40px !important; }
            .grid-responsive { gap: 25px; }

            .glass-card { padding: 25px; }
            .pricing-header h3 { font-size: 2rem; }
            .price-tag { font-size: 2.5rem; }
            
            /*SECCIÓN EQUIPO */
            .trainer-card-large { flex-direction: column; text-align: center; padding: 25px; gap: 20px; }
            .trainer-img-layout { width: 180px; height: 180px; margin: 0 auto; }
            .trainer-info-layout h4 { font-size: 2.5rem; }
            .neon-badge { margin: 15px 0; }
            .team-desc { font-size: 1rem; }

            /*HORARIOS */
            .day-row { flex-direction: column; gap: 15px; align-items: center; text-align: center; padding: 20px 15px; }
            .day-name { width: 100%; font-size: 1.5rem; }
            .day-slots { align-items: center; }
            .slot { font-size: 0.9rem; padding: 6px 12px; }

            /*FOOTER */
            .footer-grid { text-align: center; gap: 30px; }
            .brand-col p { margin: 15px auto 0; }
            .contact-col p { justify-content: center; font-size: 0.95rem; }
          }

          @media (max-width: 480px) {
            .hero-title { font-size: 2.2rem; }
            .nav-links { display: none;
            .marquee-content { font-size: 0.9rem; gap: 30px; }
            .btn-solid-neon { font-size: 1.2rem; padding: 15px 25px; width: 100%; }
          }
        `}
      </style>
    </div>
  );
}