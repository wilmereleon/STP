/**
 * ProtectedRoute - Componente para proteger rutas que requieren autenticación
 * 
 * @version 1.0.0
 */

import { Navigate } from 'react-router-dom';
import { apiClient } from '../services/ApiClient';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'Producer' | 'Operator' | 'Admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = apiClient.isAuthenticated();

  if (!isAuthenticated) {
    // Redirigir a login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  // TODO: Verificar rol si se especifica requiredRole
  // Por ahora, solo verificamos autenticación

  return <>{children}</>;
}
