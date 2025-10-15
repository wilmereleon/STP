/**
 * useRunOrderStore - Hook personalizado para el RunOrderStore
 * 
 * Conecta componentes React con el RunOrderStore para gestionar
 * la lista de scripts (Run Order).
 * 
 * @example
 * ```tsx
 * function RunOrderPanel() {
 *   const { items, activeItem, addItem, nextItem } = useRunOrderStore();
 *   
 *   return (
 *     <div>
 *       {items.map(item => (
 *         <div key={item.id}>{item.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import {
  runOrderStore,
  type RunOrderState,
  type RunOrderItem,
  type ItemStatus
} from '../stores/RunOrderStore';

/**
 * Hook que conecta componentes con el RunOrderStore
 */
export function useRunOrderStore() {
  const [state, setState] = useState<RunOrderState>(
    runOrderStore.getState()
  );
  
  useEffect(() => {
    const unsubscribe = runOrderStore.subscribe(setState);
    return unsubscribe;
  }, []);
  
  return {
    // ===== ESTADO =====
    
    /** Lista de items del Run Order */
    items: state.items,
    
    /** ID del item activo */
    activeItemId: state.activeItemId,
    
    /** Índice del item activo */
    activeIndex: state.activeIndex,
    
    /** Timestamp de última actualización */
    timestamp: state.timestamp,
    
    /** Item activo actual (derivado) */
    activeItem: state.items.find(item => item.id === state.activeItemId) || null,
    
    /** Número total de items */
    totalItems: state.items.length,
    
    /** Hay items en la lista */
    hasItems: state.items.length > 0,
    
    /** Hay un item activo */
    hasActiveItem: state.activeItemId !== null,
    
    /** Puede avanzar al siguiente */
    canGoNext: state.activeIndex < state.items.length - 1,
    
    /** Puede retroceder al anterior */
    canGoPrevious: state.activeIndex > 0,
    
    // ===== MÉTODOS CRUD =====
    
    /**
     * Agrega un nuevo item al final
     */
    addItem: (item: Omit<RunOrderItem, 'id' | 'createdAt' | 'updatedAt'>) => 
      runOrderStore.addItem(item),
    
    /**
     * Inserta un item en posición específica
     */
    insertItem: (item: Omit<RunOrderItem, 'id' | 'createdAt' | 'updatedAt'>, index: number) => 
      runOrderStore.insertItem(item, index),
    
    /**
     * Actualiza un item existente
     */
    updateItem: (id: string, updates: Partial<Omit<RunOrderItem, 'id' | 'createdAt'>>) => 
      runOrderStore.updateItem(id, updates),
    
    /**
     * Elimina un item por ID
     */
    deleteItem: (id: string) => runOrderStore.deleteItem(id),
    
    /**
     * Reemplaza toda la lista
     */
    setItems: (items: RunOrderItem[]) => runOrderStore.setItems(items),
    
    /**
     * Limpia todos los items
     */
    clearItems: () => runOrderStore.clearItems(),
    
    // ===== REORDENAMIENTO =====
    
    /**
     * Mueve un item de una posición a otra
     */
    reorderItem: (fromIndex: number, toIndex: number) => 
      runOrderStore.reorderItem(fromIndex, toIndex),
    
    // ===== NAVEGACIÓN =====
    
    /**
     * Activa un item por ID
     */
    setActiveItem: (id: string | null) => runOrderStore.setActiveItem(id),
    
    /**
     * Avanza al siguiente item
     */
    nextItem: () => runOrderStore.nextItem(),
    
    /**
     * Retrocede al item anterior
     */
    previousItem: () => runOrderStore.previousItem(),
    
    /**
     * Va al primer item
     */
    firstItem: () => runOrderStore.firstItem(),
    
    /**
     * Va al último item
     */
    lastItem: () => runOrderStore.lastItem(),
    
    // ===== BÚSQUEDA Y FILTRADO =====
    
    /**
     * Busca items por título o contenido
     */
    searchItems: (query: string) => runOrderStore.searchItems(query),
    
    /**
     * Filtra items por estado
     */
    filterByStatus: (status: ItemStatus) => runOrderStore.filterByStatus(status),
    
    /**
     * Obtiene un item por ID
     */
    getItemById: (id: string) => runOrderStore.getItemById(id)
  };
}

/**
 * Hook simplificado que solo retorna el estado
 */
export function useRunOrderState(): RunOrderState {
  const [state, setState] = useState<RunOrderState>(
    runOrderStore.getState()
  );
  
  useEffect(() => {
    const unsubscribe = runOrderStore.subscribe(setState);
    return unsubscribe;
  }, []);
  
  return state;
}

/**
 * Hook que solo retorna la lista de items
 * Útil para componentes que solo muestran la lista
 */
export function useRunOrderItems(): RunOrderItem[] {
  const [items, setItems] = useState<RunOrderItem[]>(
    () => runOrderStore.getItems()
  );
  
  useEffect(() => {
    const unsubscribe = runOrderStore.subscribe((state) => {
      setItems(state.items);
    });
    
    return unsubscribe;
  }, []);
  
  return items;
}

/**
 * Hook que solo retorna el item activo
 * Útil para componentes que solo trabajan con el item actual
 */
export function useActiveRunOrderItem(): RunOrderItem | null {
  const [activeItem, setActiveItem] = useState<RunOrderItem | null>(
    () => runOrderStore.getActiveItem()
  );
  
  useEffect(() => {
    const unsubscribe = runOrderStore.subscribe((state) => {
      if (state.activeItemId === null) {
        setActiveItem(null);
      } else {
        const item = state.items.find(i => i.id === state.activeItemId);
        setActiveItem(item || null);
      }
    });
    
    return unsubscribe;
  }, []);
  
  return activeItem;
}
