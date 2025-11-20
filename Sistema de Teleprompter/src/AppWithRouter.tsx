/**
 * AppWithRouter - Router principal de la aplicación
 * 
 * Gestiona 2 rutas principales:
 * - /operator: Vista de operador (teleprompter)
 * - /producer: Vista de productor (gestión de scripts)
 * 
 * @version 1.0.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';  // Vista de Operador (actual)
import { ProducerView } from './views/ProducerView';
import { LoginView } from './views/LoginView';
import { ProtectedRoute } from './components/ProtectedRoute';

export function AppWithRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto → Operador */}
        <Route path="/" element={<Navigate to="/operator" replace />} />
        
        {/* Vista de Operador (teleprompter) */}
        <Route path="/operator" element={<App />} />
        
        {/* Vista de Productor (gestión de scripts) - Acceso libre */}
        <Route path="/producer" element={<ProducerView />} />
        
        {/* Login */}
        <Route path="/login" element={<LoginView />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/operator" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
