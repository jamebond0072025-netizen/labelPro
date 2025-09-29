

'use client';

import type { CanvasSettings } from '@/lib/types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { uploadImage } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CanvasPropertiesProps {
  settings: CanvasSettings;
  onUpdate: (newSettings: Partial<CanvasSettings>) => void;
}

const standardSizes = [
  { name: 'Custom', width: 0, height: 0 },
  { name: 'Letter (8.5" x 11")', width: 816, height: 1056 },
  { name: 'A4 (210mm x 297mm)', width: 794, height: 1123 },
  { name: 'Business Card (3.5" x 2")', width: 336, height: 192 },
  { name: 'Avery 5160 (2.625" x 1")', width: 252, height: 96 },
  { name: '4" x 6" Label', width: 384, height: 576 },
];


export function CanvasProperties({ settings, onUpdate }: CanvasPropertiesProps) {
  const [selectedSize, setSelectedSize] = useState('Custom');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token, tenantId } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    const size = standardSizes.find(s => s.name === value);
    if (size && size.name !== 'Custom') {
      onUpdate({ width: size.width, height: size.height });
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file, { token, tenantId }, toast);
        onUpdate({ backgroundImage: imageUrl });
      } catch (error) {
        console.error("Image upload failed", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pt-12 bg-card h-full space-y-4">
        <h3 className="text-lg font-headline font-semibold">Canvas Settings</h3>
        
        <div className="space-y-2">
            <Label htmlFor="page-size">Page Size</Label>
            <Select value={selectedSize} onValueChange={handleSizeChange}>
                <SelectTrigger id="page-size">
                    <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                    {standardSizes.map(size => (
                        <SelectItem key={size.name} value={size.name}>
                            {size.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {selectedSize === 'Custom' && (
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
        )}

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

        <div className="space-y-2">
            <Label>Background Image</Label>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                     {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload Image
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                 {settings.backgroundImage && (
                    <Button
                        variant="destructive-outline"
                        size="sm"
                        onClick={() => onUpdate({ backgroundImage: '' })}
                    >
                        Remove
                    </Button>
                )}
            </div>
        </div>
      </div>
    </ScrollArea>
  );
}
