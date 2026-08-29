import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../lib/api/client';
import { AdminNotebookDetails, AdminPageData } from '../../types/api';
import { CoverTheme } from '../../types/notebook';

export interface AdminGodModeModalProps {
  isOpen: boolean;
  bookId: string | null;
  owner?: string;
  initialTitle?: string;
  initialCover?: CoverTheme | string;
  onClose: () => void;
  onBookUpdated?: () => void;
}

const FONT_OPTIONS = [
  { label: 'Georgia (Serif)', value: 'Georgia, serif' },
  { label: 'Cinzel (Classic)', value: "'Cinzel', serif" },
  { label: 'Playfair Display (Editorial)', value: "'Playfair Display', Georgia, serif" },
  { label: 'Merriweather (Literary)', value: "'Merriweather', serif" },
  { label: 'Cormorant Garamond (Vintage)', value: "'Cormorant Garamond', Georgia, serif" },
  { label: 'Courier Prime (Typewriter)', value: "'Courier Prime', monospace" },
  { label: 'Inter (Modern Sans)', value: "'Inter', system-ui, sans-serif" },
];

const FONT_SIZES = [
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '22px',
  '24px',
  '28px',
  '32px',
  '36px',
];

const COLOR_PALETTE = [
  { label: 'Ink Black', color: '#2c2416' },
  { label: 'Vintage Brown', color: '#6e4720' },
  { label: 'Gold Brass', color: '#b8935a' },
  { label: 'Crimson Red', color: '#9b2c2c' },
  { label: 'Forest Green', color: '#22543d' },
  { label: 'Midnight Navy', color: '#1a365d' },
  { label: 'Royal Purple', color: '#5521b5' },
];

export const AdminGodModeModal: React.FC<AdminGodModeModalProps> = ({
  isOpen,
  bookId,
  owner,
  initialTitle,
  initialCover,
  onClose,
  onBookUpdated,
}) => {
  const [notebook, setNotebook] = useState<AdminNotebookDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active page & edit state
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [sourceCodeMode, setSourceCodeMode] = useState<boolean>(false);
  const [pageHtml, setPageHtml] = useState<string>('');
  const [pageFont, setPageFont] = useState<string>('Georgia, serif');
  const [pageFontSize, setPageFontSize] = useState<string>('18px');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [tocOpen, setTocOpen] = useState<boolean>(false);

  // Editable div ref
  const editorRef = useRef<HTMLDivElement>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setError(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setSuccessMsg(null);
  };

  // Load Notebook Data
  const loadNotebook = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminNotebook(bookId);
      const data = res.book || res.notebook;
      if (data) {
        // Ensure pages exist
        const pages: AdminPageData[] =
          data.pages && data.pages.length > 0
            ? data.pages
            : [
                {
                  id: `p-${bookId}-0`,
                  pageIndex: 0,
                  html: '<p></p>',
                  font: 'Georgia, serif',
                  fontSize: '18px',
                },
              ];

        setNotebook({
          ...data,
          pages,
          title: data.title || initialTitle || 'Untitled Notebook',
          owner: data.owner || data.user || owner || 'unknown',
          coverColor: data.coverColor || initialCover || 'brown',
        });

        // Set active page content
        const firstPage = pages[0];
        setPageHtml(firstPage.html || '<p></p>');
        setPageFont(firstPage.font || 'Georgia, serif');
        setPageFontSize(firstPage.fontSize || '18px');
        setCurrentPageIndex(0);
        setIsDirty(false);
      } else {
        throw new Error('Notebook data could not be decrypted or loaded.');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load and decrypt notebook.');
    } finally {
      setLoading(false);
    }
  }, [bookId, initialTitle, initialCover, owner]);

  // Load on mount or when bookId changes
  useEffect(() => {
    if (isOpen && bookId) {
      loadNotebook();
    } else {
      setNotebook(null);
      setIsDirty(false);
      setError(null);
      setSuccessMsg(null);
      setCurrentPageIndex(0);
      setEditMode(false);
      setSourceCodeMode(false);
    }
  }, [isOpen, bookId, loadNotebook]);

  // Sync contentEditable innerHTML when switching pages or view modes
  useEffect(() => {
    if (editorRef.current && editMode && !sourceCodeMode) {
      if (editorRef.current.innerHTML !== pageHtml) {
        editorRef.current.innerHTML = pageHtml;
      }
    }
  }, [currentPageIndex, editMode, sourceCodeMode]);

  // Handle Page Switching
  const handleSelectPage = (newIndex: number) => {
    if (!notebook || newIndex < 0 || newIndex >= notebook.pages.length) return;
    if (newIndex === currentPageIndex) return;

    // Save pending in-memory changes to previous page if needed
    if (isDirty) {
      const updatedPages = [...notebook.pages];
      updatedPages[currentPageIndex] = {
        ...updatedPages[currentPageIndex],
        html: pageHtml,
        font: pageFont,
        fontSize: pageFontSize,
        updatedAt: new Date().toISOString(),
      };
      setNotebook({ ...notebook, pages: updatedPages });
    }

    const targetPage = notebook.pages[newIndex];
    setCurrentPageIndex(newIndex);
    setPageHtml(targetPage.html || '<p></p>');
    setPageFont(targetPage.font || 'Georgia, serif');
    setPageFontSize(targetPage.fontSize || '18px');
    setTocOpen(false);

    if (editorRef.current && editMode && !sourceCodeMode) {
      editorRef.current.innerHTML = targetPage.html || '<p></p>';
    }
  };

  // Add a new page
  const handleAddPage = () => {
    if (!notebook) return;
    const newPageId = `p-${notebook.id}-${Date.now()}`;
    const newPage: AdminPageData = {
      id: newPageId,
      pageIndex: notebook.pages.length,
      html: '<h2>New Page</h2><p>Begin writing page content...</p>',
      font: pageFont || 'Georgia, serif',
      fontSize: pageFontSize || '18px',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPages = [...notebook.pages, newPage];
    setNotebook({ ...notebook, pages: newPages });
    setIsDirty(true);
    handleSelectPage(newPages.length - 1);
    showSuccess(`Added Page ${newPages.length} to notebook.`);
  };

  // Delete current page
  const handleDeletePage = () => {
    if (!notebook || notebook.pages.length <= 1) {
      showError('Cannot delete the only page in a notebook.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Page ${currentPageIndex + 1}?`)) {
      return;
    }

    const newPages = notebook.pages.filter((_, idx) => idx !== currentPageIndex);
    const nextIdx = Math.max(0, currentPageIndex - 1);
    setNotebook({ ...notebook, pages: newPages });
    setIsDirty(true);
    setCurrentPageIndex(nextIdx);
    const nextPage = newPages[nextIdx];
    setPageHtml(nextPage.html || '<p></p>');
    setPageFont(nextPage.font || 'Georgia, serif');
    setPageFontSize(nextPage.fontSize || '18px');
    showSuccess(`Page deleted. Remaining pages: ${newPages.length}.`);
  };

  // Editor Input change
  const handleEditorInput = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setPageHtml(newHtml);
      setIsDirty(true);
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPageHtml(e.target.value);
    setIsDirty(true);
  };

  // Formatting tools execution
  const executeCommand = (command: string, value: string = '') => {
    if (sourceCodeMode) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setPageHtml(editorRef.current.innerHTML);
      setIsDirty(true);
    }
  };

  // Save current page to server
  const handleSaveCurrentPage = async () => {
    if (!notebook || !bookId) return;
    const activePage = notebook.pages[currentPageIndex];
    if (!activePage) return;

    try {
      setSaving(true);
      setError(null);
      await api.saveAdminPage(bookId, activePage.id, {
        html: pageHtml,
        font: pageFont,
        fontSize: pageFontSize,
        drawings: activePage.drawings,
        title: activePage.title,
      });

      // Update in-memory notebook state
      const updatedPages = [...notebook.pages];
      updatedPages[currentPageIndex] = {
        ...activePage,
        html: pageHtml,
        font: pageFont,
        fontSize: pageFontSize,
        updatedAt: new Date().toISOString(),
      };
      setNotebook({ ...notebook, pages: updatedPages });
      setIsDirty(false);
      showSuccess(`Page ${currentPageIndex + 1} saved successfully (God Mode).`);
      if (onBookUpdated) onBookUpdated();
    } catch (err: any) {
      showError(err.message || 'Failed to save page changes.');
    } finally {
      setSaving(false);
    }
  };

  // Save all pages / notebook structure to server
  const handleSaveEntireNotebook = async () => {
    if (!notebook || !bookId) return;
    try {
      setSaving(true);
      setError(null);

      // Consolidate current page into array
      const updatedPages = [...notebook.pages];
      updatedPages[currentPageIndex] = {
        ...updatedPages[currentPageIndex],
        html: pageHtml,
        font: pageFont,
        fontSize: pageFontSize,
        updatedAt: new Date().toISOString(),
      };

      await api.saveAdminNotebook(bookId, {
        book: {
          id: notebook.id,
          title: notebook.title,
          coverColor: notebook.coverColor,
        },
        pages: updatedPages,
      });

      setNotebook({ ...notebook, pages: updatedPages });
      setIsDirty(false);
      showSuccess(`All ${updatedPages.length} pages in notebook saved successfully.`);
      if (onBookUpdated) onBookUpdated();
    } catch (err: any) {
      showError(err.message || 'Failed to save notebook changes.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const totalPages = notebook?.pages.length || 1;
  const activePage = notebook?.pages[currentPageIndex];

  return (
    <div id="adminGodModeModal" className="modal-overlay admin-godmode-overlay">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="admin-godmode-card">
        {/* Header Bar */}
        <div className="admin-godmode-header">
          <div className="admin-godmode-title-section">
            <div className="admin-godmode-title-row">
              <span className="godmode-badge">⚡ GOD MODE</span>
              <h2 className="admin-godmode-heading">
                {notebook?.title || initialTitle || 'Loading Notebook...'}
              </h2>
            </div>
            <div className="admin-godmode-meta-row">
              <span className="meta-pill">
                👤 Owner: <strong>{notebook?.owner || owner || '...'}</strong>
              </span>
              <span className={`cover-pill cover-pill-${notebook?.coverColor || initialCover || 'brown'}`}>
                🎨 {notebook?.coverColor || initialCover || 'brown'}
              </span>
              <span className="meta-pill">
                📄 Page {currentPageIndex + 1} of {totalPages}
              </span>
              {activePage?.id && (
                <span className="meta-pill text-muted" style={{ fontSize: '0.75rem' }}>
                  ID: {activePage.id}
                </span>
              )}
            </div>
          </div>

          <div className="admin-godmode-header-actions">
            {/* View / Edit Mode Toggle */}
            <div className="godmode-mode-toggle">
              <button
                type="button"
                className={`mode-toggle-btn ${!editMode ? 'active' : ''}`}
                onClick={() => setEditMode(false)}
                title="Read and preview rendered HTML"
              >
                👀 Read Mode
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${editMode ? 'active' : ''}`}
                onClick={() => {
                  setEditMode(true);
                  // Ensure contentEditable syncs
                  if (editorRef.current) {
                    editorRef.current.innerHTML = pageHtml;
                  }
                }}
                title="Edit page HTML and typography directly"
              >
                ✏️ Live Editor
              </button>
            </div>

            {/* Save Buttons */}
            <button
              type="button"
              className="brass-btn godmode-save-btn"
              onClick={handleSaveCurrentPage}
              disabled={saving || loading || !notebook}
              title="Save current page to encrypted user vault"
            >
              {saving ? '💾 Saving...' : isDirty ? '💾 Save Page *' : '💾 Save Page'}
            </button>

            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handleSaveEntireNotebook}
              disabled={saving || loading || !notebook}
              title="Save all pages and notebook structure"
            >
              Save All
            </button>

            <button
              type="button"
              className="admin-btn-secondary"
              onClick={loadNotebook}
              disabled={loading || saving}
              title="Reload and decrypt latest version from server"
            >
              🔄
            </button>

            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              title="Close God Mode viewer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Audit & Security Banner */}
        <div className="admin-godmode-audit-banner">
          <span className="audit-shield-icon">🛡️</span>
          <span>
            <strong>Authenticated Admin Session (God Mode):</strong> Decrypting and editing user-encrypted
            notebook vault. All reads and modifications are cryptographically signed and logged in the
            tamper-evident audit trail (<code>ADMIN_BOOK_VIEW</code>, <code>ADMIN_PAGE_EDIT</code>).
          </span>
          {isDirty && <span className="dirty-indicator">● Unsaved Changes</span>}
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="admin-banner admin-banner-error" role="alert">
            <span>⚠️ {error}</span>
            <button type="button" className="admin-banner-dismiss" onClick={() => setError(null)}>
              ✕
            </button>
          </div>
        )}
        {successMsg && (
          <div className="admin-banner admin-banner-success" role="status">
            <span>✓ {successMsg}</span>
            <button type="button" className="admin-banner-dismiss" onClick={() => setSuccessMsg(null)}>
              ✕
            </button>
          </div>
        )}

        {/* Main Workspace */}
        <div className="admin-godmode-workspace">
          {/* Navigation & Controls Bar */}
          <div className="admin-godmode-navbar">
            {/* Page Navigation Buttons */}
            <div className="page-nav-group">
              <button
                type="button"
                className="admin-btn-secondary nav-arrow-btn"
                onClick={() => handleSelectPage(currentPageIndex - 1)}
                disabled={currentPageIndex <= 0 || loading}
                title="Go to previous page"
              >
                ◀ Prev
              </button>

              <div className="page-selector-wrapper">
                <select
                  value={currentPageIndex}
                  onChange={(e) => handleSelectPage(Number(e.target.value))}
                  className="admin-select page-select-dropdown"
                  disabled={loading || !notebook}
                >
                  {notebook?.pages.map((p, idx) => (
                    <option key={p.id || idx} value={idx}>
                      Page {idx + 1} of {totalPages} {p.title ? `— ${p.title}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="admin-btn-secondary nav-arrow-btn"
                onClick={() => handleSelectPage(currentPageIndex + 1)}
                disabled={currentPageIndex >= totalPages - 1 || loading}
                title="Go to next page"
              >
                Next ▶
              </button>

              <button
                type="button"
                className={`admin-btn-secondary ${tocOpen ? 'active' : ''}`}
                onClick={() => setTocOpen(!tocOpen)}
                title="Toggle Table of Contents drawer"
              >
                📑 Pages ({totalPages})
              </button>
            </div>

            {/* Page Structure Controls */}
            <div className="page-action-group">
              <button
                type="button"
                className="brass-btn page-action-btn"
                onClick={handleAddPage}
                disabled={loading || saving}
                title="Add a new blank page to this notebook"
              >
                ➕ Add Page
              </button>
              <button
                type="button"
                className="admin-btn-danger page-action-btn"
                onClick={handleDeletePage}
                disabled={totalPages <= 1 || loading || saving}
                title="Delete current page"
              >
                🗑 Delete Page
              </button>
            </div>
          </div>

          {/* Table of Contents Drawer */}
          {tocOpen && notebook && (
            <div className="godmode-toc-drawer">
              <div className="toc-drawer-header">
                <h4>📑 Table of Contents</h4>
                <button
                  type="button"
                  className="admin-btn-clear"
                  onClick={() => setTocOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="toc-drawer-list">
                {notebook.pages.map((p, idx) => {
                  const plainSnippet = (p.html || '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 70);
                  const isCurrent = idx === currentPageIndex;

                  return (
                    <div
                      key={p.id || idx}
                      className={`toc-drawer-item ${isCurrent ? 'active' : ''}`}
                      onClick={() => handleSelectPage(idx)}
                    >
                      <div className="toc-item-top">
                        <strong>Page {idx + 1}</strong>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {p.id}
                        </span>
                      </div>
                      <div className="toc-item-snippet">
                        {plainSnippet || <em className="text-muted">Empty page</em>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rich-Text Formatting Toolbar (Visible in Edit Mode) */}
          {editMode && (
            <div className="godmode-format-toolbar">
              {/* Typography Group */}
              <div className="format-group">
                <select
                  value={pageFont}
                  onChange={(e) => {
                    setPageFont(e.target.value);
                    setIsDirty(true);
                  }}
                  className="admin-select font-family-select"
                  title="Select Page Font Family"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <select
                  value={pageFontSize}
                  onChange={(e) => {
                    setPageFontSize(e.target.value);
                    setIsDirty(true);
                  }}
                  className="admin-select font-size-select"
                  title="Select Page Font Size"
                >
                  {FONT_SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              <div className="format-divider" />

              {/* Basic Formatting */}
              <div className="format-group">
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('bold')}
                  title="Bold (Ctrl+B)"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('italic')}
                  title="Italic (Ctrl+I)"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('underline')}
                  title="Underline (Ctrl+U)"
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('strikeThrough')}
                  title="Strikethrough"
                >
                  <s>S</s>
                </button>
              </div>

              <div className="format-divider" />

              {/* Headings & Blocks */}
              <div className="format-group">
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('formatBlock', '<h1>')}
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('formatBlock', '<h2>')}
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('formatBlock', '<h3>')}
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('formatBlock', '<p>')}
                  title="Normal Paragraph"
                >
                  P
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('formatBlock', '<blockquote>')}
                  title="Blockquote"
                >
                  ❝
                </button>
              </div>

              <div className="format-divider" />

              {/* Lists & Alignment */}
              <div className="format-group">
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('insertUnorderedList')}
                  title="Bulleted List"
                >
                  • List
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('insertOrderedList')}
                  title="Numbered List"
                >
                  1. List
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('justifyLeft')}
                  title="Align Left"
                >
                  ⇤
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('justifyCenter')}
                  title="Align Center"
                >
                  ≡
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('justifyRight')}
                  title="Align Right"
                >
                  ⇥
                </button>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('insertHorizontalRule')}
                  title="Insert Horizontal Divider"
                >
                  ―
                </button>
              </div>

              <div className="format-divider" />

              {/* Color Swatches */}
              <div className="format-group format-colors">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    className="color-swatch-dot"
                    style={{ backgroundColor: c.color }}
                    onClick={() => executeCommand('foreColor', c.color)}
                    title={`Color: ${c.label}`}
                  />
                ))}
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => executeCommand('removeFormat')}
                  title="Clear formatting"
                >
                  🧹 Clear
                </button>
              </div>

              <div className="format-divider" />

              {/* Raw HTML Code Toggle */}
              <div className="format-group">
                <button
                  type="button"
                  className={`format-btn ${sourceCodeMode ? 'active' : ''}`}
                  onClick={() => setSourceCodeMode(!sourceCodeMode)}
                  title="Toggle raw HTML source code editor"
                >
                  &lt;/&gt; HTML Source
                </button>
              </div>
            </div>
          )}

          {/* Page Rendering Area */}
          <div className="godmode-page-canvas-wrapper">
            {loading ? (
              <div className="godmode-loading-card">
                <div className="loading-spinner" />
                <p>Decrypting user vault and retrieving page contents...</p>
              </div>
            ) : !notebook ? (
              <div className="godmode-error-card">
                <p>No notebook data available.</p>
                <button type="button" className="brass-btn" onClick={loadNotebook}>
                  Try Decrypting Again
                </button>
              </div>
            ) : (
              <div
                className="godmode-parchment-sheet"
                style={{
                  fontFamily: pageFont,
                  fontSize: pageFontSize,
                }}
              >
                <div className="parchment-header-stamp">
                  <span className="stamp-notebook-title">{notebook.title}</span>
                  <span className="stamp-page-num">PAGE {currentPageIndex + 1}</span>
                </div>

                {/* Read Mode: Faithful Rendered HTML */}
                {!editMode && (
                  <div
                    className="godmode-rendered-html leather-page-content"
                    dangerouslySetInnerHTML={{ __html: pageHtml || '<p class="text-muted"><em>Empty page</em></p>' }}
                  />
                )}

                {/* Edit Mode: Rich WYSIWYG ContentEditable */}
                {editMode && !sourceCodeMode && (
                  <div
                    ref={editorRef}
                    className="godmode-editable-html leather-page-content"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    onBlur={handleEditorInput}
                    style={{ minHeight: '420px', outline: 'none' }}
                  />
                )}

                {/* Edit Mode: Raw HTML Source Code Editor */}
                {editMode && sourceCodeMode && (
                  <div className="godmode-source-editor-wrap">
                    <div className="source-editor-header">
                      <span>HTML Source Editor (Raw Markup)</span>
                    </div>
                    <textarea
                      value={pageHtml}
                      onChange={handleSourceChange}
                      className="godmode-source-textarea"
                      placeholder="Enter raw page HTML markup..."
                      rows={18}
                      spellCheck={false}
                    />
                  </div>
                )}

                <div className="parchment-footer-stamp">
                  <span>Vault ID: {notebook.id}</span>
                  <span>Owner: {notebook.owner}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGodModeModal;
