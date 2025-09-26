
'use client';

import React, { createContext, useContext, useState, ReactNode, RefObject, useCallback } from 'react';
import type { CanvasObject, CanvasSettings } from '@/lib/types';

export interface EditorState {
  canvasRef: RefObject<HTMLDivElement> | null;
  objects: CanvasObject[];
  canvasSettings: CanvasSettings;
}

interface EditorContextType {
  editorState: EditorState | null;
  setEditorState: (state: EditorState) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  
  const setEditorStateCallback = useCallback((state: EditorState) => {
    setEditorState(state);
  }, []);

  return (
    <EditorContext.Provider value={{ editorState, setEditorState: setEditorStateCallback }}>
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
