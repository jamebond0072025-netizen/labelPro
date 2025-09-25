'use client';

import type { CanvasSettings } from '@/lib/types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';

interface CanvasPropertiesProps {
  settings: CanvasSettings;
  onUpdate: (newSettings: Partial<CanvasSettings>) => void;
}

export function CanvasProperties({ settings, onUpdate }: CanvasPropertiesProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 pt-12 bg-card h-full space-y-4">
        <h3 className="text-lg font-headline font-semibold">Canvas Settings</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="canvas-w">Width (px)</Label>
            <Input
              id="canvas-w"
              type="number"
              value={settings.width}
              onChange={(e) =>
                onUpdate({ width: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="canvas-h">Height (px)</Label>
            <Input
              id="canvas-h"
              type="number"
              value={settings.height}
              onChange={(e) =>
                onUpdate({ height: parseInt(e.target.value, 10) })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="canvas-bg">Background</Label>
            <div className="flex items-center gap-2">
                <Input
                    id="canvas-bg"
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                />
                <Input
                    type="color"
                    className="w-10 p-1"
                    value={settings.backgroundColor}
                    onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                />
            </div>
        </div>
      </div>
    </ScrollArea>
  );
}
