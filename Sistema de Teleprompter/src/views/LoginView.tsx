/**
 * LoginView - Vista de inicio de sesión
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { FileText, LogIn } from 'lucide-react';
import { apiClient } from '../services/ApiClient';
import { useToast } from '../hooks/use-toast';

export function LoginView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await apiClient.login({ email, password });
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: `Bienvenido, ${user.name}`
      });

      // Redirigir según rol
      if (user.role === 'Producer' || user.role === 'Admin') {
        navigate('/producer');
      } else {
        navigate('/operator');
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      toast({
        title: 'Error de autenticación',
        description: error.response?.data?.error || 'Credenciales inválidas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Sistema de Teleprompter</CardTitle>
          <CardDescription className="text-center">
            Inicia sesión para acceder al sistema
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@teleprompter.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                'Iniciando sesión...'
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Usuario demo: admin@teleprompter.com</p>
              <p className="text-xs mt-1">Ver 01-init.js para credenciales</p>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/operator')}
            >
              Continuar como invitado (Operator)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
