
'use client';

import React from 'react';
import { CanvasObject as CanvasObjectComponent } from './canvas-object';
import { useEditorInteractions } from '@/hooks/use-editor-interactions';
import type { CanvasObject, CanvasSettings } from '@/lib/types';

interface EditorCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  objects: CanvasObject[];
  selectedObjectIds: string[];
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (id: string, newProps: Partial<CanvasObject>) => void;
  zoom: number;
  canvasSettings: CanvasSettings;
  onDeselectAll: () => void;
  onSetSelectedObjectIds: (ids: string[]) => void;
  editingObjectId: string | null;
  onObjectDoubleClick: (id: string) => void;
  onStopEditing: () => void;
}

export function EditorCanvas({
  canvasRef,
  objects,
  selectedObjectIds,
  onSelectObject,
  onUpdateObject,
  zoom,
  canvasSettings,
  onDeselectAll,
  onSetSelectedObjectIds,
  editingObjectId,
  onObjectDoubleClick,
  onStopEditing,
}: EditorCanvasProps) {
  const { 
    handleInteractionStart, 
    handlePointerMove, 
    handlePointerUp,
    selectionBox 
  } =
    useEditorInteractions(
      objects,
      onUpdateObject,
      onSelectObject,
      zoom,
      canvasRef,
      selectedObjectIds,
      onSetSelectedObjectIds
    );

  const canvasStyle: React.CSSProperties = {
    width: canvasSettings.width,
    height: canvasSettings.height,
    backgroundColor: canvasSettings.backgroundColor,
    transform: `scale(${zoom})`,
    transformOrigin: 'center center',
  };

  if (canvasSettings.backgroundImage) {
    canvasStyle.backgroundImage = `url(${canvasSettings.backgroundImage})`;
    canvasStyle.backgroundSize = 'cover';
    canvasStyle.backgroundPosition = 'center';
  }


  return (
    <div 
      className="flex-1 w-full flex items-center justify-center overflow-auto p-4 bg-muted relative"
      onPointerDown={(e) => {
        if (editingObjectId) return;
        handleInteractionStart(e, null, 'marquee', 'body')
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onDeselectAll();
        }
      }}
    >
      <div
        ref={canvasRef}
        className="relative shadow-lg overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={canvasStyle}
      >
        {objects.map((obj) => (
          <CanvasObjectComponent
            key={obj.id}
            object={obj}
            isSelected={selectedObjectIds.includes(obj.id)}
            isEditing={obj.id === editingObjectId}
            onSelect={onSelectObject}
            onInteractionStart={handleInteractionStart}
            onDoubleClick={onObjectDoubleClick}
            onUpdate={onUpdateObject}
            onStopEditing={onStopEditing}
            zoom={zoom}
          />
        ))}
        {selectionBox && (
          <div
            className="absolute border border-dashed border-primary bg-primary/20 pointer-events-none"
            style={{
              left: selectionBox.x,
              top: selectionBox.y,
              width: selectionBox.width,
              height: selectionBox.height,
            }}
          />
        )}
      </div>
    </div>
  );
}
