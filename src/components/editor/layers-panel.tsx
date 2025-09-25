'use client';

import { CanvasObject } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Layers, Type, Image as ImageIcon, Barcode, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface LayersPanelProps {
  objects: CanvasObject[];
  selectedObjectIds: string[];
  onSelectObject: (id: string) => void;
  onLayerAction: (action: 'delete') => void;
}

const getObjectDisplayName = (object: CanvasObject) => {
    switch(object.type) {
        case 'text':
            return object.text.length > 15 ? object.text.substring(0, 15) + '...' : object.text;
        case 'image':
            return 'Image';
        case 'barcode':
            return 'Barcode';
        default:
            return 'Object';
    }
}

const getObjectIcon = (object: CanvasObject) => {
    switch(object.type) {
        case 'text':
            return <Type className="h-4 w-4" />;
        case 'image':
            return <ImageIcon className="h-4 w-4" />;
        case 'barcode':
            return <Barcode className="h-4 w-4" />;
        default:
            return <Layers className="h-4 w-4" />;
    }
}

export function LayersPanel({ objects, selectedObjectIds, onSelectObject, onLayerAction }: LayersPanelProps) {
  const reversedObjects = [...objects].reverse();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pt-12">
        <h3 className="text-lg font-headline font-semibold mb-4">Layers</h3>
        <div className="space-y-1">
          {reversedObjects.map((obj) => (
            <button
              key={obj.id}
              onClick={() => onSelectObject(obj.id)}
              className={cn(
                'w-full text-left px-2 py-1.5 text-sm rounded-md flex items-center justify-between gap-2 group',
                'hover:bg-muted',
                selectedObjectIds.includes(obj.id) ? 'bg-muted' : 'bg-transparent'
              )}
            >
              <div className="flex items-center gap-2 truncate">
                  {getObjectIcon(obj)}
                  <span className="truncate">{getObjectDisplayName(obj)}</span>
              </div>
              {selectedObjectIds.includes(obj.id) && (
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); onLayerAction('delete')}}
                      title="Delete Layer"
                  >
                      <Trash2 className="h-4 w-4" />
                  </Button>
              )}
            </button>
          ))}
          {reversedObjects.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No layers yet.</p>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
