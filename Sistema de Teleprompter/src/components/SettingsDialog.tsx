import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MacroSettings } from "./MacroSettings";
import { MacroSettings as MacroSettingsType } from "./useMacros";

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

export function SettingsDialog({
  isOpen,
  onClose,
  settings,
  macroSettings,
  onSettingsChange,
  onMacroSettingsChange
}: SettingsDialogProps) {
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
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="font">Font/Zone</TabsTrigger>
            <TabsTrigger value="macros">Macros</TabsTrigger>
            <TabsTrigger value="dock">Dock Module</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 max-h-[50vh] overflow-y-auto">
            <TabsContent value="general" className="space-y-4 m-0">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Brightness</Label>
                    <Slider
                      value={[settings.brightness]}
                      onValueChange={(value) => updateSetting('brightness', value[0])}
                      max={100}
                      min={0}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">{settings.brightness}%</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={(value) => updateSetting('fontSize', value[0])}
                      max={72}
                      min={12}
                      step={2}
                    />
                    <div className="text-sm text-muted-foreground">{settings.fontSize}px</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Scroll Speed</Label>
                    <Slider
                      value={[settings.scrollSpeed]}
                      onValueChange={(value) => updateSetting('scrollSpeed', value[0])}
                      max={20}
                      min={1}
                      step={0.5}
                    />
                    <div className="text-sm text-muted-foreground">{settings.scrollSpeed}x</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Margins</Label>
                    <Slider
                      value={[settings.margins]}
                      onValueChange={(value) => updateSetting('margins', value[0])}
                      max={100}
                      min={0}
                      step={5}
                    />
                    <div className="text-sm text-muted-foreground">{settings.margins}px</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="network" className="space-y-4 m-0">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    Network settings for remote control and monitoring
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Remote Control</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Mirror Mode</Label>
                    <Switch 
                      checked={settings.enableMirror}
                      onCheckedChange={(checked) => updateSetting('enableMirror', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Network Port</Label>
                    <Select defaultValue="8080">
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
            
            <TabsContent value="font" className="space-y-4 m-0">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select 
                      value={settings.fontFamily}
                      onValueChange={(value) => updateSetting('fontFamily', value)}
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
                  
                  <div className="flex items-center justify-between">
                    <Label>Text Outline</Label>
                    <Switch 
                      checked={settings.enableOutline}
                      onCheckedChange={(checked) => updateSetting('enableOutline', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="macros" className="space-y-4 m-0">
              <MacroSettings 
                macroSettings={macroSettings}
                onMacroSettingsChange={onMacroSettingsChange}
              />
            </TabsContent>
            
            <TabsContent value="dock" className="space-y-4 m-0">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    Dock module configuration and layout settings
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Dock Module</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-hide Dock</Label>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>Dock Position</Label>
                    <Select defaultValue="bottom">
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
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Apply Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}