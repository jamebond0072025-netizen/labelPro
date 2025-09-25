
'use client';

import { useState, useRef, useEffect } from 'react';
import type { CanvasObject, TextObject, ImageObject, BarcodeObject, CanvasSettings, ItemType } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const initialObjects: CanvasObject[] = [];

export type Alignment = 
  | 'left' | 'center' | 'right' 
  | 'top' | 'middle' | 'bottom'
  | 'distribute-horizontally' | 'distribute-vertically';


export const useCanvasObjects = (templateId: string | null, canvasSettings: CanvasSettings) => {
  const [objects, setObjects] = useState<CanvasObject[]>(initialObjects);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const objectCounters = useRef({ text: 0, image: 0, barcode: 0 });

  useEffect(() => {
    if (templateId) {
      const templateImage = PlaceHolderImages.find(img => img.id === templateId);
      if (templateImage && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const newObject: ImageObject = {
          id: `template_bg_${Date.now()}`,
          type: 'image',
          x: 0, y: 0,
          width: canvasRect.width,
          height: canvasRect.height,
          rotation: 0,
          opacity: 1,
          src: templateImage.imageUrl,
        };
        setObjects([newObject]);
        setSelectedObjectIds([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);


  const handleAddItem = (type: ItemType) => {
    const newId = `${type}${Date.now()}`;
    let newObject: CanvasObject;
    const canvasCenterX = (canvasRef.current?.offsetWidth || 0) / 2;
    const canvasCenterY = (canvasRef.current?.offsetHeight || 0) / 2;

    switch (type) {
      case 'placeholder-text':
        objectCounters.current.text++;
        const textKey = `text_${objectCounters.current.text}`;
        newObject = {
          id: newId, type: 'text', x: canvasCenterX - 75, y: canvasCenterY - 20, width: 150, height: 40, rotation: 0, opacity: 1,
          text: `{{${textKey}}}`, fontSize: 24, fontWeight: 'normal', fontFamily: 'PT Sans, sans-serif', color: '#000000', textAlign: 'center',
          key: textKey,
        } as TextObject;
        break;
      case 'static-text':
        newObject = {
          id: newId, type: 'text', x: canvasCenterX - 75, y: canvasCenterY - 20, width: 150, height: 40, rotation: 0, opacity: 1,
          text: 'Static Text', fontSize: 24, fontWeight: 'normal', fontFamily: 'PT Sans, sans-serif', color: '#000000', textAlign: 'center',
        } as TextObject;
        break;
      case 'placeholder-image':
        objectCounters.current.image++;
        const imageKey = `image_${objectCounters.current.image}`;
        newObject = {
          id: newId, type: 'image', x: canvasCenterX - 50, y: canvasCenterY - 50, width: 100, height: 100, rotation: 0, opacity: 1,
          src: `https://placehold.co/200x200.png?text={{${imageKey}}}`,
          key: imageKey,
        } as ImageObject;
        break;
      case 'static-image':
        newObject = {
          id: newId, type: 'image', x: canvasCenterX - 50, y: canvasCenterY - 50, width: 100, height: 100, rotation: 0, opacity: 1,
          src: 'https://placehold.co/200x200.png?text=Static+Image',
        } as ImageObject;
        break;
      case 'barcode':
        objectCounters.current.barcode++;
        const barcodeKey = `barcode_${objectCounters.current.barcode}`;
        newObject = {
          id: newId, type: 'barcode', x: canvasCenterX - 75, y: canvasCenterY - 30, width: 150, height: 60, rotation: 0, opacity: 1,
          value: '123456789',
          key: barcodeKey,
        } as BarcodeObject;
        break;
    }

    setObjects((prev) => [...prev, newObject]);
    setSelectedObjectIds([newId]);
  };

  const handleClearAll = () => {
    setObjects([]);
    setSelectedObjectIds([]);
    objectCounters.current = { text: 0, image: 0, barcode: 0 };
  };

  const handleLayerAction = (action: 'bring-forward' | 'send-backward' | 'delete') => {
    if (selectedObjectIds.length === 0) return;
    const selectedObjectId = selectedObjectIds[selectedObjectIds.length - 1];


    if (action === 'delete') {
      setObjects(objects.filter(o => !selectedObjectIds.includes(o.id)));
      setSelectedObjectIds([]);
      return;
    }

    const currentIndex = objects.findIndex(obj => obj.id === selectedObjectId);
    if (currentIndex === -1) return;

    const newObjects = [...objects];
    const objectToMove = newObjects.splice(currentIndex, 1)[0];

    if (action === 'bring-forward') {
      const newIndex = Math.min(objects.length -1, currentIndex + 1);
      newObjects.splice(newIndex, 0, objectToMove);
    } else if (action === 'send-backward') {
      const newIndex = Math.max(0, currentIndex - 1);
      newObjects.splice(newIndex, 0, objectToMove);
    }
    setObjects(newObjects);
  };

  const handleUpdateObject = (id: string, newProps: Partial<CanvasObject>) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id === id) {
          const updatedObj = { ...obj, ...newProps };

          // If the key is updated, also update the placeholder content
          if ('key' in newProps && newProps.key !== undefined) {
            const newKey = newProps.key;
            if (updatedObj.type === 'text' && updatedObj.key) {
               (updatedObj as TextObject).text = `{{${newKey}}}`;
            } else if (updatedObj.type === 'image' && updatedObj.key) {
               (updatedObj as ImageObject).src = `https://placehold.co/200x200.png?text={{${newKey}}}`;
            }
          }
          return updatedObj;
        }
        return obj;
      })
    );
  };

  const handleReplaceData = (data: Record<string, any>) => {
    setObjects(prev => prev.map(obj => {
        if ('key' in obj && obj.key && data[obj.key]) {
            const newValue = data[obj.key];
            if (obj.type === 'text') {
                return { ...obj, text: newValue };
            }
            if (obj.type === 'image') {
                return { ...obj, src: newValue };
            }
            if (obj.type === 'barcode') {
                return { ...obj, value: newValue };
            }
        }
        return obj;
    }));
  };
  
  const handleAlign = (alignment: Alignment) => {
    if (selectedObjectIds.length === 0) return;

    const selectedObjects = objects.filter(obj => selectedObjectIds.includes(obj.id));
  
    let newObjects = [...objects];
    const canvasWidth = canvasSettings.width;
    const canvasHeight = canvasSettings.height;

    // Handle single object alignment relative to canvas
    if (selectedObjects.length === 1) {
      const obj = selectedObjects[0];
      const index = newObjects.findIndex(o => o.id === obj.id);
      if (index === -1) return;

      let newX = newObjects[index].x;
      let newY = newObjects[index].y;

      switch (alignment) {
        case 'left': newX = 0; break;
        case 'center': newX = (canvasWidth - obj.width) / 2; break;
        case 'right': newX = canvasWidth - obj.width; break;
        case 'top': newY = 0; break;
        case 'middle': newY = (canvasHeight - obj.height) / 2; break;
        case 'bottom': newY = canvasHeight - obj.height; break;
      }
      newObjects[index] = { ...newObjects[index], x: newX, y: newY };
      setObjects(newObjects);
      return;
    }
  
    // Bounding box for multi-object distribution
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedObjects.forEach(obj => {
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + obj.width);
      maxY = Math.max(maxY, obj.y + obj.height);
    });

    // Multi-object alignment (to each other, based on first selected)
    const primaryObject = selectedObjects[0];
    switch(alignment) {
      case 'left':
        newObjects = newObjects.map(o => selectedObjectIds.includes(o.id) ? {...o, x: primaryObject.x} : o);
        break;
      // ... other multi-align cases would go here if needed ...
    }
  
    if ((alignment === 'distribute-horizontally' || alignment === 'distribute-vertically') && selectedObjects.length > 1) {
      const sorted = [...selectedObjects].sort((a, b) => alignment === 'distribute-horizontally' ? a.x - b.x : a.y - b.y);
      const bboxWidth = maxX - minX;
      const bboxHeight = maxY - minY;

      const totalSize = sorted.reduce((sum, obj) => sum + (alignment === 'distribute-horizontally' ? obj.width : obj.height), 0);
      const totalGap = (alignment === 'distribute-horizontally' ? bboxWidth : bboxHeight) - totalSize;
      const gap = totalGap / (sorted.length - 1);
      
      let currentPos = alignment === 'distribute-horizontally' ? minX : minY;
  
      sorted.forEach((obj, i) => {
        const index = newObjects.findIndex(o => o.id === obj.id);
        if (alignment === 'distribute-horizontally') {
          newObjects[index].x = currentPos;
          currentPos += obj.width + gap;
        } else {
          newObjects[index].y = currentPos;
          currentPos += obj.height + gap;
        }
      });
    }
  
    setObjects(newObjects);
  };

  return {
    objects,
    setObjects,
    selectedObjectIds,
    setSelectedObjectIds,
    handleAddItem,
    handleClearAll,
    handleLayerAction,
    handleUpdateObject,
    handleAlign,
    handleReplaceData,
    canvasRef,
  };
};

    