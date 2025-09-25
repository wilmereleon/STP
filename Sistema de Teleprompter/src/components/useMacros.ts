import { useEffect } from 'react';

export interface MacroSettings {
  playStop: string;
  pause: string;
  previousScript: string;
  nextScript: string;
  increaseSpeed: string;
  decreaseSpeed: string;
  increaseFontSize?: string;
  decreaseFontSize?: string;
  nextCue?: string;
  previousCue?: string;
}

export const defaultMacroSettings: MacroSettings = {
  playStop: 'F10',
  pause: 'F9',
  previousScript: 'F11',
  nextScript: 'F12',
  increaseSpeed: 'F1',
  decreaseSpeed: 'F2',
  increaseFontSize: 'F3',
  decreaseFontSize: 'F4',
  nextCue: 'PageDown',
  previousCue: 'PageUp',
};

interface MacroActions {
  onPlayStop: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onIncreaseSpeed: () => void;
  onDecreaseSpeed: () => void;
  onIncreaseFontSize?: () => void;
  onDecreaseFontSize?: () => void;
  onNextCue?: () => void;
  onPreviousCue?: () => void;
}

export function useMacros(macroSettings: MacroSettings, actions: MacroActions, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent macros when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = event.code;
      
      switch (key) {
        case macroSettings.playStop:
          event.preventDefault();
          actions.onPlayStop();
          break;
        case macroSettings.pause:
          event.preventDefault();
          actions.onPause();
          break;
        case macroSettings.previousScript:
          event.preventDefault();
          actions.onPrevious();
          break;
        case macroSettings.nextScript:
          event.preventDefault();
          actions.onNext();
          break;
        case macroSettings.increaseSpeed:
          event.preventDefault();
          actions.onIncreaseSpeed();
          break;
        case macroSettings.decreaseSpeed:
          event.preventDefault();
          actions.onDecreaseSpeed();
          break;
        case macroSettings.increaseFontSize:
          if (actions.onIncreaseFontSize) {
            event.preventDefault();
            actions.onIncreaseFontSize();
          }
          break;
        case macroSettings.decreaseFontSize:
          if (actions.onDecreaseFontSize) {
            event.preventDefault();
            actions.onDecreaseFontSize();
          }
          break;
        case macroSettings.nextCue:
          if (actions.onNextCue) {
            event.preventDefault();
            actions.onNextCue();
          }
          break;
        case macroSettings.previousCue:
          if (actions.onPreviousCue) {
            event.preventDefault();
            actions.onPreviousCue();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [macroSettings, actions, enabled]);
}

// Helper function to get display name for key codes
export function getKeyDisplayName(keyCode: string): string {
  const keyMap: { [key: string]: string } = {
    'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5', 'F6': 'F6',
    'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
    'Space': 'Space', 'Enter': 'Enter', 'Escape': 'Esc',
    'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←', 'ArrowRight': '→',
    'KeyA': 'A', 'KeyB': 'B', 'KeyC': 'C', 'KeyD': 'D', 'KeyE': 'E',
    'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyI': 'I', 'KeyJ': 'J',
    'KeyK': 'K', 'KeyL': 'L', 'KeyM': 'M', 'KeyN': 'N', 'KeyO': 'O',
    'KeyP': 'P', 'KeyQ': 'Q', 'KeyR': 'R', 'KeyS': 'S', 'KeyT': 'T',
    'KeyU': 'U', 'KeyV': 'V', 'KeyW': 'W', 'KeyX': 'X', 'KeyY': 'Y', 'KeyZ': 'Z'
  };
  
  return keyMap[keyCode] || keyCode;
}

// Available function keys for macro assignment
export const availableKeys = [
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Space', 'Enter', 'Escape',
  'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH', 'KeyI', 'KeyJ',
  'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT',
  'KeyU', 'KeyV', 'KeyW', 'KeyX', 'KeyY', 'KeyZ'
];