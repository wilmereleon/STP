// ===== IMPORTACIONES / IMPORTS =====
// React core / React núcleo
import React from "react";
// Componentes de diálogo modal / Modal dialog components
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
// Componentes UI reutilizables / Reusable UI components
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// Componente de configuración de macros / Macro configuration component
import { MacroSettings } from "./MacroSettings";
// Tipo de configuración de macros / Macro settings type
import type { MacroSettings as MacroSettingsType } from "./useMacros";

/**
 * Propiedades del componente SettingsDialog
 * SettingsDialog component properties
 * 
 * @interface SettingsDialogProps
 * @property {boolean} isOpen - Estado de apertura del diálogo / Dialog open state
 * @property {() => void} onClose - Callback para cerrar el diálogo / Callback to close dialog
 * @property {Object} settings - Configuración actual del teleprompter / Current teleprompter settings
 * @property {number} settings.brightness - Brillo (0-100%) / Brightness (0-100%)
 * @property {number} settings.fontSize - Tamaño de fuente (12-72px) / Font size (12-72px)
 * @property {number} settings.scrollSpeed - Velocidad de scroll (1-20x) / Scroll speed (1-20x)
 * @property {string} settings.backgroundColor - Color de fondo (hex) / Background color (hex)
 * @property {string} settings.textColor - Color del texto (hex) / Text color (hex)
 * @property {string} settings.fontFamily - Familia de fuente / Font family
 * @property {boolean} settings.enableMirror - Habilitar modo espejo / Enable mirror mode
 * @property {boolean} settings.enableOutline - Habilitar contorno de texto / Enable text outline
 * @property {number} settings.margins - Márgenes laterales (0-100px) / Side margins (0-100px)
 * @property {MacroSettingsType} macroSettings - Configuración de atajos de teclado / Keyboard shortcuts configuration
 * @property {(settings: any) => void} onSettingsChange - Callback al cambiar configuración / Callback when settings change
 * @property {(macroSettings: MacroSettingsType) => void} onMacroSettingsChange - Callback al cambiar macros / Callback when macros change
 */
interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    brightness: number;
    fontSize: number;
    scrollSpeed: number;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    enableMirror: boolean;
    enableOutline: boolean;
    margins: number;
  };
  macroSettings: MacroSettingsType;
  onSettingsChange: (settings: any) => void;
  onMacroSettingsChange: (macroSettings: MacroSettingsType) => void;
}

/**
 * SettingsDialog - Diálogo de configuración del teleprompter
 * SettingsDialog - Teleprompter configuration dialog
 * 
 * Componente modal con pestañas que permite configurar:
 * - General: brillo, tamaño de fuente, velocidad de scroll, márgenes
 * - Network: control remoto, modo espejo, puerto de red
 * - Font/Zone: familia de fuente, colores de fondo/texto, contorno
 * - Macros: atajos de teclado personalizables
 * - Dock Module: configuración del módulo dock
 * 
 * Modal component with tabs that allows configuring:
 * - General: brightness, font size, scroll speed, margins
 * - Network: remote control, mirror mode, network port
 * - Font/Zone: font family, background/text colors, outline
 * - Macros: customizable keyboard shortcuts
 * - Dock Module: dock module configuration
 * 
 * @component
 * @param {SettingsDialogProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element} Diálogo de configuración / Settings dialog
 */
export function SettingsDialog({
  isOpen,
  onClose,
  settings,
  macroSettings,
  onSettingsChange,
  onMacroSettingsChange
}: SettingsDialogProps) {
  /**
   * Actualiza una configuración específica manteniendo las demás intactas
   * Updates a specific setting while keeping others intact
   * 
   * @param {string} key - Clave de la configuración / Setting key
   * @param {any} value - Nuevo valor / New value
   */
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogTitle>Teleprompter Settings</DialogTitle>
        <DialogDescription>
          Configure your teleprompter display and behavior settings
        </DialogDescription>
        
        {/* ===== SISTEMA DE PESTAÑAS / TABS SYSTEM ===== */}
        {/* 5 pestañas: General, Network, Font/Zone, Macros, Dock Module / 5 tabs: General, Network, Font/Zone, Macros, Dock Module */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="font">Font/Zone</TabsTrigger>
            <TabsTrigger value="macros">Macros</TabsTrigger>
            <TabsTrigger value="dock">Dock Module</TabsTrigger>
          </TabsList>
          
          {/* ===== CONTENEDOR CON SCROLL / SCROLL CONTAINER ===== */}
          {/* max-h-[50vh] permite scroll cuando el contenido es extenso / max-h-[50vh] allows scrolling when content is extensive */}
          <div className="mt-4 max-h-[50vh] overflow-y-auto">
            {/* ===== PESTAÑA GENERAL / GENERAL TAB ===== */}
            {/* Configuraciones principales de visualización / Main display settings */}
            <TabsContent value="general" className="space-y-4 m-0">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  {/* Control de brillo / Brightness control */}
                  <div className="space-y-2">
                    <Label>Brightness</Label>
                    <Slider
                      value={[settings.brightness]}
                      onValueChange={(value: number[]) => updateSetting('brightness', value[0])}
                      max={100}
                      min={0}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">{settings.brightness}%</div>
                  </div>
                  
                  {/* Control de tamaño de fuente / Font size control */}
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={(value: number[]) => updateSetting('fontSize', value[0])}
                      max={72}
                      min={12}
                      step={2}
                    />
                    <div className="text-sm text-muted-foreground">{settings.fontSize}px</div>
                  </div>
                  
                  {/* Control de velocidad de scroll / Scroll speed control */}
                  <div className="space-y-2">
                    <Label>Scroll Speed</Label>
                    <Slider
                      value={[settings.scrollSpeed]}
                      onValueChange={(value: number[]) => updateSetting('scrollSpeed', value[0])}
                      max={20}
                      min={1}
                      step={0.5}
                    />
                    <div className="text-sm text-muted-foreground">{settings.scrollSpeed}x</div>
                  </div>
                  
                  {/* Control de márgenes laterales / Side margins control */}
                  <div className="space-y-2">
                    <Label>Margins</Label>
                    <Slider
                      value={[settings.margins]}
                      onValueChange={(value: number[]) => updateSetting('margins', value[0])}
                      max={100}
                      min={0}
                      step={5}
                    />
                    <div className="text-sm text-muted-foreground">{settings.margins}px</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ===== PESTAÑA DE RED / NETWORK TAB ===== */}
            {/* Configuraciones de red y control remoto / Network and remote control settings */}
            <TabsContent value="network" className="space-y-4 m-0">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    Network settings for remote control and monitoring
                  </div>
                  {/* Habilitar control remoto / Enable remote control */}
                  <div className="flex items-center justify-between">
                    <Label>Enable Remote Control</Label>
                    <Switch
                      checked={false}
                      onCheckedChange={(checked: boolean) => {
                        updateSetting('enableRemote', checked);
                      }}
                    />
                  </div>
                  {/* Modo espejo (flip horizontal) / Mirror mode (horizontal flip) */}
                  <div className="flex items-center justify-between">
                    <Label>Mirror Mode</Label>
                    <Switch 
                      checked={settings.enableMirror}
                      onCheckedChange={(checked: boolean) => updateSetting('enableMirror', checked)}
                    />
                  </div>
                  {/* Selector de puerto de red / Network port selector */}
                  <div className="space-y-2">
                    <Label>Network Port</Label>
                    <Select defaultValue="8080" onValueChange={(value: string) => updateSetting('networkPort', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8080">8080</SelectItem>
                        <SelectItem value="3000">3000</SelectItem>
                        <SelectItem value="5000">5000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ===== PESTAÑA DE FUENTE Y ZONA / FONT/ZONE TAB ===== */}
            {/* Configuraciones de apariencia visual del texto / Visual appearance settings for text */}
            <TabsContent value="font" className="space-y-4 m-0">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  {/* Selector de familia de fuente / Font family selector */}
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select 
                      value={settings.fontFamily}
                      onValueChange={(value: string) => updateSetting('fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Selector de color de fondo / Background color selector */}
                  {/* Paleta de 4 colores: Negro, Blanco, Azul, Verde / 4-color palette: Black, White, Blue, Green */}
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      {['#000000', '#ffffff', '#0000ff', '#008000'].map((color) => (
                        <Button
                          key={color}
                          className="w-8 h-8 p-0 rounded"
                          style={{ backgroundColor: color }}
                          variant={settings.backgroundColor === color ? "default" : "outline"}
                          onClick={() => updateSetting('backgroundColor', color)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Selector de color de texto / Text color selector */}
                  {/* Paleta de 4 colores: Blanco, Negro, Amarillo, Rojo / 4-color palette: White, Black, Yellow, Red */}
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      {['#ffffff', '#000000', '#ffff00', '#ff0000'].map((color) => (
                        <Button
                          key={color}
                          className="w-8 h-8 p-0 rounded"
                          style={{ backgroundColor: color }}
                          variant={settings.textColor === color ? "default" : "outline"}
                          onClick={() => updateSetting('textColor', color)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Switch de contorno de texto / Text outline switch */}
                  {/* Mejora la legibilidad sobre fondos complejos / Improves readability on complex backgrounds */}
                  <div className="flex items-center justify-between">
                    <Label>Text Outline</Label>
                    <Switch 
                      checked={settings.enableOutline}
                      onCheckedChange={(checked: boolean) => updateSetting('enableOutline', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== PESTAÑA DE MACROS / MACROS TAB ===== */}
            {/* Configuración de atajos de teclado personalizables / Customizable keyboard shortcuts configuration */}
            {/* Delega la interfaz al componente MacroSettings / Delegates interface to MacroSettings component */}
            <TabsContent value="macros" className="space-y-4 m-0">
              <MacroSettings 
                macroSettings={macroSettings}
                onMacroSettingsChange={onMacroSettingsChange}
              />
            </TabsContent>
            
            {/* ===== PESTAÑA DE MÓDULO DOCK / DOCK MODULE TAB ===== */}
            {/* Configuración del módulo dock para paneles auxiliares / Dock module configuration for auxiliary panels */}
            <TabsContent value="dock" className="space-y-4 m-0">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    Dock module configuration and layout settings
                  </div>
                  {/* Habilitar módulo dock / Enable dock module */}
                  <div className="flex items-center justify-between">
                    <Label>Enable Dock Module</Label>
                    <Switch
                      checked={false}
                      onCheckedChange={(checked: boolean) => updateSetting('enableDock', checked)}
                    />
                  </div>
                  {/* Auto-ocultar dock / Auto-hide dock */}
                  <div className="flex items-center justify-between">
                    <Label>Auto-hide Dock</Label>
                    <Switch
                      checked={false}
                      onCheckedChange={(checked: boolean) => updateSetting('autoHideDock', checked)}
                    />
                  </div>
                  {/* Selector de posición del dock / Dock position selector */}
                  {/* 4 posiciones: Arriba, Abajo, Izquierda, Derecha / 4 positions: Top, Bottom, Left, Right */}
                  <div className="space-y-2">
                    <Label>Dock Position</Label>
                    <Select defaultValue="bottom" onValueChange={(value: string) => updateSetting('dockPosition', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
        
        {/* ===== BOTONES DE ACCIÓN / ACTION BUTTONS ===== */}
        {/* Barra inferior con botones Cancelar y Aplicar / Bottom bar with Cancel and Apply buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {/* Botón cancelar: cierra sin guardar cambios / Cancel button: closes without saving changes */}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {/* Botón aplicar: guarda cambios y cierra el diálogo / Apply button: saves changes and closes dialog */}
          <Button onClick={() => { onSettingsChange(settings); onClose(); }}>
            Apply Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}