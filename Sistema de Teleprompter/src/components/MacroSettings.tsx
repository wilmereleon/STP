import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MacroSettings as MacroSettingsType, getKeyDisplayName, availableKeys } from "./useMacros";

interface MacroSettingsProps {
  macroSettings: MacroSettingsType;
  onMacroSettingsChange: (settings: MacroSettingsType) => void;
}

export function MacroSettings({ macroSettings, onMacroSettingsChange }: MacroSettingsProps) {
  const handleMacroChange = (action: keyof MacroSettingsType, key: string) => {
    onMacroSettingsChange({
      ...macroSettings,
      [action]: key
    });
  };

  const macroActions = [
    { key: 'playStop' as keyof MacroSettingsType, label: 'Play/Stop', description: 'Start or stop teleprompter' },
    { key: 'pause' as keyof MacroSettingsType, label: 'Pause', description: 'Pause teleprompter' },
    { key: 'previousScript' as keyof MacroSettingsType, label: 'Previous Script', description: 'Go to previous script in run order' },
    { key: 'nextScript' as keyof MacroSettingsType, label: 'Next Script', description: 'Go to next script in run order' },
    { key: 'increaseSpeed' as keyof MacroSettingsType, label: 'Increase Speed', description: 'Increase scroll speed' },
    { key: 'decreaseSpeed' as keyof MacroSettingsType, label: 'Decrease Speed', description: 'Decrease scroll speed' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyboard Macros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Configure keyboard shortcuts for teleprompter control. These work globally when not typing in text fields.
        </p>
        
        {macroActions.map(({ key, label, description }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`macro-${key}`}>{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
            <Select
              value={macroSettings[key]}
              onValueChange={(value) => handleMacroChange(key, value)}
            >
              <SelectTrigger id={`macro-${key}`}>
                <SelectValue placeholder="Select a key">
                  {getKeyDisplayName(macroSettings[key])}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableKeys.map((keyCode) => (
                  <SelectItem key={keyCode} value={keyCode}>
                    {getKeyDisplayName(keyCode)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <h4 className="text-sm font-medium mb-2">Current Shortcuts:</h4>
          <div className="text-xs space-y-1">
            {macroActions.map(({ key, label }) => (
              <div key={key} className="flex justify-between">
                <span>{label}:</span>
                <kbd className="px-2 py-1 bg-background border rounded text-xs">
                  {getKeyDisplayName(macroSettings[key])}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}