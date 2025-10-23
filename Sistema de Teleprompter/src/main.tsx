
  /**
 * ===== PUNTO DE ENTRADA DE LA APLICACIÓN / APPLICATION ENTRY POINT =====
 * 
 * Archivo principal que inicializa la aplicación React
 * Main file that initializes the React application
 * 
 * Este archivo es responsable de:
 * This file is responsible for:
 * - Montar el componente raíz App en el DOM
 * - Mounting the root App component into the DOM
 * - Cargar los estilos globales (index.css)
 * - Loading global styles (index.css)
 * - Usar React 18+ con createRoot para renderizado concurrente
 * - Using React 18+ with createRoot for concurrent rendering
 */

// ===== IMPORTACIONES / IMPORTS =====
import { createRoot } from "react-dom/client"; // API de React 18+ para renderizado / React 18+ rendering API
import { AppWithRouter } from "./AppWithRouter.tsx"; // App con Router / App with Router
import "./index.css"; // Estilos globales (Tailwind CSS) / Global styles (Tailwind CSS)

// ===== INICIALIZACIÓN DE LA APLICACIÓN / APPLICATION INITIALIZATION =====
/**
 * Crea la raíz de React y renderiza el componente principal con Router
 * Creates React root and renders the main component with Router
 * 
 * El operador ! (non-null assertion) asegura a TypeScript que getElementById('root')
 * no será null, ya que el elemento existe en index.html
 * 
 * The ! operator (non-null assertion) assures TypeScript that getElementById('root')
 * won't be null, since the element exists in index.html
 */
createRoot(document.getElementById("root")!).render(<AppWithRouter />);
  