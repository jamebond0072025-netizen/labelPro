

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CanvasObject, TextObject, ImageObject, BarcodeObject, QRCodeObject, CanvasSettings, ItemType, Template } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { USE_DUMMY_TEMPLATES, USE_AUTH } from '@/lib/config';
import { getMockTemplates } from '@/lib/mock-api';
import { apiCall, getSignedUrl } from '@/lib/api';
import { useAuth } from './use-auth';
import { useHistory } from './use-history';

export type Alignment = 
  | 'left' | 'center' | 'right' 
  | 'top' | 'middle' | 'bottom'
  | 'distribute-horizontally' | 'distribute-vertically';


export const useCanvasObjects = (templateId: string | null, canvasSettings: CanvasSettings, onUpdateCanvasSettings: (settings: Partial<CanvasSettings>) => void) => {
  const [history, { set: setHistory, undo, redo, canUndo, canRedo, clear: clearHistory }] = useHistory<CanvasObject[]>([]);
  const objects = history;
  
  // displayObjects maintains creation order for the layers panel
  const [displayObjects, setDisplayObjects] = useState<CanvasObject[]>([]);

  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [loadedTemplate, setLoadedTemplate] = useState<Template | undefined>(undefined);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const objectCounters = useRef({ text: 0, image: 0, barcode: 0, qrcode: 0 });

  const { token, tenantId } = useAuth();


  const loadTemplate = useCallback(async (template: Template) => {
    try {
      let designJson = template.designJson;

      // Handle doubly-stringified JSON and invalid JSON
      if (typeof designJson === 'string') {
        if (designJson.trim().startsWith('{')) {
          try {
            designJson = JSON.parse(designJson);
          } catch (e) {
            console.error("Primary parse failed, attempting secondary parse for doubly-escaped JSON", e);
          }
        } else {
            console.warn("designJson is not a valid JSON object string. Treating as empty.", designJson);
            designJson = { settings: {}, objects: [] };
        }
      }

      if (typeof designJson === 'string') {
         if (designJson.trim().startsWith('{')) {
            try {
                designJson = JSON.parse(designJson);
            } catch (e) {
                 console.error("Error parsing designJson on second attempt", e);
                 designJson = { settings: {}, objects: [] };
            }
         } else {
            console.warn("designJson is not a valid JSON object string after first parse. Treating as empty.", designJson);
            designJson = { settings: {}, objects: [] };
         }
      }

      const finalDesign = designJson as { settings: CanvasSettings; objects: CanvasObject[] };

      // Get signed URL for background image
      if (finalDesign.settings.backgroundImage) {
        const signedBgUrl = await getSignedUrl(finalDesign.settings.backgroundImage, { token, tenantId });
        if (signedBgUrl) {
            finalDesign.settings.backgroundImage = signedBgUrl;
        }
      }
      onUpdateCanvasSettings(finalDesign.settings);
      
      const newObjects = await Promise.all((finalDesign.objects || []).map(async (obj) => {
          if (obj.type === 'image' && obj.src) {
              const signedSrc = await getSignedUrl(obj.src, { token, tenantId });
              if (signedSrc) {
                  return { ...obj, src: signedSrc };
              }
          }
          return obj;
      }));

      setHistory(newObjects);
      setDisplayObjects(newObjects);

      setLoadedTemplate(template);
      setSelectedObjectIds([]);
      
      const counters = { text: 0, image: 0, barcode: 0, qrcode: 0 };
      (finalDesign.objects || []).forEach((obj: CanvasObject) => {
        if ('key' in obj && obj.key) {
            const match = obj.key.match(/^(text|image|barcode|qrcode|qr)_(\d+)$/);
            if (match) {
                const type = match[1] === 'qr' ? 'qrcode' : (match[1] as 'text' | 'image' | 'barcode' | 'qrcode');
                const num = parseInt(match[2], 10);
                if (counters[type] < num) {
                    counters[type] = num;
                }
            }
        }
      });
      objectCounters.current = counters;

    } catch (error) {
      console.error("Error loading template:", error);
    }
  }, [onUpdateCanvasSettings, setHistory, token, tenantId]);

  const handleLoadTemplateFromJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string;
        const templateData = JSON.parse(jsonString) as { settings: CanvasSettings; objects: CanvasObject[] };

        if (templateData.settings && templateData.objects) {
          
           if (templateData.settings.backgroundImage) {
              const signedBgUrl = await getSignedUrl(templateData.settings.backgroundImage, { token, tenantId });
              if (signedBgUrl) {
                  templateData.settings.backgroundImage = signedBgUrl;
              }
           }
          
          const newObjects = await Promise.all(templateData.objects.map(async (obj) => {
              if (obj.type === 'image' && obj.src) {
                  const signedSrc = await getSignedUrl(obj.src, { token, tenantId });
                  if (signedSrc) {
                      return { ...obj, src: signedSrc };
                  }
              }
              return obj;
          }));

          onUpdateCanvasSettings(templateData.settings);
          setHistory(newObjects);
          setDisplayObjects(newObjects);
          setSelectedObjectIds([]);
          setLoadedTemplate(undefined); // It's a new design, not an existing template
        } else {
          throw new Error("Invalid JSON format: 'settings' or 'objects' missing.");
        }
      } catch (error) {
        console.error("Failed to load or parse template file:", error);
      }
    };
    reader.readAsText(file);
  };


  useEffect(() => {
    if (templateId) {
      setIsLoadingTemplate(true);
      const fetchAndLoadTemplate = async () => {
        try {
          let template: Template | undefined;

          if (USE_DUMMY_TEMPLATES) {
            const templates = await getMockTemplates();
            template = templates.find(t => t.id === parseInt(templateId, 10));
          } else {
             if (token && tenantId) {
                const response = await apiCall({ url: `/LabelTemplate/${templateId}`, method: 'GET' }, { token, tenantId });
                template = response.data;
             }
          }

          if (template) {
            await loadTemplate(template);
          }
        } catch (error) {
          console.error("Failed to fetch template for editing:", error);
        } finally {
            setIsLoadingTemplate(false);
        }
      };

       if (USE_DUMMY_TEMPLATES || (token && tenantId)) {
            fetchAndLoadTemplate();
        }
    } else {
        setIsLoadingTemplate(false);
        clearHistory();
    }
  }, [templateId, token, tenantId, clearHistory]);


  const handleAddItem = (type: ItemType) => {
    const newId = `${type}-${Date.now()}`;
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
       case 'placeholder-qr':
        objectCounters.current.qrcode++;
        const qrKey = `qr_${objectCounters.current.qrcode}`;
        newObject = {
          id: newId, type: 'qrcode', x: canvasCenterX - 50, y: canvasCenterY - 50, width: 100, height: 100, rotation: 0, opacity: 1,
          value: `{{${qrKey}}}`,
          qrCodeType: 'text',
          key: qrKey,
        } as QRCodeObject;
        break;
      case 'static-qr':
        newObject = {
          id: newId, type: 'qrcode', x: canvasCenterX - 50, y: canvasCenterY - 50, width: 100, height: 100, rotation: 0, opacity: 1,
          qrCodeType: 'text',
          value: 'https://example.com',
        } as QRCodeObject;
        break;
    }

    const newObjects = [...objects, newObject];
    setHistory(newObjects);
    setDisplayObjects(newObjects);

    setSelectedObjectIds([newId]);
  };

  const handleClearAll = () => {
    setHistory([]);
    setDisplayObjects([]);
    setSelectedObjectIds([]);
    setLoadedTemplate(undefined);
    objectCounters.current = { text: 0, image: 0, barcode: 0, qrcode: 0 };
  };

  const handleLayerAction = (id: string, action: 'bring-forward' | 'send-backward' | 'delete') => {
    let newObjects = [...objects];

    if (action === 'delete') {
        setSelectedObjectIds(prev => prev.filter(selectedId => selectedId !== id));
        newObjects = newObjects.filter(o => o.id !== id);
        setDisplayObjects(prev => prev.filter(o => o.id !== id));
    } else {
        const currentIndex = newObjects.findIndex(obj => obj.id === id);
        if (currentIndex === -1) return;

        const [objectToMove] = newObjects.splice(currentIndex, 1);

        if (action === 'bring-forward') {
            const newIndex = Math.min(newObjects.length, currentIndex + 1);
            newObjects.splice(newIndex, 0, objectToMove);
        } else if (action === 'send-backward') {
            const newIndex = Math.max(0, currentIndex - 1);
            newObjects.splice(newIndex, 0, objectToMove);
        }
    }
    setHistory(newObjects);
  };

  const handleUpdateObject = (id: string, newProps: Partial<CanvasObject>) => {
    const newObjects = objects.map((obj) => {
      if (obj.id === id) {
        const updatedObj = { ...obj, ...newProps };

        if ('key' in newProps && newProps.key !== undefined && obj.key !== undefined) {
          const newKey = newProps.key;
          if (updatedObj.type === 'text' && updatedObj.key) {
             (updatedObj as TextObject).text = `{{${newKey}}}`;
          } else if (updatedObj.type === 'image' && updatedObj.key) {
             (updatedObj as ImageObject).src = `https://placehold.co/200x200.png?text={{${newKey}}}`;
          }
           else if (updatedObj.type === 'qrcode' && updatedObj.key) {
             (updatedObj as QRCodeObject).value = `{{${newKey}}}`;
          }
        }
        return updatedObj;
      }
      return obj;
    });
    setHistory(newObjects);
  };

  const handleReplaceData = (data: Record<string, any>) => {
    const newObjects = objects.map(obj => {
        if ('key' in obj && obj.key && data[obj.key]) {
            const newValue = data[obj.key];
            if (obj.type === 'text') {
                return { ...obj, text: newValue };
            }
            if (obj.type === 'image') {
                return { ...obj, src: newValue };
            }
            if (obj.type === 'barcode' || obj.type === 'qrcode') {
                return { ...obj, value: newValue };
            }
        }
        return obj;
    });
    setHistory(newObjects);
  };

   const handleDuplicate = () => {
    if (selectedObjectIds.length === 0) return;

    let newObjects = [...objects];
    const newSelectedIds: string[] = [];

    selectedObjectIds.forEach(id => {
      const originalObject = objects.find(obj => obj.id === id);
      if (!originalObject) return;

      const newId = `${originalObject.type}-${Date.now()}-${Math.random()}`;
      const duplicatedObject: CanvasObject = {
        ...JSON.parse(JSON.stringify(originalObject)), // Deep copy
        id: newId,
        x: originalObject.x + 10,
        y: originalObject.y + 10,
      };

      if (duplicatedObject.key) {
        const type = duplicatedObject.type === 'qrcode' ? 'qrcode' : duplicatedObject.type as 'text' | 'image' | 'barcode';
        if (objectCounters.current[type] !== undefined) {
          objectCounters.current[type]++;
          const newKey = `${type}_${objectCounters.current[type]}`;
          duplicatedObject.key = newKey;
          
          if (duplicatedObject.type === 'text') {
            duplicatedObject.text = `{{${newKey}}}`;
          } else if (duplicatedObject.type === 'image') {
            duplicatedObject.src = `https://placehold.co/200x200.png?text={{${newKey}}}`;
          } else if (duplicatedObject.type === 'qrcode') {
             duplicatedObject.value = `{{${newKey}}}`;
          }
        }
      }

      newObjects.push(duplicatedObject);
      newSelectedIds.push(newId);
    });

    setHistory(newObjects);
    setDisplayObjects(newObjects);
    setSelectedObjectIds(newSelectedIds);
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
      setHistory(newObjects);
      return;
    }
  
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedObjects.forEach(obj => {
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + obj.width);
      maxY = Math.max(maxY, obj.y + obj.height);
    });

    switch(alignment) {
      case 'left':
        newObjects = newObjects.map(o => selectedObjectIds.includes(o.id) ? {...o, x: minX} : o);
        break;
      case 'center':
        const bboxCenter = minX + (maxX - minX) / 2;
        newObjects = newObjects.map(o => selectedObjectIds.includes(o.id) ? {...o, x: bboxCenter - o.width / 2} : o);
        break;
      case 'right':
        newObjects = newObjects.map(o => selectedObjectIds.includes(o.id) ? {...o, x: maxX - o.width} : o);
        break;
      case 'top':
         newObjects = newObjects.map(o => selectedObjectIds.includes(o.id) ? {...o, y: minY} : o);
        break;
      case 'middle':
        const bboxMiddle = minY + (maxY - minY) / 2;
        newObjects = newObjects.map(o => selectedObjectIds.includes(o.id) ? {...o, y: bboxMiddle - o.height / 2} : o);
        break;
      case 'bottom':
        newObjects = newObjects.map(o => selectedObjectIds.includes(o.id) ? {...o, y: maxY - o.height} : o);
        break;
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
  
    setHistory(newObjects);
  };

  return {
    objects,
    displayObjects,
    selectedObjectIds,
    setSelectedObjectIds,
    handleAddItem,
    handleClearAll,
    handleLayerAction,
    handleUpdateObject,
    handleAlign,
    handleDuplicate,
    handleReplaceData,
    handleLoadTemplateFromJson,
    canvasRef,
    loadedTemplate,
    isLoadingTemplate,
    handleUndo: undo,
    handleRedo: redo,
    canUndo,
    canRedo,
  };
};
