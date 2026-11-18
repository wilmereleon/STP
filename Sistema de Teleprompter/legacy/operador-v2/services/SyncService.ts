/**
 * SyncService - Servicio de sincronización Master-Slave
 * 
 * Implementa el patrón Master-Slave para sincronizar ventanas (popup, modal)
 * con la ventana principal usando postMessage API.
 * 
 * Arquitectura:
 * - Ventana principal = Master
 * - Ventanas popup/modal = Slaves
 * 
 * Flujo:
 * 1. Master emite cambios de estado → broadcast a todos los slaves
 * 2. Slave solicita cambio → envía REQUEST_CHANGE al master
 * 3. Master valida y aplica → broadcast nuevo estado
 * 4. Slaves reciben SYNC_STATE → actualizan localmente
 * 
 * @version 2.0.0
 * @pattern Master-Slave, Observer
 */

import { teleprompterStore } from '../stores/TeleprompterStore';
import type { TeleprompterState } from '../stores/TeleprompterStore';

/**
 * Tipos de mensajes de sincronización
 */
export enum SyncMessageType {
  /** Master → Slaves: Estado actualizado */
  SYNC_STATE = 'SYNC_STATE',
  
  /** Slave → Master: Solicitud de cambio */
  REQUEST_CHANGE = 'REQUEST_CHANGE',
  
  /** Master → Slave: Confirmación de cambio */
  ACK = 'ACK',
  
  /** Slave → Master: Registro inicial */
  REGISTER_SLAVE = 'REGISTER_SLAVE',
  
  /** Slave → Master: Desregistro */
  UNREGISTER_SLAVE = 'UNREGISTER_SLAVE'
}

/**
 * Mensaje de sincronización
 */
export interface SyncMessage {
  type: SyncMessageType;
  timestamp: number;
  slaveId?: string;
  payload?: any;
}

/**
 * Información de un slave registrado
 */
interface SlaveInfo {
  id: string;
  window: Window;
  registeredAt: number;
}

/**
 * Comando en cola
 */
interface QueuedCommand {
  timestamp: number;
  message: SyncMessage;
}

export class SyncService {
  private isMaster: boolean = true;
  private slaves = new Map<string, SlaveInfo>();
  private commandQueue: QueuedCommand[] = [];
  private throttleTimeout: NodeJS.Timeout | null = null;
  private readonly throttleDelay = 50; // 50ms
  private lastBroadcastTime = 0;
  private unsubscribe: (() => void) | null = null;
  
  /**
   * Inicializa el servicio en modo Master o Slave
   */
  initialize(mode: 'master' | 'slave' = 'master'): void {
    this.isMaster = mode === 'master';
    
    if (this.isMaster) {
      this.initializeMaster();
    } else {
      this.initializeSlave();
    }
    
    console.log(`🔄 SyncService: initialized in ${mode.toUpperCase()} mode`);
  }
  
  // ============================================================================
  // MASTER MODE
  // ============================================================================
  
  /**
   * Inicializa en modo Master
   */
  private initializeMaster(): void {
    // Escuchar mensajes de slaves
    window.addEventListener('message', this.handleSlaveMessage);
    
    // Suscribirse al store para broadcast automático
    this.unsubscribe = teleprompterStore.subscribe(() => {
      this.broadcastState();
    });
  }
  
  /**
   * Registra un slave (popup/modal window)
   */
  registerSlave(id: string, slaveWindow: Window): void {
    if (!this.isMaster) {
      console.warn('⚠️ SyncService: solo Master puede registrar slaves');
      return;
    }
    
    this.slaves.set(id, {
      id,
      window: slaveWindow,
      registeredAt: Date.now()
    });
    
    // Enviar estado inicial al nuevo slave
    this.sendStateToSlave(id);
    
    console.log(`🔄 SyncService: slave "${id}" registered (total: ${this.slaves.size})`);
  }
  
  /**
   * Desregistra un slave
   */
  unregisterSlave(id: string): void {
    if (!this.isMaster) return;
    
    const removed = this.slaves.delete(id);
    
    if (removed) {
      console.log(`🔄 SyncService: slave "${id}" unregistered (total: ${this.slaves.size})`);
    }
  }
  
  /**
   * Broadcast del estado a todos los slaves (throttled)
   */
  private broadcastState(): void {
    if (!this.isMaster) return;
    
    // Throttling: evitar broadcast excesivo
    const now = Date.now();
    const timeSinceLastBroadcast = now - this.lastBroadcastTime;
    
    if (timeSinceLastBroadcast < this.throttleDelay) {
      // Aún dentro del throttle, programar para después
      if (this.throttleTimeout === null) {
        this.throttleTimeout = setTimeout(() => {
          this.throttleTimeout = null;
          this.executeBroadcast();
        }, this.throttleDelay);
      }
      return;
    }
    
    this.executeBroadcast();
  }
  
  /**
   * Ejecuta el broadcast inmediatamente
   */
  private executeBroadcast(): void {
    const state = teleprompterStore.getState();
    const message: SyncMessage = {
      type: SyncMessageType.SYNC_STATE,
      timestamp: Date.now(),
      payload: state
    };
    
    console.log('📡 SyncService: Broadcasting to', this.slaves.size, 'slaves. Text length:', state.text?.length || 0);
    
    // Enviar a todos los slaves
    this.slaves.forEach(slave => {
      try {
        slave.window.postMessage(message, '*');
        console.log('  ✅ Sent to slave:', slave.id);
      } catch (error) {
        console.error(`❌ SyncService: error broadcasting to slave "${slave.id}"`, error);
        // Slave probablemente cerrado, desregistrar
        this.unregisterSlave(slave.id);
      }
    });
    
    this.lastBroadcastTime = Date.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 SyncService: broadcasted to ${this.slaves.size} slaves`);
    }
  }
  
  /**
   * Envía estado solo a un slave específico
   */
  private sendStateToSlave(slaveId: string): void {
    const slave = this.slaves.get(slaveId);
    if (!slave) return;
    
    const state = teleprompterStore.getState();
    const message: SyncMessage = {
      type: SyncMessageType.SYNC_STATE,
      timestamp: Date.now(),
      payload: state
    };
    
    try {
      slave.window.postMessage(message, '*');
    } catch (error) {
      console.error(`❌ SyncService: error sending to slave "${slaveId}"`, error);
      this.unregisterSlave(slaveId);
    }
  }
  
  /**
   * Maneja mensajes recibidos de slaves
   */
  private handleSlaveMessage = (event: MessageEvent): void => {
    const message: SyncMessage = event.data;
    
    // Validar origen y formato
    if (!message || !message.type) return;
    
    switch (message.type) {
      case SyncMessageType.REQUEST_CHANGE:
        this.handleChangeRequest(message);
        break;
        
      case SyncMessageType.REGISTER_SLAVE:
        if (message.slaveId && event.source) {
          this.registerSlave(message.slaveId, event.source as Window);
        }
        break;
        
      case SyncMessageType.UNREGISTER_SLAVE:
        if (message.slaveId) {
          this.unregisterSlave(message.slaveId);
        }
        break;
        
      default:
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 SyncService: unknown message type', message.type);
        }
    }
  };
  
  /**
   * Procesa una solicitud de cambio de un slave
   */
  private handleChangeRequest(message: SyncMessage): void {
    if (!message.payload) return;
    
    // Agregar a cola de comandos
    this.commandQueue.push({
      timestamp: message.timestamp,
      message
    });
    
    // Procesar cola
    this.processCommandQueue();
  }
  
  /**
   * Procesa la cola de comandos (FIFO)
   */
  private processCommandQueue(): void {
    // Ordenar por timestamp (más antiguo primero)
    this.commandQueue.sort((a, b) => a.timestamp - b.timestamp);
    
    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift()!;
      const { payload } = command.message;
      
      // Aplicar cambio al store
      try {
        if (payload.type === 'SET_SPEED') {
          teleprompterStore.setSpeed(payload.value);
        } else if (payload.type === 'SET_FONT_SIZE') {
          teleprompterStore.setFontSize(payload.value);
        } else if (payload.type === 'SET_SCROLL_POSITION') {
          teleprompterStore.setScrollPosition(payload.value);
        } else if (payload.type === 'PLAY') {
          teleprompterStore.play();
        } else if (payload.type === 'PAUSE') {
          teleprompterStore.pause();
        } else if (payload.type === 'RESET') {
          teleprompterStore.reset();
        } else if (payload.type === 'JUMP_TO_MARKER') {
          teleprompterStore.jumpToMarker(payload.value);
        }
        
        // Broadcast automático por suscripción al store
        // No necesitamos llamar broadcastState() aquí
        
        // Enviar ACK al slave
        if (command.message.slaveId) {
          this.sendAck(command.message.slaveId, command.message.timestamp);
        }
      } catch (error) {
        console.error('❌ SyncService: error processing command', error);
      }
    }
  }
  
  /**
   * Envía ACK de confirmación a un slave
   */
  private sendAck(slaveId: string, timestamp: number): void {
    const slave = this.slaves.get(slaveId);
    if (!slave) return;
    
    const message: SyncMessage = {
      type: SyncMessageType.ACK,
      timestamp: Date.now(),
      payload: { originalTimestamp: timestamp }
    };
    
    try {
      slave.window.postMessage(message, '*');
    } catch (error) {
      console.error(`❌ SyncService: error sending ACK to "${slaveId}"`, error);
    }
  }
  
  // ============================================================================
  // SLAVE MODE
  // ============================================================================
  
  /**
   * Inicializa en modo Slave
   */
  private initializeSlave(): void {
    // Escuchar mensajes del master
    window.addEventListener('message', this.handleMasterMessage);
    
    // Registrarse con el master (si hay opener)
    if (window.opener) {
      this.registerWithMaster();
    }
  }
  
  /**
   * Registra este slave con el master
   */
  private registerWithMaster(): void {
    if (this.isMaster || !window.opener) return;
    
    const slaveId = `slave-${Date.now()}`;
    const message: SyncMessage = {
      type: SyncMessageType.REGISTER_SLAVE,
      timestamp: Date.now(),
      slaveId
    };
    
    window.opener.postMessage(message, '*');
    
    console.log('🔄 SyncService: registered with master');
  }
  
  /**
   * Maneja mensajes recibidos del master
   */
  private handleMasterMessage = (event: MessageEvent): void => {
    const message: SyncMessage = event.data;
    
    if (!message || !message.type) return;
    
    console.log('📨 SyncService (Slave): Received message from master', message.type);
    
    switch (message.type) {
      case SyncMessageType.SYNC_STATE:
        console.log('  📦 SYNC_STATE received. Text length:', message.payload?.text?.length || 0);
        this.applyStateFromMaster(message.payload);
        break;
        
      case SyncMessageType.ACK:
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 SyncService: received ACK from master');
        }
        break;
        
      default:
        // Ignorar otros mensajes
        break;
    }
  };
  
  /**
   * Aplica estado recibido del master
   */
  private applyStateFromMaster(state: TeleprompterState): void {
    if (!state) return;
    
    console.log('🔧 SyncService (Slave): Applying state from master. Text length:', state.text?.length || 0);
    
    // Aplicar al store local usando el método syncFromMaster
    // Este método notifica a React sin causar loops de sincronización
    teleprompterStore.syncFromMaster(state);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ SyncService: applied state from master');
    }
  }
  
  /**
   * Solicita un cambio al master
   */
  requestChange(type: string, value?: any): void {
    if (this.isMaster || !window.opener) {
      console.warn('⚠️ SyncService: solo Slaves pueden solicitar cambios');
      return;
    }
    
    const message: SyncMessage = {
      type: SyncMessageType.REQUEST_CHANGE,
      timestamp: Date.now(),
      slaveId: `slave-${Date.now()}`,
      payload: { type, value }
    };
    
    window.opener.postMessage(message, '*');
  }
  
  // ============================================================================
  // CLEANUP
  // ============================================================================
  
  /**
   * Limpia recursos y desuscribe listeners
   */
  dispose(): void {
    window.removeEventListener('message', this.handleSlaveMessage);
    window.removeEventListener('message', this.handleMasterMessage);
    
    if (this.throttleTimeout !== null) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = null;
    }
    
    if (this.unsubscribe !== null) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    this.slaves.clear();
    this.commandQueue = [];
    
    console.log('🔄 SyncService: disposed');
  }
  
  // ============================================================================
  // UTILIDADES
  // ============================================================================
  
  /**
   * Obtiene información de slaves registrados
   */
  getSlaves(): SlaveInfo[] {
    return Array.from(this.slaves.values());
  }
  
  /**
   * Verifica si está en modo master
   */
  isMasterMode(): boolean {
    return this.isMaster;
  }
  
  /**
   * Verifica si hay slaves conectados
   */
  hasSlaves(): boolean {
    return this.slaves.size > 0;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const syncService = new SyncService();

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__SYNC_SERVICE__ = syncService;
  console.log('🔧 SyncService expuesto en window.__SYNC_SERVICE__');
}
