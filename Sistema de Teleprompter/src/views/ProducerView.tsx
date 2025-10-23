/**
 * ProducerView - Vista principal para Productores
 * 
 * Interfaz completa para crear, editar y gestionar scripts.
 * Layout de 2 columnas: biblioteca de scripts + editor.
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { apiClient, type Script } from '../services/ApiClient';
import { wsClient } from '../services/WebSocketClient';
import { useToast } from '../hooks/use-toast';

export function ProducerView() {
  const { toast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [user, setUser] = useState<any>(null);

  // ===== EFECTOS =====

  useEffect(() => {
    loadUser();
    loadScripts();
    setupWebSocket();

    return () => {
      wsClient.clearListeners();
    };
  }, []);

  // ===== FUNCIONES =====

  const loadUser = async () => {
    try {
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      toast({
        title: 'Error de autenticación',
        description: 'No se pudo cargar el usuario. Por favor inicia sesión.',
        variant: 'destructive'
      });
    }
  };

  const loadScripts = async () => {
    setLoading(true);
    try {
      const { scripts: loadedScripts } = await apiClient.getScripts({
        page: 1,
        limit: 50
      });
      setScripts(loadedScripts);
    } catch (error) {
      console.error('Error al cargar scripts:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los scripts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // Conectar si no está conectado
    if (!wsClient.isSocketConnected()) {
      wsClient.connect();
    }

    // Escuchar actualizaciones de scripts
    wsClient.on('script:created', () => {
      loadScripts();
    });

    wsClient.on('script:updated', (data: any) => {
      // Actualizar script en la lista
      setScripts(prev =>
        prev.map(s => (s._id === data.scriptId ? { ...s, ...data.script } : s))
      );
      
      // Si es el script seleccionado, actualizarlo también
      if (selectedScript?._id === data.scriptId) {
        setSelectedScript(prev => prev ? { ...prev, ...data.script } : null);
      }
    });

    wsClient.on('script:deleted', (data: any) => {
      setScripts(prev => prev.filter(s => s._id !== data.scriptId));
      if (selectedScript?._id === data.scriptId) {
        setSelectedScript(null);
      }
    });
  };

  const handleCreateScript = async () => {
    try {
      const newScript = await apiClient.createScript({
        title: 'Nuevo Script',
        content: '',
        category: 'Otro',
        status: 'Borrador',
        priority: 'Media',
        duration: 0
      });

      setScripts([newScript, ...scripts]);
      setSelectedScript(newScript);

      toast({
        title: 'Script creado',
        description: 'Nuevo script creado exitosamente'
      });
    } catch (error) {
      console.error('Error al crear script:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el script',
        variant: 'destructive'
      });
    }
  };

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script);
  };

  const handleUpdateScript = async (scriptId: string, updates: Partial<Script>) => {
    try {
      const updated = await apiClient.updateScript(scriptId, updates);
      
      setScripts(prev =>
        prev.map(s => (s._id === scriptId ? updated : s))
      );
      
      if (selectedScript?._id === scriptId) {
        setSelectedScript(updated);
      }

      toast({
        title: 'Script actualizado',
        description: 'Los cambios se guardaron correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar script:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el script',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteScript = async (scriptId: string) => {
    try {
      await apiClient.deleteScript(scriptId);
      setScripts(prev => prev.filter(s => s._id !== scriptId));
      
      if (selectedScript?._id === scriptId) {
        setSelectedScript(null);
      }

      toast({
        title: 'Script eliminado',
        description: 'El script se eliminó correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar script:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el script',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // ===== FILTROS =====

  const filteredScripts = scripts.filter(script => {
    const matchesSearch =
      script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || script.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // ===== RENDER =====

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ===== HEADER ===== */}
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Producer View</h1>
            <p className="text-sm text-muted-foreground">
              Sistema de gestión de scripts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">({user.role})</span>
            </div>
          )}
          
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===== SIDEBAR: BIBLIOTECA DE SCRIPTS ===== */}
        <aside className="w-96 border-r flex flex-col bg-card">
          {/* Toolbar */}
          <div className="p-4 border-b space-y-3">
            <div className="flex gap-2">
              <Button onClick={handleCreateScript} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Script
              </Button>
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border bg-background"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'Borrador' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('Borrador')}
              >
                Borradores
              </Button>
              <Button
                variant={filterStatus === 'Aprobado' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('Aprobado')}
              >
                Aprobados
              </Button>
            </div>
          </div>

          {/* Lista de scripts */}
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Cargando scripts...
              </p>
            ) : filteredScripts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No se encontraron scripts
              </p>
            ) : (
              filteredScripts.map((script) => (
                <Card
                  key={script._id}
                  className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                    selectedScript?._id === script._id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectScript(script)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{script.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {script.content.substring(0, 50)}...
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {script.status}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                          {script.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </aside>

        {/* ===== MAIN: EDITOR ===== */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedScript ? (
            <div className="flex-1 flex flex-col p-6">
              <div className="mb-4">
                <input
                  type="text"
                  value={selectedScript.title}
                  onChange={(e) =>
                    handleUpdateScript(selectedScript._id, { title: e.target.value })
                  }
                  className="text-3xl font-bold bg-transparent border-none focus:outline-none w-full"
                  placeholder="Título del script"
                />
              </div>

              <div className="flex-1 border rounded-lg p-4 bg-card">
                <textarea
                  value={selectedScript.content}
                  onChange={(e) =>
                    handleUpdateScript(selectedScript._id, { content: e.target.value })
                  }
                  className="w-full h-full bg-transparent resize-none focus:outline-none"
                  placeholder="Escribe tu script aquí..."
                />
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteScript(selectedScript._id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Selecciona un script para editar</p>
                <p className="text-sm mt-2">o crea uno nuevo</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
