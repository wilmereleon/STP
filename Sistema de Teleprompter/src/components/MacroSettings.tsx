// ...existing code...
import React from "react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MacroSettings as MacroSettingsType, getKeyDisplayName, availableKeys } from "./useMacros";

interface MacroSettingsProps {
  macroSettings: MacroSettingsType;
  onMacroSettingsChange: (settings: MacroSettingsType) => void;
}

export function MacroSettings({ macroSettings, onMacroSettingsChange }: MacroSettingsProps) {
  const handleMacroChange = (action: keyof MacroSettingsType, keyCode: string) => {
    onMacroSettingsChange({
      ...macroSettings,
      [action]: keyCode
    });
  };

  const macroActions: { action: keyof MacroSettingsType; label: string; description: string }[] = [
    { action: 'playStop', label: 'Play/Stop', description: 'Start or stop teleprompter' },
    { action: 'pause', label: 'Pause', description: 'Pause teleprompter' },
    { action: 'previousScript', label: 'Previous Script', description: 'Go to previous script in run order' },
    { action: 'nextScript', label: 'Next Script', description: 'Go to next script in run order' },
    { action: 'increaseSpeed', label: 'Increase Speed', description: 'Increase scroll speed' },
    { action: 'decreaseSpeed', label: 'Decrease Speed', description: 'Decrease scroll speed' }
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

        {macroActions.map(({ action, label, description }) => {
          const rawValue = macroSettings[action];
          const currentValue = (rawValue ?? '') as string;
          return (
            <div key={String(action)} className="space-y-2">
              <Label htmlFor={`macro-${String(action)}`}>{label}</Label>
              <p className="text-xs text-muted-foreground">{description}</p>
              <Select
                value={currentValue}
                onValueChange={(value: string) => handleMacroChange(action, value)}
              >
                <SelectTrigger id={`macro-${String(action)}`}>
                  <SelectValue placeholder="Select a key">
                    {getKeyDisplayName(currentValue) || '—'}
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
          );
        })}

        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <h4 className="text-sm font-medium mb-2">Current Shortcuts:</h4>
          <div className="text-xs space-y-1">
            {macroActions.map(({ action, label }) => (
              <div key={`summary-${String(action)}`} className="flex justify-between">
                <span>{label}:</span>
                <kbd className="px-2 py-1 bg-background border rounded text-xs">
                  {getKeyDisplayName((macroSettings[action] ?? '') as string)}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}