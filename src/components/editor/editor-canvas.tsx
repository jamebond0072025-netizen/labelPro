'use client';

import React from 'react';
import { CanvasObject as CanvasObjectComponent } from './canvas-object';
import { useEditorInteractions } from '@/hooks/use-editor-interactions';
import type { CanvasObject } from '@/lib/types';

interface EditorCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  objects: CanvasObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (id: string, newProps: Partial<CanvasObject>) => void;
  zoom: number;
}

export function EditorCanvas({
  canvasRef,
  objects,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  zoom,
}: EditorCanvasProps) {
  const { handleInteractionStart, handlePointerMove, handlePointerUp } =
    useEditorInteractions(
      objects,
      onUpdateObject,
      onSelectObject,
      zoom,
      canvasRef
    );

  return (
    <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4 bg-muted relative">
      <div
        ref={canvasRef}
        className="relative w-full h-full max-w-[500px] max-h-[700px] bg-white shadow-lg overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
      >
        {objects.map((obj) => (
          <CanvasObjectComponent
            key={obj.id}
            object={obj}
            isSelected={selectedObjectId === obj.id}
            onSelect={onSelectObject}
            onInteractionStart={handleInteractionStart}
          />
        ))}
      </div>
    </div>
  );
}
