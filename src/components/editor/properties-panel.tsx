
'use client';

import { CanvasObject, TextObject, BarcodeObject, CanvasSettings, ImageObject } from '@/lib/types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { CanvasProperties } from './canvas-properties';
import { Button } from '../ui/button';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

const googleFonts = [
    'Poppins', 'PT Sans', 'Roboto', 'Open Sans', 'Lato', 
    'Montserrat', 'Oswald', 'Raleway', 'Merriweather', 'Playfair Display'
];

interface PropertiesPanelProps {
  selectedObject: CanvasObject | undefined;
  onUpdate: (id: string, newProps: Partial<CanvasObject>) => void;
  canvasSettings?: CanvasSettings;
  onUpdateCanvasSettings?: (newSettings: Partial<CanvasSettings>) => void;
}

export function PropertiesPanel({
  selectedObject,
  onUpdate,
  canvasSettings,
  onUpdateCanvasSettings,
}: PropertiesPanelProps) {
  if (!selectedObject) {
    if (canvasSettings && onUpdateCanvasSettings) {
      return (
        <CanvasProperties
          settings={canvasSettings}
          onUpdate={onUpdateCanvasSettings}
        />
      );
    }
    return (
      <ScrollArea className="h-full">
        <div className="p-4 pt-12 border-l h-full bg-card">
          <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Select an object to edit</p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  const handleUpdate = (props: Partial<CanvasObject>) => {
    onUpdate(selectedObject.id, props);
  };

  const handleTextUpdate = (props: Partial<TextObject>) => {
    onUpdate(selectedObject.id, props);
  };
  
  const handleBarcodeUpdate = (props: Partial<BarcodeObject>) => {
    onUpdate(selectedObject.id, props);
  };
  
  const handleImageUpdate = (props: Partial<ImageObject>) => {
    onUpdate(selectedObject.id, props);
  };

  const renderPlaceholderKeyProperty = () => {
    if (!('key' in selectedObject) || selectedObject.key === undefined) return null;
    
    return (
        <div className="space-y-2">
            <Label htmlFor="placeholder-key">Key</Label>
            <Input
                id="placeholder-key"
                value={selectedObject.key}
                onChange={(e) => handleUpdate({ key: e.target.value })}
            />
        </div>
    );
  }

  const renderTextProperties = () => {
    if (selectedObject.type !== 'text') return null;
    const textObject = selectedObject as TextObject;
    const isPlaceholder = textObject.key !== undefined;

    return (
      <>
        {renderPlaceholderKeyProperty()}
        {!isPlaceholder && (
            <div className="space-y-2">
            <Label htmlFor="text-content">Text</Label>
            <Textarea
                id="text-content"
                value={textObject.text}
                onChange={(e) => handleTextUpdate({ text: e.target.value })}
                rows={3}
            />
            </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="font-family">Font Family</Label>
          <Select
            value={textObject.fontFamily}
            onValueChange={(value) => handleTextUpdate({ fontFamily: value })}
          >
            <SelectTrigger id="font-family">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {googleFonts.map(font => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
            <Label htmlFor="font-size">Size</Label>
            <Input
                id="font-size"
                type="number"
                value={textObject.fontSize}
                onChange={(e) =>
                handleTextUpdate({ fontSize: parseInt(e.target.value, 10) })
                }
            />
            </div>
            <div className="space-y-2">
                <Label htmlFor="font-weight">Weight</Label>
                 <Select
                    value={textObject.fontWeight}
                    onValueChange={(value: 'normal' | 'bold') => handleTextUpdate({ fontWeight: value })}
                >
                    <SelectTrigger id="font-weight">
                        <SelectValue placeholder="Weight" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
         <div className="space-y-2">
            <Label htmlFor="text-color">Color</Label>
            <div className="flex items-center gap-2">
                <Input
                    id="text-color"
                    type="text"
                    value={textObject.color}
                    onChange={(e) => handleTextUpdate({ color: e.target.value })}
                />
                <Input
                    type="color"
                    className="w-10 p-1"
                    value={textObject.color}
                    onChange={(e) => handleTextUpdate({ color: e.target.value })}
                />
            </div>
        </div>
        <div className="space-y-2">
            <Label>Alignment</Label>
            <div className="flex gap-1">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleTextUpdate({ textAlign: 'left' })}
                    className={cn(textObject.textAlign === 'left' && 'bg-accent')}
                >
                    <AlignLeft />
                </Button>
                 <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleTextUpdate({ textAlign: 'center' })}
                    className={cn(textObject.textAlign === 'center' && 'bg-accent')}
                 >
                    <AlignCenter />
                </Button>
                 <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleTextUpdate({ textAlign: 'right' })}
                    className={cn(textObject.textAlign === 'right' && 'bg-accent')}
                 >
                    <AlignRight />
                </Button>
            </div>
        </div>
      </>
    );
  };
  
    const renderBarcodeProperties = () => {
    if (selectedObject.type !== 'barcode') return null;
    const barcodeObject = selectedObject as BarcodeObject;
    const isPlaceholder = barcodeObject.key !== undefined;


    return (
      <>
        {renderPlaceholderKeyProperty()}
        {!isPlaceholder && (
            <div className="space-y-2">
            <Label htmlFor="barcode-value">Barcode Value</Label>
            <Input
                id="barcode-value"
                value={barcodeObject.value}
                onChange={(e) => handleBarcodeUpdate({ value: e.target.value })}
            />
            </div>
        )}
      </>
    );
  };
  
  const renderImageProperties = () => {
    if (selectedObject.type !== 'image') return null;
    
    return (
        <>
            {renderPlaceholderKeyProperty()}
        </>
    )
  }


  return (
    <ScrollArea className="h-full">
      <div className="p-4 pt-12 bg-card h-full space-y-4">
        <h3 className="text-lg font-headline font-semibold capitalize">
          {selectedObject.type} Properties
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="pos-x">X</Label>
            <Input
              id="pos-x"
              type="number"
              value={Math.round(selectedObject.x)}
              onChange={(e) => handleUpdate({ x: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pos-y">Y</Label>
            <Input
              id="pos-y"
              type="number"
              value={Math.round(selectedObject.y)}
              onChange={(e) => handleUpdate({ y: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size-w">W</Label>
            <Input
              id="size-w"
              type="number"
              value={Math.round(selectedObject.width)}
              onChange={(e) =>
                handleUpdate({ width: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size-h">H</Label>
            <Input
              id="size-h"
              type="number"
              value={Math.round(selectedObject.height)}
              onChange={(e) =>
                handleUpdate({ height: parseInt(e.target.value, 10) })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rotation">Rotation</Label>
          <Input
            id="rotation"
            type="number"
            value={Math.round(selectedObject.rotation)}
            onChange={(e) =>
              handleUpdate({ rotation: parseInt(e.target.value, 10) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Opacity</Label>
          <Slider
            value={[selectedObject.opacity]}
            max={1}
            step={0.01}
            onValueChange={(value) => handleUpdate({ opacity: value[0] })}
          />
        </div>

        {renderTextProperties()}
        {renderImageProperties()}
        {renderBarcodeProperties()}
      </div>
    </ScrollArea>
  );
}
