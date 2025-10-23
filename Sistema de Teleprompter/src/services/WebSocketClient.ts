/**
 * WebSocketClient - Cliente Socket.IO para sincronización en tiempo real
 * 
 * Maneja la conexión WebSocket con el servidor para recibir
 * actualizaciones en tiempo real de scripts, runorders, y teleprompter.
 * 
 * @version 1.0.0
 */

import { io, Socket } from 'socket.io-client';
import { apiClient } from './ApiClient';

// ============================================================================
// TIPOS
// ============================================================================

export interface TeleprompterSyncData {
  isPlaying: boolean;
  scrollPosition: number;
  speed: number;
  timestamp: number;
}

export interface RunOrderSyncData {
  runOrderId: string;
  items: any[];
  activeItemId?: string;
  timestamp: number;
}

export interface ScriptEventData {
  scriptId: string;
  script?: any;
  action: 'created' | 'updated' | 'deleted';
  userId: string;
  timestamp: number;
}

export interface ConfigEventData {
  userId: string;
  config: any;
  timestamp: number;
}

// Tipos de callbacks para eventos
export type TeleprompterSyncCallback = (data: TeleprompterSyncData) => void;
export type RunOrderSyncCallback = (data: RunOrderSyncData) => void;
export type ScriptEventCallback = (data: ScriptEventData) => void;
export type ConfigEventCallback = (data: ConfigEventData) => void;
export type ConnectionCallback = () => void;

// ============================================================================
// WEBSOCKET CLIENT CLASS
// ============================================================================

class WebSocketClient {
  private socket: Socket | null = null;
  private url: string;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // ms

  // Listeners registrados
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
  }

  // ===== CONEXIÓN =====

  /**
   * Conectar al servidor WebSocket
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('⚠️  WebSocket ya está conectado');
      return;
    }

    const token = apiClient.getAccessToken();
    if (!token) {
      console.warn('⚠️  No hay token de autenticación. Conectando como anónimo...');
    }

    this.socket = io(this.url, {
      auth: {
        token: token || undefined
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    this.setupEventHandlers();
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket desconectado');
    }
  }

  /**
   * Reconectar manualmente
   */
  reconnect(): void {
    this.disconnect();
    this.connect();
  }

  // ===== EVENT HANDLERS =====

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Conexión exitosa
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ WebSocket conectado:', this.socket?.id);
      
      // Identificar usuario al servidor
      this.identifyUser();
      
      // Notificar a listeners
      this.emit('connection:open');
    });

    // Desconexión
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('🔌 WebSocket desconectado:', reason);
      this.emit('connection:close', reason);
    });

    // Error de conexión
    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error(`❌ Error de conexión WebSocket (intento ${this.reconnectAttempts}):`, error.message);
      this.emit('connection:error', error);
    });

    // Reconexión exitosa
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ WebSocket reconectado después de ${attemptNumber} intentos`);
      this.identifyUser();
      this.emit('connection:reconnect', attemptNumber);
    });

    // ===== EVENTOS DE SINCRONIZACIÓN =====

    // Sincronización de Teleprompter
    this.socket.on('sync:teleprompter', (data: TeleprompterSyncData) => {
      console.log('📡 Sync Teleprompter recibido:', data);
      this.emit('sync:teleprompter', data);
    });

    // Sincronización de RunOrder
    this.socket.on('sync:runorder', (data: RunOrderSyncData) => {
      console.log('📡 Sync RunOrder recibido:', data);
      this.emit('sync:runorder', data);
    });

    // Script creado
    this.socket.on('script:created', (data: ScriptEventData) => {
      console.log('📄 Script creado:', data);
      this.emit('script:created', data);
    });

    // Script actualizado
    this.socket.on('script:updated', (data: ScriptEventData) => {
      console.log('📄 Script actualizado:', data);
      this.emit('script:updated', data);
    });

    // Script eliminado
    this.socket.on('script:deleted', (data: ScriptEventData) => {
      console.log('📄 Script eliminado:', data);
      this.emit('script:deleted', data);
    });

    // Configuración actualizada
    this.socket.on('config:updated', (data: ConfigEventData) => {
      console.log('⚙️  Configuración actualizada:', data);
      this.emit('config:updated', data);
    });
  }

  /**
   * Identificar usuario al servidor
   */
  private identifyUser(): void {
    if (!this.socket || !apiClient.isAuthenticated()) return;

    // Aquí podrías enviar información del usuario
    this.socket.emit('identify', {
      timestamp: Date.now()
    });
  }

  // ===== EMITIR EVENTOS AL SERVIDOR =====

  /**
   * Emitir sincronización de Teleprompter
   */
  syncTeleprompter(data: Partial<TeleprompterSyncData>): void {
    if (!this.socket?.connected) {
      console.warn('⚠️  No se puede sincronizar: WebSocket desconectado');
      return;
    }

    const fullData: TeleprompterSyncData = {
      isPlaying: false,
      scrollPosition: 0,
      speed: 50,
      ...data,
      timestamp: Date.now()
    };

    this.socket.emit('sync:teleprompter', fullData);
  }

  /**
   * Emitir sincronización de RunOrder
   */
  syncRunOrder(data: Partial<RunOrderSyncData>): void {
    if (!this.socket?.connected) {
      console.warn('⚠️  No se puede sincronizar: WebSocket desconectado');
      return;
    }

    const fullData: RunOrderSyncData = {
      runOrderId: '',
      items: [],
      ...data,
      timestamp: Date.now()
    };

    this.socket.emit('sync:runorder', fullData);
  }

  // ===== LISTENERS (PATRÓN OBSERVER) =====

  /**
   * Registrar listener para un evento
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Eliminar listener de un evento
   */
  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  /**
   * Emitir evento a todos los listeners registrados
   */
  private emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error en listener de evento '${event}':`, error);
        }
      });
    }
  }

  /**
   * Limpiar todos los listeners de un evento
   */
  clearListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // ===== UTILIDADES =====

  /**
   * Verificar si está conectado
   */
  isSocketConnected(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }

  /**
   * Obtener ID del socket
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Obtener estado de la conexión
   */
  getConnectionState(): {
    connected: boolean;
    socketId?: string;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const wsClient = new WebSocketClient();

// Auto-conectar en desarrollo
if (import.meta.env.DEV) {
  // Esperar 1 segundo para que la app se inicialice
  setTimeout(() => {
    wsClient.connect();
  }, 1000);
}

// Exponer en window para debugging
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__WS_CLIENT__ = wsClient;
  console.log('🔧 WebSocketClient expuesto en window.__WS_CLIENT__ para debugging');
}
