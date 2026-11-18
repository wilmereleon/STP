/**
 * AppWithRouter - Router principal de la aplicación
 *
 * Se usa HashRouter para que las rutas funcionen igual en el navegador, en
 * Docker/nginx y en Electron (protocolo app://), sin configuración de servidor.
 *
 * Rutas:
 * - #/operator : vista del operador (Run Order, editor, vista previa)
 * - #/output   : ventana de salida del prompter (?mirror=h | v | hv)
 * - #/producer : vista del productor (requiere backend)
 * - #/login    : acceso del productor
 */

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { OperatorApp } from './prompter/OperatorApp';
import { OutputApp } from './prompter/OutputApp';
import { ProducerView } from './views/ProducerView';
import { LoginView } from './views/LoginView';

export function AppWithRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/operator" replace />} />
        <Route path="/operator" element={<OperatorApp />} />
        <Route path="/output" element={<OutputApp />} />
        <Route path="/producer" element={<ProducerView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="*" element={<Navigate to="/operator" replace />} />
      </Routes>
    </HashRouter>
  );
}
