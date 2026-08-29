import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api/client';
import { BookData, SaveStatus } from '../types/notebook';
import { useAuth } from './AuthContext';
import { useVault } from './VaultContext';

export interface EditorContextType {
  saveStatus: SaveStatus;
  saveStatusLabel: string;
  saveError: string | null;
  isDirty: boolean;
  lastSavedAt: string | null;
  scheduleAutosave: (updatedBook?: BookData) => void;
  saveNow: () => Promise<void>;
  markDirty: () => void;
  flushSave: () => Promise<void>;
  cancelPendingSave: () => void;
}

export const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isUnlocked, handleSessionLocked } = useAuth();
  const { activeBook, setVault } = useVault();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('Saved');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeBookRef = useRef<BookData | null>(activeBook);
  const isSavingRef = useRef<boolean>(false);
  const hasQueuedSaveRef = useRef<boolean>(false);

  useEffect(() => {
    activeBookRef.current = activeBook;
  }, [activeBook]);

  const cancelPendingSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const saveNow = useCallback(async (): Promise<void> => {
    cancelPendingSave();
    const currentBook = activeBookRef.current;

    if (!isUnlocked || !currentBook) {
      return;
    }

    if (isSavingRef.current) {
      hasQueuedSaveRef.current = true;
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('Saving...');
    setSaveError(null);

    try {
      const res = await api.saveNotebook({ notebook: currentBook });
      if (res && res.ok) {
        setSaveStatus('Saved');
        setSaveError(null);
        setIsDirty(false);
        setLastSavedAt(res.updatedAt || new Date().toISOString());
        if (res.vault) {
          setVault(res.vault);
        }
      }
    } catch (err: any) {
      if (err.status === 401) {
        setSaveStatus('Locked');
        handleSessionLocked();
        return;
      }
      setSaveStatus('Error');
      setSaveError(err.message || 'Save failed');
      // Retry after 4000ms on network failure
      cancelPendingSave();
      saveTimerRef.current = setTimeout(() => {
        saveNow();
      }, 4000);
    } finally {
      isSavingRef.current = false;
      if (hasQueuedSaveRef.current) {
        hasQueuedSaveRef.current = false;
        saveNow();
      }
    }
  }, [isUnlocked, cancelPendingSave, handleSessionLocked, setVault]);

  const scheduleAutosave = useCallback(
    (updatedBook?: BookData) => {
      if (updatedBook) {
        activeBookRef.current = updatedBook;
      }
      setIsDirty(true);
      setSaveStatus('Editing...');
      cancelPendingSave();
      saveTimerRef.current = setTimeout(() => {
        saveNow();
      }, 1200);
    },
    [cancelPendingSave, saveNow]
  );

  const markDirty = useCallback(() => {
    scheduleAutosave();
  }, [scheduleAutosave]);

  const flushSave = useCallback(async (): Promise<void> => {
    if (isDirty || saveStatus === 'Editing...' || saveTimerRef.current) {
      await saveNow();
    }
  }, [isDirty, saveStatus, saveNow]);

  // Clean up timer on unmount or lock
  useEffect(() => {
    if (!isUnlocked) {
      cancelPendingSave();
      setSaveStatus('Saved');
      setIsDirty(false);
    }
    return () => {
      cancelPendingSave();
    };
  }, [isUnlocked, cancelPendingSave]);

  const saveStatusLabel = (() => {
    switch (saveStatus) {
      case 'Editing...':
      case 'editing':
        return 'Editing…';
      case 'Saving...':
      case 'saving':
        return 'Saving…';
      case 'Saved':
      case 'saved':
        return 'Saved';
      case 'Error':
      case 'error':
        return 'Save failed — retrying';
      case 'Locked':
      case 'locked':
        return 'Locked';
      default:
        return 'Saved';
    }
  })();

  const value: EditorContextType = {
    saveStatus,
    saveStatusLabel,
    saveError,
    isDirty,
    lastSavedAt,
    scheduleAutosave,
    saveNow,
    markDirty,
    flushSave,
    cancelPendingSave,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

export default EditorContext;
