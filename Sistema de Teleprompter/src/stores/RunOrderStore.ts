/**
 * RunOrderStore - Gestión del orden de ejecución de scripts
 * 
 * Maneja la lista de scripts (Run Order) con operaciones CRUD
 * y notifica cambios a los suscriptores.
 * 
 * @version 2.0.0
 * @pattern Observer (Publish-Subscribe)
 */

export type ItemStatus = 'ready' | 'active' | 'completed' | 'skipped';

export interface RunOrderItem {
  /** ID único del item */
  id: string;
  
  /** Título del script */
  title: string;
  
  /** Contenido del script */
  text: string;
  
  /** Duración estimada (formato HH:MM:SS) */
  duration: string;
  
  /** Estado actual del item */
  status: ItemStatus;
  
  /** Notas adicionales */
  notes?: string;
  
  /** Fecha de creación */
  createdAt: Date;
  
  /** Fecha de última modificación */
  updatedAt: Date;
  
  /** Ruta del archivo fuente (.txt, .xlsx, .awn) */
  sourcePath?: string;
}

export interface RunOrderState {
  /** Lista de items en orden */
  items: RunOrderItem[];
  
  /** ID del item activo actualmente */
  activeItemId: string | null;
  
  /** Índice del item activo (para navegación rápida) */
  activeIndex: number;
  
  /** Timestamp de última actualización */
  timestamp: number;
}

/**
 * Tipo de función listener
 */
type Listener = (state: RunOrderState) => void;

/**
 * RunOrderStore - Almacén del Run Order
 */
class RunOrderStore {
  private state: RunOrderState;
  private listeners = new Set<Listener>();
  
  constructor() {
    this.state = this.getInitialState();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🟢 RunOrderStore: initialized');
    }
  }
  
  /**
   * Obtiene una copia del estado actual
   */
  getState(): RunOrderState {
    return {
      ...this.state,
      items: [...this.state.items]
    };
  }
  
  /**
   * Obtiene solo la lista de items (sin metadatos)
   */
  getItems(): RunOrderItem[] {
    return [...this.state.items];
  }
  
  /**
   * Obtiene el item activo actual
   */
  getActiveItem(): RunOrderItem | null {
    if (this.state.activeItemId === null) return null;
    return this.state.items.find(item => item.id === this.state.activeItemId) || null;
  }
  
  /**
   * Obtiene un item por ID
   */
  getItemById(id: string): RunOrderItem | null {
    return this.state.items.find(item => item.id === id) || null;
  }
  
  /**
   * Suscribe un listener
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📢 RunOrderStore: listener subscribed (total: ${this.listeners.size})`);
    }
    
    return () => {
      this.listeners.delete(listener);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📢 RunOrderStore: listener unsubscribed (total: ${this.listeners.size})`);
      }
    };
  }
  
  // ============================================================================
  // OPERACIONES CRUD
  // ============================================================================
  
  /**
   * Agrega un nuevo item al final de la lista
   */
  addItem(item: Omit<RunOrderItem, 'id' | 'createdAt' | 'updatedAt'>): RunOrderItem {
    const newItem: RunOrderItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.setState({
      items: [...this.state.items, newItem]
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`➕ RunOrderStore: added item "${newItem.title}" (total: ${this.state.items.length})`);
    }
    
    return newItem;
  }
  
  /**
   * Inserta un item en una posición específica
   */
  insertItem(item: Omit<RunOrderItem, 'id' | 'createdAt' | 'updatedAt'>, index: number): RunOrderItem {
    const newItem: RunOrderItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newItems = [...this.state.items];
    newItems.splice(index, 0, newItem);
    
    this.setState({ items: newItems });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`➕ RunOrderStore: inserted item "${newItem.title}" at index ${index}`);
    }
    
    return newItem;
  }
  
  /**
   * Actualiza un item existente
   */
  updateItem(id: string, updates: Partial<Omit<RunOrderItem, 'id' | 'createdAt'>>): boolean {
    const index = this.state.items.findIndex(item => item.id === id);
    
    if (index === -1) {
      console.warn(`⚠️ RunOrderStore: item ${id} not found for update`);
      return false;
    }
    
    const newItems = [...this.state.items];
    newItems[index] = {
      ...newItems[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.setState({ items: newItems });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✏️ RunOrderStore: updated item "${newItems[index].title}"`);
    }
    
    return true;
  }
  
  /**
   * Elimina un item por ID
   */
  deleteItem(id: string): boolean {
    const index = this.state.items.findIndex(item => item.id === id);
    
    if (index === -1) {
      console.warn(`⚠️ RunOrderStore: item ${id} not found for deletion`);
      return false;
    }
    
    const deletedItem = this.state.items[index];
    const newItems = this.state.items.filter(item => item.id !== id);
    
    // Si se elimina el item activo, desactivar
    const newState: Partial<RunOrderState> = { items: newItems };
    if (this.state.activeItemId === id) {
      newState.activeItemId = null;
      newState.activeIndex = -1;
    } else if (this.state.activeIndex > index) {
      // Ajustar índice si el activo está después del eliminado
      newState.activeIndex = this.state.activeIndex - 1;
    }
    
    this.setState(newState);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🗑️ RunOrderStore: deleted item "${deletedItem.title}" (remaining: ${newItems.length})`);
    }
    
    return true;
  }
  
  /**
   * Reemplaza toda la lista de items (usado para importar)
   */
  setItems(items: RunOrderItem[]): void {
    this.setState({
      items: [...items],
      activeItemId: null,
      activeIndex: -1
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 RunOrderStore: replaced items (total: ${items.length})`);
    }
  }
  
  /**
   * Limpia todos los items
   */
  clearItems(): void {
    this.setState({
      items: [],
      activeItemId: null,
      activeIndex: -1
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️ RunOrderStore: cleared all items');
    }
  }
  
  // ============================================================================
  // REORDENAMIENTO
  // ============================================================================
  
  /**
   * Mueve un item de una posición a otra
   */
  reorderItem(fromIndex: number, toIndex: number): boolean {
    if (fromIndex < 0 || fromIndex >= this.state.items.length) return false;
    if (toIndex < 0 || toIndex >= this.state.items.length) return false;
    if (fromIndex === toIndex) return false;
    
    const newItems = [...this.state.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Ajustar activeIndex si es necesario
    let newActiveIndex = this.state.activeIndex;
    if (this.state.activeIndex === fromIndex) {
      newActiveIndex = toIndex;
    } else if (fromIndex < this.state.activeIndex && toIndex >= this.state.activeIndex) {
      newActiveIndex--;
    } else if (fromIndex > this.state.activeIndex && toIndex <= this.state.activeIndex) {
      newActiveIndex++;
    }
    
    this.setState({
      items: newItems,
      activeIndex: newActiveIndex
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 RunOrderStore: moved item from ${fromIndex} to ${toIndex}`);
    }
    
    return true;
  }
  
  // ============================================================================
  // NAVEGACIÓN Y ACTIVACIÓN
  // ============================================================================
  
  /**
   * Activa un item por ID
   */
  setActiveItem(id: string | null): boolean {
    if (id === null) {
      this.setState({
        activeItemId: null,
        activeIndex: -1
      });
      return true;
    }
    
    const index = this.state.items.findIndex(item => item.id === id);
    
    if (index === -1) {
      console.warn(`⚠️ RunOrderStore: item ${id} not found for activation`);
      return false;
    }
    
    // Actualizar estados de items
    const newItems = this.state.items.map((item, idx) => ({
      ...item,
      status: idx === index ? 'active' as ItemStatus : 
              idx < index ? 'completed' as ItemStatus :
              'ready' as ItemStatus
    }));
    
    this.setState({
      items: newItems,
      activeItemId: id,
      activeIndex: index
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 RunOrderStore: activated item "${newItems[index].title}" (${index + 1}/${newItems.length})`);
    }
    
    return true;
  }
  
  /**
   * Avanza al siguiente item
   */
  nextItem(): boolean {
    const nextIndex = this.state.activeIndex + 1;
    
    if (nextIndex >= this.state.items.length) {
      console.warn('⚠️ RunOrderStore: already at last item');
      return false;
    }
    
    const nextItem = this.state.items[nextIndex];
    return this.setActiveItem(nextItem.id);
  }
  
  /**
   * Retrocede al item anterior
   */
  previousItem(): boolean {
    const prevIndex = this.state.activeIndex - 1;
    
    if (prevIndex < 0) {
      console.warn('⚠️ RunOrderStore: already at first item');
      return false;
    }
    
    const prevItem = this.state.items[prevIndex];
    return this.setActiveItem(prevItem.id);
  }
  
  /**
   * Va al primer item
   */
  firstItem(): boolean {
    if (this.state.items.length === 0) return false;
    return this.setActiveItem(this.state.items[0].id);
  }
  
  /**
   * Va al último item
   */
  lastItem(): boolean {
    if (this.state.items.length === 0) return false;
    return this.setActiveItem(this.state.items[this.state.items.length - 1].id);
  }
  
  // ============================================================================
  // BÚSQUEDA Y FILTRADO
  // ============================================================================
  
  /**
   * Busca items por título o contenido
   */
  searchItems(query: string): RunOrderItem[] {
    const lowerQuery = query.toLowerCase();
    
    return this.state.items.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.text.toLowerCase().includes(lowerQuery) ||
      item.notes?.toLowerCase().includes(lowerQuery)
    );
  }
  
  /**
   * Filtra items por estado
   */
  filterByStatus(status: ItemStatus): RunOrderItem[] {
    return this.state.items.filter(item => item.status === status);
  }
  
  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================
  
  private setState(partial: Partial<RunOrderState>): void {
    this.state = {
      ...this.state,
      ...partial,
      timestamp: Date.now()
    };
    
    this.notify();
  }
  
  private notify(): void {
    const state = this.getState();
    
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('❌ RunOrderStore: error in listener', error);
      }
    });
  }
  
  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getInitialState(): RunOrderState {
    return {
      items: [],
      activeItemId: null,
      activeIndex: -1,
      timestamp: Date.now()
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const runOrderStore = new RunOrderStore();

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__RUN_ORDER_STORE__ = runOrderStore;
  console.log('🔧 RunOrderStore expuesto en window.__RUN_ORDER_STORE__ para debugging');
}
