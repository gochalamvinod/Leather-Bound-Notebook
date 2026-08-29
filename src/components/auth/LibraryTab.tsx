import React from 'react';
import { BookshelfEntry } from '../../types/notebook';

export interface LibraryTabProps {
  notebooks: BookshelfEntry[];
  selectedBookId?: string | null;
  onSelectBook: (book: BookshelfEntry) => void;
  onSwitchToCreate: () => void;
  loading?: boolean;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  notebooks,
  selectedBookId,
  onSelectBook,
  onSwitchToCreate,
  loading = false,
}) => {
  return (
    <div id="viewAllNotebooks" className="lock-tab-view active">
      <div className="lock-shelf-header">
        <span className="shelf-label">Library Collection</span>
        <button
          type="button"
          id="shelfCreateBtn"
          className="brass-link-btn"
          onClick={onSwitchToCreate}
        >
          + New User / Book
        </button>
      </div>

      <div id="lockNotebooksList" className="lock-notebooks-list">
        {loading && (
          <div style={{ textAlign: 'center', color: 'rgba(244,237,222,0.6)', padding: '14px' }}>
            Loading library collection...
          </div>
        )}

        {!loading && notebooks.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: 'rgba(244,237,222,0.75)',
              padding: '18px 12px',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: '8px',
              border: '1px dashed rgba(184,147,90,0.3)',
            }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>📖</div>
            <p style={{ margin: '0 0 10px', fontSize: '0.9rem' }}>No notebooks found yet.</p>
            <button
              type="button"
              className="brass-btn"
              style={{ padding: '7px 14px', fontSize: '0.85rem' }}
              id="emptyCreateBtn"
              onClick={onSwitchToCreate}
            >
              Create Your First Notebook
            </button>
          </div>
        )}

        {!loading &&
          notebooks.map((b) => {
            const isSelected = selectedBookId === b.id;
            const spineClass = `spine-${b.coverColor || 'brown'}`;
            const pageStr = `${b.pageCount || 1} ${b.pageCount === 1 ? 'page' : 'pages'}`;
            const owner = b.owner || b.user || 'default';
            const updatedStr = b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : '';

            return (
              <div
                key={b.id}
                className={`lock-book-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectBook(b)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBook(b);
                  }
                }}
              >
                <div className="lock-book-left">
                  <div className={`lock-book-spine-mini ${spineClass}`} />
                  <div className="lock-book-info">
                    <div className="lock-book-title">{b.title || 'Untitled Notebook'}</div>
                    <div className="lock-book-meta">
                      <span className="lock-book-owner-badge">👤 {owner}</span>
                      <span>{pageStr}</span>
                      {updatedStr && <span>· {updatedStr}</span>}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="lock-book-open-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBook(b);
                  }}
                >
                  Open 🔓
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default LibraryTab;
