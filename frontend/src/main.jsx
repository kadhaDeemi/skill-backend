import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Registro from './components/Registro.jsx'
import Kiosco from './components/Kiosco.jsx'
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import CamaraFitness from './components/CamaraFitness.jsx';
import Rutina from './components/vista/Rutina.jsx';
import Pagos from './components/Pagos.jsx';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/kiosco" element={<Kiosco />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/camara' element={<CamaraFitness />} />
        <Route path="/rutina" element={<Rutina />} />
        <Route path="/pagos" element={<Pagos />} />
        {/* si no existe la url, va al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)