
'use client';

import { useState, useCallback,useRef } from 'react';

type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export const useHistory = <T>(initialPresent: T) => {
  const initial = useRef(initialPresent); 
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present:  initial.current,
    future: [],
  });

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;

  const undo = useCallback(() => {
    if (!canUndo) {
      return;
    }
    setState((currentState) => {
      const { past, present, future } = currentState;
      const newPresent = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const newFuture = [present, ...future];
      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) {
      return;
    }
    setState((currentState) => {
      const { past, present, future } = currentState;
      const newPresent = future[0];
      const newFuture = future.slice(1);
      const newPast = [...past, present];
      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, [canRedo]);

  const set = useCallback((newPresent: T) => {
    setState((currentState) => {
      const { past, present } = currentState;
      if (newPresent === present) {
        return currentState;
      }
      return {
        past: [...past, present],
        present: newPresent,
        future: [],
      };
    });
  }, []);
  
   const clear = useCallback(() => {
    setState({
      past: [],
      present: initial.current, // stable ref
      future: [],
    });
  }, []);


  return [state.present, { set, undo, redo, clear, canUndo, canRedo }] as const;
};
