'use client';

import { useState, useRef, useEffect } from 'react';
import type { CanvasObject, TextObject, ImageObject, BarcodeObject } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const initialObjects: CanvasObject[] = [
  {
    id: 'text1',
    type: 'text',
    x: 50,
    y: 50,
    width: 250,
    height: 50,
    rotation: 0,
    opacity: 1,
    text: 'Your Company',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Poppins, sans-serif',
    color: '#000000',
    textAlign: 'center',
  },
  {
    id: 'image1',
    type: 'image',
    x: 125,
    y: 120,
    width: 150,
    height: 150,
    rotation: 0,
    opacity: 1,
    src: PlaceHolderImages.find(img => img.id === 'product1')?.imageUrl || '',
  },
];

export type Alignment = 
  | 'left' | 'center' | 'right' 
  | 'top' | 'middle' | 'bottom'
  | 'distribute-horizontally' | 'distribute-vertically';


export const useCanvasObjects = (templateId: string | null) => {
  const [objects, setObjects] = useState<CanvasObject[]>(initialObjects);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

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
        setObjects([newObject, ...initialObjects]);
        setSelectedObjectIds([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);


  const handleAddItem = (type: 'text' | 'image' | 'barcode') => {
    const newId = `${type}${Date.now()}`;
    let newObject: CanvasObject;
    const canvasCenterX = (canvasRef.current?.offsetWidth || 0) / 2;
    const canvasCenterY = (canvasRef.current?.offsetHeight || 0) / 2;

    switch (type) {
      case 'text':
        newObject = {
          id: newId, type: 'text', x: canvasCenterX - 75, y: canvasCenterY - 20, width: 150, height: 40, rotation: 0, opacity: 1,
          text: 'New Text', fontSize: 24, fontWeight: 'normal', fontFamily: 'PT Sans, sans-serif', color: '#000000', textAlign: 'center',
        } as TextObject;
        break;
      case 'image':
        newObject = {
          id: newId, type: 'image', x: canvasCenterX - 50, y: canvasCenterY - 50, width: 100, height: 100, rotation: 0, opacity: 1,
          src: PlaceHolderImages.find(img => img.id === 'product2')?.imageUrl || '',
        } as ImageObject;
        break;
      case 'barcode':
        newObject = {
          id: newId, type: 'barcode', x: canvasCenterX - 75, y: canvasCenterY - 30, width: 150, height: 60, rotation: 0, opacity: 1,
          value: '123456789',
        } as BarcodeObject;
        break;
    }

    setObjects((prev) => [...prev, newObject]);
    setSelectedObjectIds([newId]);
  };

  const handleClearAll = () => {
    setObjects([]);
    setSelectedObjectIds([]);
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
      prev.map((obj) => (obj.id === id ? { ...obj, ...newProps } : obj))
    );
  };
  
  const handleAlign = (alignment: Alignment) => {
    const selectedObjects = objects.filter(obj => selectedObjectIds.includes(obj.id));
    if (selectedObjects.length < 2) return;

    const newObjects = [...objects];

    // Bounding box of all selected objects
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedObjects.forEach(obj => {
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + obj.width);
      maxY = Math.max(maxY, obj.y + obj.height);
    });

    const bboxWidth = maxX - minX;
    const bboxHeight = maxY - minY;

    selectedObjects.forEach(obj => {
        const index = newObjects.findIndex(o => o.id === obj.id);
        if (index === -1) return;
        let newX = newObjects[index].x;
        let newY = newObjects[index].y;

        switch (alignment) {
            case 'left': newX = minX; break;
            case 'center': newX = minX + (bboxWidth - obj.width) / 2; break;
            case 'right': newX = maxX - obj.width; break;
            case 'top': newY = minY; break;
            case 'middle': newY = minY + (bboxHeight - obj.height) / 2; break;
            case 'bottom': newY = maxY - obj.height; break;
        }

        newObjects[index] = { ...newObjects[index], x: newX, y: newY };
    });

    if (alignment === 'distribute-horizontally' || alignment === 'distribute-vertically') {
      const sorted = [...selectedObjects].sort((a, b) => alignment === 'distribute-horizontally' ? a.x - b.x : a.y - b.y);
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
    canvasRef,
  };
};
