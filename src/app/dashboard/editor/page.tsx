'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { LeftSidebar } from '@/components/editor/left-sidebar';
import { RightSidebar } from '@/components/editor/right-sidebar';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { useCanvasObjects } from '@/hooks/use-canvas-objects';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight } from 'lucide-react';

export default function EditorPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  
  const {
    objects,
    selectedObjectId,
    setSelectedObjectId,
    handleAddItem,
    handleClearAll,
    handleLayerAction,
    handleUpdateObject,
    canvasRef,
  } = useCanvasObjects(templateId);

  const [zoom, setZoom] = useState(1);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  const deselectObject = (e: React.MouseEvent) => {
    // Deselect if clicking on the canvas container itself
    if (e.target === canvasRef.current?.parentElement?.parentElement) {
      setSelectedObjectId(null);
    }
  };
  
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] overflow-hidden" onClick={deselectObject}>
      {isDesktop ? (
          <LeftSidebar
              objects={objects}
              selectedObjectId={selectedObjectId}
              onSelectObject={setSelectedObjectId}
              onLayerAction={handleLayerAction}
          />
      ) : (
          <Sheet>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden fixed top-[4.5rem] left-2 z-10 bg-background/80">
                      <PanelLeft className="h-5 w-5"/>
                  </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[260px]">
                  <LeftSidebar
                      objects={objects}
                      selectedObjectId={selectedObjectId}
                      onSelectObject={setSelectedObjectId}
                      onLayerAction={handleLayerAction}
                      isSheet
                  />
              </SheetContent>
          </Sheet>
      )}

      <div className="flex flex-col overflow-hidden">
        <EditorToolbar
          onAddItem={handleAddItem}
          onClearAll={handleClearAll}
          onLayerAction={handleLayerAction}
          onZoom={setZoom}
          zoom={zoom}
          hasSelectedObject={!!selectedObjectId}
        />
        <EditorCanvas
          canvasRef={canvasRef}
          objects={objects}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onUpdateObject={handleUpdateObject}
          zoom={zoom}
        />
      </div>
      
      {isDesktop ? (
          <RightSidebar selectedObject={selectedObject} onUpdate={handleUpdateObject} />
      ) : (
           <Sheet>
              <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden fixed top-[4.5rem] right-2 z-10 bg-background/80">
                      <PanelRight className="h-5 w-5"/>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[300px]">
                  <RightSidebar selectedObject={selectedObject} onUpdate={handleUpdateObject} isSheet />
              </SheetContent>
          </Sheet>
      )}
    </div>
  );
}
