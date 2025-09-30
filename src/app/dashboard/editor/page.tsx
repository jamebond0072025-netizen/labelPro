

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { LeftSidebar } from '@/components/editor/left-sidebar';
import { RightSidebar } from '@/components/editor/right-sidebar';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { useCanvasObjects } from '@/hooks/use-canvas-objects';
import { Loader2 } from 'lucide-react';
import type { CanvasSettings } from '@/lib/types';
import { useEditor } from '@/contexts/editor-context';


export default function EditorPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [zoom, setZoom] = useState(1);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    width: 500,
    height: 700,
    backgroundColor: '#FFFFFF',
  });
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);

  const handleUpdateCanvasSettings = (newSettings: Partial<CanvasSettings>) => {
    setCanvasSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  const {
    objects,
    selectedObjectIds,
    setSelectedObjectIds,
    handleAddItem,
    handleClearAll,
    handleLayerAction,
    handleUpdateObject,
    handleAlign,
    handleLoadTemplateFromJson,
    canvasRef,
    setObjects,
    loadedTemplate,
    isLoadingTemplate
  } = useCanvasObjects(templateId, canvasSettings, handleUpdateCanvasSettings);

  const { setEditorState, loadTemplate, setExistingTemplate } = useEditor();

   useEffect(() => {
    setEditorState({
      canvasRef,
      objects,
      canvasSettings,
    });
  }, [canvasRef, objects, canvasSettings, setEditorState]);

  useEffect(() => {
    if (loadTemplate) {
        loadTemplate.current = handleLoadTemplateFromJson;
    }
  }, [handleLoadTemplateFromJson, loadTemplate]);

  useEffect(() => {
    if (loadedTemplate) {
      setExistingTemplate(loadedTemplate);
    }
     return () => {
      setExistingTemplate(undefined);
    };
  }, [loadedTemplate, setExistingTemplate]);


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
  
  if (isLoadingTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading Template...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col grid grid-cols-[auto_1fr_auto] overflow-hidden">
      <LeftSidebar
          objects={objects}
          selectedObjectIds={selectedObjectIds}
          onSelectObject={(id) => setSelectedObjectIds([id])}
          onLayerAction={handleLayerAction}
          defaultCollapsed={true}
      />

      <div className="flex flex-col overflow-hidden">
        <EditorToolbar
          onAddItem={handleAddItem}
          onClearAll={handleClearAll}
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
      
       <RightSidebar 
            selectedObject={selectedObject} 
            onUpdate={handleUpdateObject}
            canvasSettings={canvasSettings}
            onUpdateCanvasSettings={handleUpdateCanvasSettings}
            onDelete={() => handleLayerAction('delete')}
            defaultCollapsed={!isDesktop}
        />
    </div>
  );
}
