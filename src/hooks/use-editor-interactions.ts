
'use client';

import { useRef, useState } from 'react';
import type { CanvasObject } from '@/lib/types';

export type InteractionType = 'drag' | 'resize' | 'rotate' | 'marquee';
export type InteractionHandle = 'nw' | 'ne' | 'sw' | 'se' | 'rotate' | 'body';

type SelectionBox = {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useEditorInteractions = (
  objects: CanvasObject[],
  onUpdateObject: (id: string, newProps: Partial<CanvasObject>) => void,
  onSelectObject: (id: string | null) => void,
  zoom: number,
  canvasRef: React.RefObject<HTMLDivElement>,
  selectedObjectIds: string[],
  onSetSelectedObjectIds: (ids: string[]) => void
) => {
  const interactionRef = useRef<{
    id: string | null;
    type: InteractionType;
    handle: InteractionHandle;
    startX: number;
    startY: number;
    originalObject?: CanvasObject;
  } | null>(null);

  const initialSelectedObjects = useRef<CanvasObject[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  const handleInteractionStart = (
    e: React.PointerEvent,
    id: string | null,
    type: InteractionType,
    handle: InteractionHandle
  ) => {
    // Only allow marquee with left click on canvas background
    if (type === 'marquee' && (id !== null || e.button !== 0)) return;

    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);

    if (canvasRef.current === null) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const startX = (e.clientX - canvasRect.left) / zoom;
    const startY = (e.clientY - canvasRect.top) / zoom;

    if (type === 'marquee') {
      interactionRef.current = { id: null, type, handle, startX, startY };
      setSelectionBox({ x: startX, y: startY, width: 0, height: 0 });
      onSetSelectedObjectIds([]);
      return;
    }

    const object = objects.find((obj) => obj.id === id);
    if (!object) return;
    
    // If the clicked object is not currently selected, select only it.
    if (!selectedObjectIds.includes(id!)) {
        onSetSelectedObjectIds([id!]);
        initialSelectedObjects.current = [object];
    } else {
        // If it is part of a selection, prepare to move all selected objects.
        initialSelectedObjects.current = objects.filter(obj => selectedObjectIds.includes(obj.id));
    }
    
    interactionRef.current = {
      id,
      type,
      handle,
      startX,
      startY,
      originalObject: { ...object },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactionRef.current || !canvasRef.current) return;

    const { type, handle, startX, startY, originalObject } = interactionRef.current;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - canvasRect.left) / zoom;
    const mouseY = (e.clientY - canvasRect.top) / zoom;
    const deltaX = mouseX - startX;
    const deltaY = mouseY - startY;

    switch (type) {
      case 'drag': {
        if (!originalObject) break;
        // Drag all selected objects
        initialSelectedObjects.current.forEach(selectedObj => {
            const initialObjState = initialSelectedObjects.current.find(o => o.id === selectedObj.id);
            if (initialObjState) {
                onUpdateObject(selectedObj.id, {
                    x: initialObjState.x + deltaX,
                    y: initialObjState.y + deltaY,
                });
            }
        });
        break;
      }
      case 'resize':
        if (!originalObject) break;
        let newWidth = originalObject.width;
        let newHeight = originalObject.height;
        let newX = originalObject.x;
        let newY = originalObject.y;

        if (handle.includes('e')) newWidth = originalObject.width + deltaX;
        if (handle.includes('s')) newHeight = originalObject.height + deltaY;
        if (handle.includes('w')) {
          newWidth = originalObject.width - deltaX;
          newX = originalObject.x + deltaX;
        }
        if (handle.includes('n')) {
          newHeight = originalObject.height - deltaY;
          newY = originalObject.y + deltaY;
        }
        
        onUpdateObject(originalObject.id, { 
            width: Math.max(20, newWidth), 
            height: Math.max(20, newHeight),
            x: newX,
            y: newY,
        });
        break;
      case 'rotate':
        if (!originalObject) break;
        const centerX = originalObject.x + originalObject.width / 2;
        const centerY = originalObject.y + originalObject.height / 2;
        const startAngle = Math.atan2(startY - centerY, startX - centerX);
        const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
        const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
        onUpdateObject(originalObject.id, {
          rotation: originalObject.rotation + angleDiff,
        });
        break;
      case 'marquee':
        const x = Math.min(startX, mouseX);
        const y = Math.min(startY, mouseY);
        const width = Math.abs(deltaX);
        const height = Math.abs(deltaY);
        setSelectionBox({ x, y, width, height });
        break;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactionRef.current) return;
    
    if (interactionRef.current.type === 'marquee' && selectionBox) {
        const selectedIds = objects.filter(obj => {
            const objRect = {
                left: obj.x,
                top: obj.y,
                right: obj.x + obj.width,
                bottom: obj.y + obj.height
            };
            const marqueeRect = {
                left: selectionBox.x,
                top: selectionBox.y,
                right: selectionBox.x + selectionBox.width,
                bottom: selectionBox.y + selectionBox.height
            };

            return !(
                objRect.right < marqueeRect.left ||
                objRect.left > marqueeRect.right ||
                objRect.bottom < marqueeRect.top ||
                objRect.top > marqueeRect.bottom
            );
        }).map(obj => obj.id);

        onSetSelectedObjectIds(selectedIds);
    }
    
    const target = e.target as HTMLElement;
    if(target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
    }
    interactionRef.current = null;
    setSelectionBox(null);
    initialSelectedObjects.current = [];
  };

  return { handleInteractionStart, handlePointerMove, handlePointerUp, selectionBox };
};
