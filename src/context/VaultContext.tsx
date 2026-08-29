import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api/client';
import { BookData, BookDimensions, BookshelfEntry, CoverTheme, PageData, VaultData } from '../types/notebook';
import { useAuth } from './AuthContext';

export interface VaultContextType {
  vault: VaultData | null;
  activeBook: BookData | null;
  activeBookId: string | null;
  books: BookshelfEntry[];
  loading: boolean;
  error: string | null;
  switchBook: (bookId: string) => Promise<void>;
  createBook: (title: string, coverColor: CoverTheme, dimensions?: BookDimensions) => Promise<void>;
  renameBook: (bookId: string, title?: string, coverColor?: CoverTheme) => Promise<void>;
  updateDimensions: (bookId: string, dimensions: BookDimensions) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  updateActiveBook: (updater: (book: BookData) => BookData) => void;
  updateActivePages: (pages: PageData[]) => void;
  updateActivePage: (pageIndex: number, update: Partial<PageData>) => void;
  refreshBooks: () => Promise<void>;
  setActiveBook: React.Dispatch<React.SetStateAction<BookData | null>>;
  setVault: React.Dispatch<React.SetStateAction<VaultData | null>>;
}

export const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isUnlocked, authPayload, handleSessionLocked } = useAuth();

  const [vault, setVault] = useState<VaultData | null>(null);
  const [activeBook, setActiveBook] = useState<BookData | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<BookshelfEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBooks = useCallback(async (): Promise<void> => {
    if (!isUnlocked) return;
    try {
      const data = await api.getBooks();
      if (data && data.ok) {
        setBooks(data.books || []);
        if (data.activeBookId) {
          setActiveBookId(data.activeBookId);
        }
      }
    } catch (err: any) {
      if (err.status === 401) {
        handleSessionLocked();
      }
      setError(err.message || 'Failed to load books.');
    }
  }, [isUnlocked, handleSessionLocked]);

  // Sync state from Auth payload when unlocked
  useEffect(() => {
    if (isUnlocked && authPayload) {
      setVault(authPayload.vault || null);
      setActiveBook(authPayload.notebook || null);
      setActiveBookId(authPayload.activeBookId || authPayload.notebook?.id || null);
      refreshBooks();
    } else if (!isUnlocked) {
      setVault(null);
      setActiveBook(null);
      setActiveBookId(null);
      setBooks([]);
    }
  }, [isUnlocked, authPayload, refreshBooks]);

  // When active book changes, update body cover attribute
  useEffect(() => {
    if (activeBook?.coverColor) {
      document.body.dataset.cover = activeBook.coverColor;
    }
  }, [activeBook?.coverColor]);

  const switchBook = useCallback(
    async (bookId: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.switchBook({ bookId });
        if (res && res.ok) {
          setActiveBook(res.notebook);
          setVault(res.vault);
          setActiveBookId(res.activeBookId || res.notebook.id);
          await refreshBooks();
        }
      } catch (err: any) {
        if (err.status === 401) {
          handleSessionLocked();
        }
        setError(err.message || 'Could not switch book.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshBooks, handleSessionLocked]
  );

  const createBook = useCallback(
    async (title: string, coverColor: CoverTheme, dimensions?: BookDimensions): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.createBook({ title, coverColor, dimensions });
        if (res && res.ok) {
          setActiveBook(res.notebook);
          setVault(res.vault);
          setActiveBookId(res.activeBookId || res.notebook.id);
          await refreshBooks();
        }
      } catch (err: any) {
        if (err.status === 401) {
          handleSessionLocked();
        }
        setError(err.message || 'Could not create book.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshBooks, handleSessionLocked]
  );

  const renameBook = useCallback(
    async (bookId: string, title?: string, coverColor?: CoverTheme): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.renameBook({ bookId, title, coverColor });
        if (res && res.ok) {
          if (res.notebook) {
            setActiveBook(res.notebook);
          }
          if (res.vault) {
            setVault(res.vault);
          }
          await refreshBooks();
        }
      } catch (err: any) {
        if (err.status === 401) {
          handleSessionLocked();
        }
        setError(err.message || 'Could not rename book.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshBooks, handleSessionLocked]
  );

  const updateDimensions = useCallback(
    async (bookId: string, dimensions: BookDimensions): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.updateBookDimensions({ bookId, dimensions });
        if (res && res.ok) {
          if (res.notebook) {
            setActiveBook(res.notebook);
          }
          if (res.vault) {
            setVault(res.vault);
          }
          await refreshBooks();
        }
      } catch (err: any) {
        if (err.status === 401) {
          handleSessionLocked();
        }
        setError(err.message || 'Could not update notebook dimensions.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshBooks, handleSessionLocked]
  );

  const deleteBook = useCallback(
    async (bookId: string): Promise<void> => {
      // Minimum 1-book invariant guard
      if (books.length <= 1 || (vault?.books && vault.books.length <= 1)) {
        const invariantErr = new Error('Cannot delete the only remaining notebook in your vault.');
        setError(invariantErr.message);
        throw invariantErr;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await api.deleteBook({ bookId });
        if (res && res.ok) {
          setActiveBook(res.notebook);
          setVault(res.vault);
          setActiveBookId(res.activeBookId || res.notebook.id);
          await refreshBooks();
        }
      } catch (err: any) {
        if (err.status === 401) {
          handleSessionLocked();
        }
        setError(err.message || 'Could not delete book.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [books.length, vault?.books, refreshBooks, handleSessionLocked]
  );

  const updateActiveBook = useCallback((updater: (book: BookData) => BookData): void => {
    setActiveBook((prev) => {
      if (!prev) return null;
      return updater(prev);
    });
  }, []);

  const updateActivePages = useCallback((pages: PageData[]): void => {
    setActiveBook((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        pages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateActivePage = useCallback((pageIndex: number, update: Partial<PageData>): void => {
    setActiveBook((prev) => {
      if (!prev || !prev.pages[pageIndex]) return prev;
      const updatedPages = [...prev.pages];
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        ...update,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const value: VaultContextType = {
    vault,
    activeBook,
    activeBookId,
    books,
    loading,
    error,
    switchBook,
    createBook,
    renameBook,
    updateDimensions,
    deleteBook,
    updateActiveBook,
    updateActivePages,
    updateActivePage,
    refreshBooks,
    setActiveBook,
    setVault,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};

export const useVault = (): VaultContextType => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};

export default VaultContext;
