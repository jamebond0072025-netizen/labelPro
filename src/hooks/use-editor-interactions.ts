'use client';

import { useRef } from 'react';
import type { CanvasObject } from '@/lib/types';

export type InteractionType = 'drag' | 'resize' | 'rotate';
export type InteractionHandle = 'nw' | 'ne' | 'sw' | 'se' | 'rotate' | 'body';

export const useEditorInteractions = (
  objects: CanvasObject[],
  onUpdateObject: (id: string, newProps: Partial<CanvasObject>) => void,
  setSelectedObjectId: (id: string | null) => void,
  zoom: number,
  canvasRef: React.RefObject<HTMLDivElement>
) => {
  const interactionRef = useRef<{
    id: string;
    type: InteractionType;
    handle: InteractionHandle;
    startX: number;
    startY: number;
    originalObject: CanvasObject;
  } | null>(null);

  const handleInteractionStart = (
    e: React.PointerEvent,
    id: string,
    type: InteractionType,
    handle: InteractionHandle
  ) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const object = objects.find((obj) => obj.id === id);
    if (!object || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();

    interactionRef.current = {
      id,
      type,
      handle,
      startX: (e.clientX - canvasRect.left) / zoom,
      startY: (e.clientY - canvasRect.top) / zoom,
      originalObject: { ...object },
    };
    setSelectedObjectId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactionRef.current || !canvasRef.current) return;
    e.preventDefault();

    const { id, type, handle, startX, startY, originalObject } = interactionRef.current;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - canvasRect.left) / zoom;
    const mouseY = (e.clientY - canvasRect.top) / zoom;
    const deltaX = mouseX - startX;
    const deltaY = mouseY - startY;

    switch (type) {
      case 'drag':
        onUpdateObject(id, {
          x: originalObject.x + deltaX,
          y: originalObject.y + deltaY,
        });
        break;
      case 'resize':
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
        
        onUpdateObject(id, { 
            width: Math.max(20, newWidth), 
            height: Math.max(20, newHeight),
            x: newX,
            y: newY,
        });
        break;
      case 'rotate':
        const centerX = originalObject.x + originalObject.width / 2;
        const centerY = originalObject.y + originalObject.height / 2;
        const startAngle = Math.atan2(startY - centerY, startX - centerX);
        const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
        const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
        onUpdateObject(id, {
          rotation: originalObject.rotation + angleDiff,
        });
        break;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactionRef.current) return;
    e.preventDefault();
    const target = e.target as HTMLElement;
    if(target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
    }
    interactionRef.current = null;
  };

  return { handleInteractionStart, handlePointerMove, handlePointerUp };
};
