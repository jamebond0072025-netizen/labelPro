
'use client';

import React, { createContext, useContext, useState, ReactNode, RefObject, useCallback, useRef, MutableRefObject } from 'react';
import type { CanvasObject, CanvasSettings, Template } from '@/lib/types';

export interface EditorState {
  canvasRef: RefObject<HTMLDivElement> | null;
  objects: CanvasObject[];
  canvasSettings: CanvasSettings;
}

interface EditorContextType {
  editorState: EditorState | null;
  setEditorState: (state: EditorState) => void;
  loadTemplate: MutableRefObject<((file: File) => void) | null>;
  existingTemplate?: Template;
  setExistingTemplate: (template?: Template) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [existingTemplate, setExistingTemplate] = useState<Template | undefined>();
  const loadTemplate = useRef<((file: File) => void) | null>(null);
  
  const setEditorStateCallback = useCallback((state: EditorState) => {
    setEditorState(state);
  }, []);

  const setExistingTemplateCallback = useCallback((template?: Template) => {
    setExistingTemplate(template);
  }, []);


  return (
    <EditorContext.Provider value={{ 
        editorState, 
        setEditorState: setEditorStateCallback, 
        loadTemplate,
        existingTemplate,
        setExistingTemplate: setExistingTemplateCallback,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}

    