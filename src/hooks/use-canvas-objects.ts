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

export const useCanvasObjects = (templateId: string | null) => {
  const [objects, setObjects] = useState<CanvasObject[]>(initialObjects);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
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
        setSelectedObjectId(null);
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
          text: 'New Text', fontSize: 24, fontWeight: 'normal', fontFamily: 'PT Sans, sans-serif', color: '#000000',
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
    setSelectedObjectId(newId);
  };

  const handleClearAll = () => {
    setObjects([]);
    setSelectedObjectId(null);
  };

  const handleLayerAction = (action: 'bring-forward' | 'send-backward' | 'delete') => {
    if (!selectedObjectId) return;

    if (action === 'delete') {
      setObjects(objects.filter(o => o.id !== selectedObjectId));
      setSelectedObjectId(null);
      return;
    }

    const currentIndex = objects.findIndex(obj => obj.id === selectedObjectId);
    if (currentIndex === -1) return;

    const newObjects = [...objects];
    const objectToMove = newObjects.splice(currentIndex, 1)[0];

    if (action === 'bring-forward') {
      const newIndex = Math.min(objects.length - 1, currentIndex + 1);
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
  
  return {
    objects,
    setObjects,
    selectedObjectId,
    setSelectedObjectId,
    handleAddItem,
    handleClearAll,
    handleLayerAction,
    handleUpdateObject,
    canvasRef,
  };
};
