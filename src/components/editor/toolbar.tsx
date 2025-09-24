'use client';

import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Type, Barcode as BarcodeIcon } from 'lucide-react';

interface ToolbarProps {
  onAddItem: (type: 'text' | 'image' | 'barcode') => void;
}

export function Toolbar({ onAddItem }: ToolbarProps) {
  return (
    <div className="p-4 border-b">
      <h3 className="text-lg font-headline font-semibold mb-4">Tools</h3>
      <div className="grid gap-2">
        <Button variant="outline" className="justify-start" onClick={() => onAddItem('text')}>
          <Type className="mr-2 h-4 w-4" />
          Text
        </Button>
        <Button variant="outline" className="justify-start" onClick={() => onAddItem('image')}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Image
        </Button>
        <Button variant="outline" className="justify-start" onClick={() => onAddItem('barcode')}>
          <BarcodeIcon className="mr-2 h-4 w-4" />
          Barcode
        </Button>
      </div>
    </div>
  );
}
