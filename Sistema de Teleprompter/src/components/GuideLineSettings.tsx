// Importaciones de React
import { useState } from 'react';

// Importaciones de componentes UI
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';

// Importaciones de íconos
import { X, Target } from 'lucide-react';

/**
 * Props del componente GuideLineSettings
 * 
 * @property {boolean} isOpen - Indica si el panel de configuración está visible
 * @property {function} onClose - Callback que se ejecuta al cerrar el panel
 * @property {number} guideLinePosition - Posición vertical actual de la línea guía (porcentaje 0-100)
 * @property {function} onGuideLinePositionChange - Callback ejecutado cuando cambia la posición de la línea guía
 */
interface GuideLineSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  guideLinePosition: number;
  onGuideLinePositionChange: (position: number) => void;
}

/**
 * GuideLineSettings - Panel de configuración de la línea guía de lectura
 * 
 * Componente que renderiza un panel flotante para ajustar la posición vertical
 * de la línea guía (apuntador) que ayuda al locutor a mantener el foco durante
 * la lectura del teleprompter.
 * 
 * Características:
 * - Slider continuo para ajuste fino (20% a 80%)
 * - Botones de posición rápida (Arriba, Centro, Abajo)
 * - Visualización del porcentaje actual
 * - Panel posicionado absolutamente en la esquina superior derecha
 * 
 * @component
 * @param {GuideLineSettingsProps} props - Propiedades del componente
 * @returns {JSX.Element | null} Panel de configuración o null si está cerrado
 */
export function GuideLineSettings({ 
  isOpen, 
  onClose, 
  guideLinePosition,
  onGuideLinePositionChange 
}: GuideLineSettingsProps) {
  // Si el panel no está abierto, no renderiza nada
  // Si el panel no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    // Contenedor principal posicionado absolutamente en la esquina superior derecha
    <div className="absolute top-8 right-0 z-50">
      <Card className="w-80 bg-gray-700 border-gray-600 shadow-2xl">
        
        {/* ===== HEADER DEL PANEL ===== */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {/* Título con ícono de Target (diana) */}
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-white" />
              <CardTitle className="text-white text-sm">Posición del Apuntador</CardTitle>
            </div>
            
            {/* Botón de cerrar (X) */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        {/* ===== CONTENIDO DEL PANEL ===== */}
        <CardContent className="space-y-4">
          
          {/* ===== SECCIÓN DE SLIDER ===== */}
          <div className="space-y-2">
            {/* Etiqueta y valor actual */}
            <div className="flex items-center justify-between">
              <Label className="text-gray-300 text-xs">Posición Vertical</Label>
              <span className="text-gray-300 text-xs">{guideLinePosition}%</span>
            </div>
            
            {/* Slider para ajuste continuo de posición */}
            {/* Rango: 20% (arriba) a 80% (abajo) con pasos de 5% */}
            <Slider
              value={[guideLinePosition]}
              onValueChange={(value: number[]) => onGuideLinePositionChange(value[0])}
              max={80}
              min={20}
              step={5}
              className="w-full"
            />
            
            {/* Etiquetas de referencia bajo el slider */}
            <div className="flex justify-between text-xs text-gray-400">
              <span>Arriba</span>
              <span>Centro</span>
              <span>Abajo</span>
            </div>
          </div>
          
          {/* ===== SECCIÓN DE BOTONES DE POSICIÓN RÁPIDA ===== */}
          <div className="pt-2 border-t border-gray-600">
            <div className="flex gap-2">
              {/* Botón: Posición Arriba (30%) */}
              <Button
                onClick={() => onGuideLinePositionChange(30)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-gray-600 text-white bg-gray-800 hover:bg-gray-600"
              >
                Arriba
              </Button>
              
              {/* Botón: Posición Centro (50%) */}
              <Button
                onClick={() => onGuideLinePositionChange(50)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-gray-600 text-white bg-gray-800 hover:bg-gray-600"
              >
                Centro
              </Button>
              
              {/* Botón: Posición Abajo (70%) */}
              <Button
                onClick={() => onGuideLinePositionChange(70)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-gray-600 text-white bg-gray-800 hover:bg-gray-600"
              >
                Abajo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}