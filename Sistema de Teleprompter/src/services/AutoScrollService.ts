/**
 * AutoScrollService - Servicio de auto-scroll unificado
 * 
 * Implementa un sistema de auto-scroll consistente a 60 FPS que actualiza
 * el TeleprompterStore. Resuelve el problema de cálculos duplicados y
 * desincronización entre Preview y TeleprompterWindow.
 * 
 * @version 2.0.0
 * @pattern Service Layer
 */

import { teleprompterStore } from '../stores/TeleprompterStore';

export class AutoScrollService {
  private intervalId: number | null = null;
  private lastUpdateTime: number = 0;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS; // ~16.67ms
  private isRunning = false;
  
  /**
   * Inicia el auto-scroll
   */
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ AutoScrollService: ya está corriendo');
      return;
    }
    
    this.isRunning = true;
    this.lastUpdateTime = Date.now();
    
    this.intervalId = window.setInterval(
      () => this.tick(),
      this.frameTime
    );
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🟢 AutoScrollService: started @ ${this.targetFPS} FPS`);
    }
  }
  
  /**
   * Detiene el auto-scroll
   */
  stop(): void {
    if (!this.isRunning) return;
    
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 AutoScrollService: stopped');
    }
  }
  
  /**
   * Verifica si está corriendo
   */
  isActive(): boolean {
    return this.isRunning;
  }
  
  /**
   * Frame tick @ 60 FPS
   */
  private tick(): void {
    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    
    const state = teleprompterStore.getState();
    
    // Si no está playing, detenerse
    if (!state.isPlaying) {
      this.stop();
      return;
    }
    
    // Calcular incremento de scroll
    const increment = this.calculateIncrement(deltaTime, state.speed);
    const newPosition = state.scrollPosition + increment;
    
    // Detectar fin del texto
    if (this.detectEndOfText(state.text, newPosition)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔚 AutoScrollService: fin del texto detectado');
      }
      
      this.stop();
      teleprompterStore.pause();
      
      // TODO: Auto-advance al siguiente script del Run Order
      // runOrderStore.nextItem();
      
      return;
    }
    
    // Actualizar posición en el store
    teleprompterStore.setScrollPosition(newPosition);
  }
  
  /**
   * Calcula el incremento de scroll basado en velocidad y deltaTime
   * 
   * Fórmula unificada:
   * - speed=1.0 → 1 píxel por frame @ 60 FPS
   * - speed=2.0 → 2 píxeles por frame
   * - Ajustado por deltaTime para compensar variaciones de rendimiento
   * 
   * @param deltaTime - Tiempo transcurrido desde último frame (ms)
   * @param speed - Velocidad configurada (0.1 - 5.0)
   * @returns Incremento en píxeles
   */
  private calculateIncrement(deltaTime: number, speed: number): number {
    // Píxeles por segundo = speed * targetFPS
    // Ej: speed=1.0 @ 60 FPS = 60 px/s
    const pixelsPerSecond = speed * this.targetFPS;
    
    // Convertir a píxeles para este frame específico
    const increment = (pixelsPerSecond / 1000) * deltaTime;
    
    return increment;
  }
  
  /**
   * Detecta si se llegó al final del texto
   * 
   * @param text - Texto del script
   * @param scrollPosition - Posición actual del scroll
   * @returns true si llegó al final
   */
  private detectEndOfText(text: string, scrollPosition: number): boolean {
    const lines = text.split('\n');
    const lineHeight = 40; // Altura estimada por línea en píxeles
    
    // Altura total estimada del contenido
    const estimatedHeight = lines.length * lineHeight;
    
    // Altura del viewport (área visible)
    const viewportHeight = 800; // TODO: Obtener dinámicamente
    
    // Posición máxima antes de llegar al final
    // Se agrega viewportHeight para permitir scroll hasta que la última línea
    // llegue a la línea guía (no al fondo de la pantalla)
    const maxScroll = estimatedHeight + viewportHeight;
    
    return scrollPosition >= maxScroll;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Instancia única del AutoScrollService
 */
export const autoScrollService = new AutoScrollService();

// Conectar con el store para auto-start/stop
teleprompterStore.subscribe((state) => {
  if (state.isPlaying && !autoScrollService.isActive()) {
    autoScrollService.start();
  } else if (!state.isPlaying && autoScrollService.isActive()) {
    autoScrollService.stop();
  }
});

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__AUTO_SCROLL_SERVICE__ = autoScrollService;
  console.log('🔧 AutoScrollService expuesto en window.__AUTO_SCROLL_SERVICE__');
}
