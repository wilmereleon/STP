import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { X, Target } from 'lucide-react';

interface GuideLineSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  guideLinePosition: number;
  onGuideLinePositionChange: (position: number) => void;
}

export function GuideLineSettings({ 
  isOpen, 
  onClose, 
  guideLinePosition,
  onGuideLinePositionChange 
}: GuideLineSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-8 right-0 z-50">
      <Card className="w-80 bg-gray-700 border-gray-600 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-white" />
              <CardTitle className="text-white text-sm">Posición del Apuntador</CardTitle>
            </div>
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300 text-xs">Posición Vertical</Label>
              <span className="text-gray-300 text-xs">{guideLinePosition}%</span>
            </div>
            <Slider
              value={[guideLinePosition]}
              onValueChange={(value: number[]) => onGuideLinePositionChange(value[0])}
              max={80}
              min={20}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Arriba</span>
              <span>Centro</span>
              <span>Abajo</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-600">
            <div className="flex gap-2">
              <Button
                onClick={() => onGuideLinePositionChange(30)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-gray-600 text-white bg-gray-800 hover:bg-gray-600"
              >
                Arriba
              </Button>
              <Button
                onClick={() => onGuideLinePositionChange(50)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-gray-600 text-white bg-gray-800 hover:bg-gray-600"
              >
                Centro
              </Button>
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