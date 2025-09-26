
'use client';

import React, { createContext, useContext, useState, ReactNode, RefObject, useCallback, useRef, MutableRefObject } from 'react';
import type { CanvasObject, CanvasSettings } from '@/lib/types';

export interface EditorState {
  canvasRef: RefObject<HTMLDivElement> | null;
  objects: CanvasObject[];
  canvasSettings: CanvasSettings;
}

interface EditorContextType {
  editorState: EditorState | null;
  setEditorState: (state: EditorState) => void;
  loadTemplate: MutableRefObject<((file: File) => void) | null>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const loadTemplate = useRef<((file: File) => void) | null>(null);
  
  const setEditorStateCallback = useCallback((state: EditorState) => {
    setEditorState(state);
  }, []);

  return (
    <EditorContext.Provider value={{ editorState, setEditorState: setEditorStateCallback, loadTemplate }}>
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
