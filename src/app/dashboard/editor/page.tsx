
'use client';

import { useState, useEffect } from 'react';
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
import type { CanvasSettings } from '@/lib/types';
import { useEditor } from '@/contexts/editor-context';


export default function EditorPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  const [zoom, setZoom] = useState(1);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    width: 500,
    height: 700,
    backgroundColor: '#FFFFFF',
    backgroundImage: '',
  });
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);

  const {
    objects,
    selectedObjectIds,
    setSelectedObjectIds,
    handleAddItem,
    handleClearAll,
    handleLayerAction,
    handleUpdateObject,
    handleAlign,
    handleReplaceData,
    canvasRef,
    setObjects,
  } = useCanvasObjects(templateId, canvasSettings);

  const { setEditorState } = useEditor();

   useEffect(() => {
    setEditorState({
      canvasRef,
      objects,
      canvasSettings,
    });
  }, [canvasRef, objects, canvasSettings, setEditorState]);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleUpdateCanvasSettings = (newSettings: Partial<CanvasSettings>) => {
    setCanvasSettings(prev => ({ ...prev, ...newSettings }));
  };

  const selectedObject = objects.find((obj) => obj.id === selectedObjectIds[selectedObjectIds.length - 1]);

  const handleDeselectAll = () => {
    setSelectedObjectIds([]);
    setEditingObjectId(null);
  }

  const handleObjectDoubleClick = (id: string) => {
    const object = objects.find(obj => obj.id === id);
    if (object && object.type === 'text') {
      setEditingObjectId(id);
      // Deselect other objects when starting to edit
      setSelectedObjectIds([id]);
    }
  }
  
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] overflow-hidden">
      {isDesktop ? (
          <LeftSidebar
              objects={objects}
              selectedObjectIds={selectedObjectIds}
              onSelectObject={(id) => setSelectedObjectIds([id])}
              onLayerAction={handleLayerAction}
              onReplaceData={handleReplaceData}
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
                      selectedObjectIds={selectedObjectIds}
                      onSelectObject={(id) => setSelectedObjectIds([id])}
                      onLayerAction={handleLayerAction}
                      onReplaceData={handleReplaceData}
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
          selectedObjectIds={selectedObjectIds}
          onAlign={handleAlign}
        />
        <EditorCanvas
          canvasRef={canvasRef}
          objects={objects}
          selectedObjectIds={selectedObjectIds}
          onSelectObject={(id) => {
            setSelectedObjectIds(id ? [id] : []);
            setEditingObjectId(null);
          }}
          onUpdateObject={handleUpdateObject}
          zoom={zoom}
          canvasSettings={canvasSettings}
          onDeselectAll={handleDeselectAll}
          onSetSelectedObjectIds={setSelectedObjectIds}
          editingObjectId={editingObjectId}
          onObjectDoubleClick={handleObjectDoubleClick}
          onStopEditing={() => setEditingObjectId(null)}
        />
      </div>
      
      {isDesktop ? (
          <RightSidebar 
            selectedObject={selectedObject} 
            onUpdate={handleUpdateObject}
            canvasSettings={canvasSettings}
            onUpdateCanvasSettings={handleUpdateCanvasSettings}
            onDelete={() => handleLayerAction('delete')}
          />
      ) : (
           <Sheet>
              <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden fixed top-[4.5rem] right-2 z-10 bg-background/80">
                      <PanelRight className="h-5 w-5"/>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[300px]">
                  <RightSidebar 
                    selectedObject={selectedObject} 
                    onUpdate={handleUpdateObject} 
                    canvasSettings={canvasSettings}
                    onUpdateCanvasSettings={handleUpdateCanvasSettings}
                    onDelete={() => handleLayerAction('delete')}
                    isSheet 
                  />
              </SheetContent>
          </Sheet>
      )}
    </div>
  );
}
