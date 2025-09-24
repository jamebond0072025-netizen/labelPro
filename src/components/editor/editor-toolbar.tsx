'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Undo,
  Redo,
  Plus,
  Type,
  ImageIcon,
  Barcode,
  Trash2,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EditorToolbarProps {
  onAddItem: (type: 'text' | 'image' | 'barcode') => void;
  onClearAll: () => void;
  onLayerAction: (action: 'bring-forward' | 'send-backward') => void;
  onZoom: (zoom: number) => void;
  zoom: number;
  hasSelectedObject: boolean;
}

export function EditorToolbar({ 
    onAddItem, 
    onClearAll, 
    onLayerAction,
    onZoom,
    zoom,
    hasSelectedObject
}: EditorToolbarProps) {
  return (
    <div className="w-full bg-card border-b p-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled>
          <Undo />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Redo />
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="mr-2" /> Add Element
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onAddItem('text')}>
              <Type className="mr-2" /> Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddItem('image')}>
              <ImageIcon className="mr-2" /> Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddItem('barcode')}>
              <Barcode className="mr-2" /> Barcode
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
         <Separator orientation="vertical" className="h-8" />
        <Button variant="ghost" size="icon" onClick={() => onLayerAction('bring-forward')} disabled={!hasSelectedObject}>
          <ChevronsUp />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onLayerAction('send-backward')} disabled={!hasSelectedObject}>
          <ChevronsDown />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onZoom(zoom + 0.1)}>
          <ZoomIn />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onZoom(Math.max(0.1, zoom - 0.1))}>
          <ZoomOut />
        </Button>
        <div className="w-12 text-center text-sm">{Math.round(zoom * 100)}%</div>
        <Separator orientation="vertical" className="h-8" />
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive-outline" size="sm">
                    <Trash2 className="mr-2" /> Clear All
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete all objects from your canvas. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClearAll}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
