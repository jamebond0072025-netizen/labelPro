
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CanvasObject as CanvasObjectComponent } from './canvas-object';
import { useEditorInteractions } from '@/hooks/use-editor-interactions';
import type { CanvasObject, CanvasSettings } from '@/lib/types';
import { useMediaQuery } from '@/hooks/use-media-query';

interface EditorCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  objects: CanvasObject[];
  selectedObjectIds: string[];
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (id: string, newProps: Partial<CanvasObject>) => void;
  onDuplicate: (id: string) => void;
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
  onDuplicate,
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [responsiveZoom, setResponsiveZoom] = useState(1);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const calculateZoom = () => {
      if (!containerRef.current || !isMobile) {
        setResponsiveZoom(1);
        return;
      }
      
      const padding = 32; // 16px padding on each side
      const containerWidth = containerRef.current.offsetWidth - padding;
      const containerHeight = containerRef.current.offsetHeight - padding;
      
      const widthScale = containerWidth / canvasSettings.width;
      const heightScale = containerHeight / canvasSettings.height;
      
      const newZoom = Math.min(widthScale, heightScale, 1);
      setResponsiveZoom(newZoom);
    };

    calculateZoom();
    const resizeObserver = new ResizeObserver(calculateZoom);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
       if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [canvasSettings.width, canvasSettings.height, isMobile]);

  const combinedZoom = zoom * responsiveZoom;

  const canvasStyle: React.CSSProperties = {
    width: canvasSettings.width,
    height: canvasSettings.height,
    backgroundColor: canvasSettings.backgroundColor,
    transform: `scale(${combinedZoom})`,
    transformOrigin: 'center center',
  };

  if (canvasSettings.backgroundImage) {
    canvasStyle.backgroundImage = `url(${canvasSettings.backgroundImage})`;
    canvasStyle.backgroundSize = 'cover';
    canvasStyle.backgroundPosition = 'center';
  }


  return (
    <div 
      ref={containerRef}
      className="flex-1 w-full flex items-center justify-center overflow-auto p-4 bg-muted relative"
      onPointerDown={(e) => {
        if (editingObjectId) return;
        // Check if the direct target is the container itself
        if (e.target === canvasRef.current) {
           handleInteractionStart(e, null, 'marquee', 'body')
        }
      }}
       onClick={(e) => {
        if (e.target === containerRef.current) {
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
         onClick={(e) => {
            // Prevent deselecting when clicking on the canvas itself, only container
            e.stopPropagation();
            if (e.target === e.currentTarget) {
                onDeselectAll();
            }
        }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            handleInteractionStart(e, null, 'marquee', 'body');
          }
        }}
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
            onDuplicate={onDuplicate}
            zoom={combinedZoom}
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
