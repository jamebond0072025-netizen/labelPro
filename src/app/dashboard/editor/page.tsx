'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { PropertiesPanel } from '@/components/editor/properties-panel';
import { LayersPanel } from '@/components/editor/layers-panel';
import { CanvasObject as CanvasObjectComponent } from '@/components/editor/canvas-object';
import type { CanvasObject, TextObject, ImageObject, BarcodeObject } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight, Type, Image as ImageIcon, Barcode, Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

type InteractionType = 'drag' | 'resize' | 'rotate';
type InteractionHandle = 'nw' | 'ne' | 'sw' | 'se' | 'rotate' | 'body';

export default function EditorPage() {
  const [objects, setObjects] = useState<CanvasObject[]>(initialObjects);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  
  const [isLeftSidebarPinned, setIsLeftSidebarPinned] = useState(false);
  const [isRightSidebarPinned, setIsRightSidebarPinned] = useState(true);
  const [isLeftSidebarHovered, setIsLeftSidebarHovered] = useState(false);
  const [isRightSidebarHovered, setIsRightSidebarHovered] = useState(false);
  const [zoom, setZoom] = useState(1);

  const canvasRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<{
    id: string;
    type: InteractionType;
    handle: InteractionHandle;
    startX: number;
    startY: number;
    originalObject: CanvasObject;
  } | null>(null);

  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const isLeftSidebarOpen = isLeftSidebarPinned || isLeftSidebarHovered;
  const isRightSidebarOpen = isRightSidebarPinned || isRightSidebarHovered;

  useEffect(() => {
    const templateId = searchParams.get('template');
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
  }, [searchParams]);

  useEffect(() => {
    if (!isDesktop) {
        setIsLeftSidebarPinned(false);
        setIsRightSidebarPinned(false);
    } else {
        setIsLeftSidebarPinned(false);
        setIsRightSidebarPinned(true);
    }
  }, [isDesktop]);

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
  }

  const handleLayerAction = (action: 'bring-forward' | 'send-backward' | 'delete') => {
    if (!selectedObjectId) return;

    if(action === 'delete') {
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

  const handleInteractionStart = (e: React.PointerEvent, id: string, type: InteractionType, handle: InteractionHandle) => {
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
        handleUpdateObject(id, {
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
        
        handleUpdateObject(id, { 
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
        handleUpdateObject(id, {
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
  
  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  const deselectObject = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedObjectId(null);
    }
  };

  const LeftSidebar = () => (
    <div className="flex flex-col border-r bg-card h-full w-[240px]">
        <LayersPanel
            objects={objects}
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
            onLayerAction={handleLayerAction}
        />
    </div>
  )

  const RightSidebar = () => (
     <PropertiesPanel
        selectedObject={selectedObject}
        onUpdate={handleUpdateObject}
      />
  )
  
  const gridStyle: React.CSSProperties = {
      gridTemplateColumns: isDesktop 
        ? `${isLeftSidebarOpen ? '240px' : '56px'} 1fr ${isRightSidebarOpen ? '300px' : '56px'}`
        : '1fr'
  };

  return (
    <TooltipProvider>
    <div className="grid h-full transition-all duration-300 bg-muted" style={gridStyle}>
        <div 
            className={cn("hidden lg:block transition-all duration-300 overflow-hidden relative", isLeftSidebarOpen ? 'w-[240px]' : 'w-[56px]')}
            onMouseEnter={() => !isLeftSidebarPinned && setIsLeftSidebarHovered(true)}
            onMouseLeave={() => !isLeftSidebarPinned && setIsLeftSidebarHovered(false)}
        >
            {isLeftSidebarOpen ? (
                <LeftSidebar />
            ) : (
                <div className="flex flex-col items-center gap-2 p-2 border-r h-full bg-card">
                   <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsLeftSidebarHovered(true)}>
                                <PanelLeft className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Layers</p>
                        </TooltipContent>
                     </Tooltip>
                </div>
            )}
             <div className="hidden lg:block absolute top-2 z-10" style={{ right: isLeftSidebarOpen ? '0.5rem' : '-2.5rem' }}>
                <Button variant="ghost" size="icon" onClick={() => setIsLeftSidebarPinned(!isLeftSidebarPinned)}>
                    {isLeftSidebarOpen ? 
                        (isLeftSidebarPinned ? <Pin className="h-5 w-5" /> : <PinOff className="h-5 w-5 text-muted-foreground" />)
                        : <PanelLeft className="h-5 w-5" />
                    }
                </Button>
            </div>
        </div>

        <div className="bg-muted flex flex-col items-center justify-center p-4 relative" onClick={deselectObject}>
            <EditorToolbar
                onAddItem={handleAddItem}
                onClearAll={handleClearAll}
                onLayerAction={handleLayerAction}
                onZoom={setZoom}
                zoom={zoom}
                hasSelectedObject={!!selectedObjectId}
            />
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
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
                        onSelect={setSelectedObjectId}
                        onInteractionStart={handleInteractionStart}
                        />
                    ))}
                </div>
            </div>
        </div>
        
        <div 
          className={cn("hidden lg:block transition-all duration-300 overflow-hidden relative", isRightSidebarOpen ? 'w-[300px]' : 'w-[56px]')}
          onMouseEnter={() => !isRightSidebarPinned && setIsRightSidebarHovered(true)}
          onMouseLeave={() => !isRightSidebarPinned && setIsRightSidebarHovered(false)}
        >
            {isRightSidebarOpen ? <RightSidebar /> : (
                 <div className="flex flex-col items-center gap-2 p-2 border-l h-full bg-card">
                   <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsRightSidebarHovered(true)}>
                                <PanelRight className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Properties</p>
                        </TooltipContent>
                     </Tooltip>
                </div>
            )}
             <div className="hidden lg:block absolute top-2 z-10" style={{ left: isRightSidebarOpen ? '0.5rem' : '-2.5rem' }}>
                <Button variant="ghost" size="icon" onClick={() => setIsRightSidebarPinned(!isRightSidebarPinned)}>
                    {isRightSidebarOpen ?
                        (isRightSidebarPinned ? <Pin className="h-5 w-5" /> : <PinOff className="h-5 w-5 text-muted-foreground" />)
                        : <PanelRight className="h-5 w-5" />
                    }
                </Button>
            </div>
        </div>

        {!isDesktop && (
            <>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden fixed top-16 left-2 z-10 bg-background/80">
                            <PanelLeft className="h-5 w-5"/>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[260px]">
                        <LeftSidebar />
                    </SheetContent>
                </Sheet>
                <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="ghost" size="icon" className="lg:hidden fixed top-16 right-2 z-10 bg-background/80">
                            <PanelRight className="h-5 w-5"/>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 w-[300px]">
                       <RightSidebar />
                    </SheetContent>
                </Sheet>
            </>
        )}
    </div>
    </TooltipProvider>
  );
}
