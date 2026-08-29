import React, { useEffect, useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { useEditor } from '../../context/EditorContext';

export interface BookshelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewBook: () => void;
}

export const BookshelfModal: React.FC<BookshelfModalProps> = ({
  isOpen,
  onClose,
  onOpenNewBook,
}) => {
  const { books, activeBook, activeBookId, switchBook, renameBook, deleteBook, refreshBooks } = useVault();
  const { flushSave } = useEditor();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshBooks();
      setActionError(null);
      setRenamingId(null);
    }
  }, [isOpen, refreshBooks]);

  if (!isOpen) return null;

  const handleSwitch = async (bookId: string) => {
    if (bookId === (activeBook?.id || activeBookId)) {
      onClose();
      return;
    }
    try {
      await flushSave();
      await switchBook(bookId);
      onClose();
    } catch (err: any) {
      setActionError(err.message || 'Failed to switch notebook.');
    }
  };

  const handleStartRename = (e: React.MouseEvent, bookId: string, currentTitle: string) => {
    e.stopPropagation();
    setRenamingId(bookId);
    setRenameTitle(currentTitle);
    setActionError(null);
  };

  const handleSaveRename = async (e: React.FormEvent | React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!renameTitle.trim()) return;
    try {
      await renameBook(bookId, renameTitle.trim());
      setRenamingId(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to rename notebook.');
    }
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(null);
  };

  const handleDelete = async (e: React.MouseEvent, bookId: string, title: string) => {
    e.stopPropagation();
    if (books.length <= 1) {
      setActionError('Cannot delete the only remaining notebook in your library.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteBook(bookId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete notebook.');
    }
  };

  return (
    <div id="bookshelfModal" className="modal-overlay">
      <div className="modal-backdrop" id="bookshelfBackdrop" onClick={onClose} />
      <div className="bookshelf-card">
        <div className="modal-header">
          <h2>📚 Your Library</h2>
          <button
            type="button"
            id="closeBookshelfBtn"
            className="modal-close-btn"
            title="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <p className="modal-subtitle">
          Switch between your private leatherbound notebooks or create a new one.
        </p>

        {actionError && (
          <div
            style={{
              background: 'rgba(139, 58, 58, 0.25)',
              border: '1px solid var(--danger-bright)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'var(--danger-bright)',
              marginBottom: '12px',
              fontSize: '0.9rem',
            }}
          >
            {actionError}
          </div>
        )}

        <div className="bookshelf-grid" id="bookshelfGrid">
          {books.map((b) => {
            const isActive = b.id === (activeBook?.id || activeBookId);
            const colorClass = `spine-${b.coverColor || 'brown'}`;
            const pageCountStr = `${b.pageCount || 1} ${b.pageCount === 1 ? 'page' : 'pages'}`;
            const updatedStr = b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : '';
            const isRenaming = renamingId === b.id;

            return (
              <div
                key={b.id}
                className={`book-card-item ${isActive ? 'book-card-item--active' : ''}`}
                onClick={() => handleSwitch(b.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSwitch(b.id);
                  }
                }}
              >
                <div className="book-card-header">
                  <div className={`book-card-spine ${colorClass}`} />
                  <div className="book-card-info">
                    {isRenaming ? (
                      <form
                        onSubmit={(e) => handleSaveRename(e, b.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'flex', gap: '4px', margin: '4px 0' }}
                      >
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          autoFocus
                          maxLength={80}
                          style={{
                            padding: '4px 8px',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid var(--brass)',
                            borderRadius: '4px',
                            color: 'var(--paper)',
                            fontSize: '0.9rem',
                            flex: 1,
                          }}
                        />
                        <button
                          type="submit"
                          className="brass-btn"
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="cancel-btn"
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                          onClick={handleCancelRename}
                        >
                          ✕
                        </button>
                      </form>
                    ) : (
                      <h4 className="book-card-title">{b.title}</h4>
                    )}
                    <div className="book-card-meta">
                      {pageCountStr} · {updatedStr}
                    </div>
                  </div>
                  {isActive && <span className="book-card-badge">Active</span>}
                </div>

                <div className="book-card-footer" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="book-action-btn book-action-btn--rename"
                    title="Rename notebook"
                    onClick={(e) => handleStartRename(e, b.id, b.title)}
                  >
                    ✏ Rename
                  </button>
                  {books.length > 1 && (
                    <button
                      type="button"
                      className="book-action-btn book-action-btn--delete"
                      title="Delete notebook"
                      onClick={(e) => handleDelete(e, b.id, b.title)}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            id="openNewBookModalBtn"
            className="brass-btn"
            onClick={() => {
              onClose();
              onOpenNewBook();
            }}
          >
            + New Notebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookshelfModal;
