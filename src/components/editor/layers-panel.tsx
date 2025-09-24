'use client';

import { CanvasObject } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Layers, Type, Image as ImageIcon, Barcode, Eye, EyeOff } from 'lucide-react';

interface LayersPanelProps {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
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

export function LayersPanel({ objects, selectedObjectId, onSelectObject }: LayersPanelProps) {
  const reversedObjects = [...objects].reverse();

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h3 className="text-lg font-headline font-semibold mb-4">Layers</h3>
      <div className="space-y-1">
        {reversedObjects.map((obj) => (
          <button
            key={obj.id}
            onClick={() => onSelectObject(obj.id)}
            className={cn(
              'w-full text-left px-2 py-1.5 text-sm rounded-md flex items-center justify-between gap-2',
              'hover:bg-muted',
              selectedObjectId === obj.id ? 'bg-muted' : 'bg-transparent'
            )}
          >
            <div className="flex items-center gap-2 truncate">
                {getObjectIcon(obj)}
                <span className="truncate">{getObjectDisplayName(obj)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
