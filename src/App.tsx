import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VaultProvider, useVault } from './context/VaultContext';
import { EditorProvider, useEditor } from './context/EditorContext';
import LockScreen from './components/auth/LockScreen';
import BookshelfModal from './components/modals/BookshelfModal';
import NewBookModal from './components/modals/NewBookModal';
import SettingsDrawer from './components/modals/SettingsDrawer';
import HeaderToolbar from './components/toolbar/HeaderToolbar';
import BookRoom from './components/book/BookRoom';
import ImageOverlay from './components/media/ImageOverlay';
import MediaUploadToast from './components/media/MediaUploadToast';
import SearchEmbedModal from './components/embeds/SearchEmbedModal';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import ProfileModal from './components/modals/ProfileModal';
import { PageData, CoverTheme } from './types/notebook';
import {
  DEFAULT_FONT,
  DEFAULT_FONT_SIZE,
  restoreSelection,
  saveSelection,
  execFormat,
  setTextColor,
  setHighlightColor,
  setFontName,
  setFontSize,
  insertTextAtSelection,
  insertHtmlAtSelection,
  insertImageAtSelection,
  isCommandActive,
} from './lib/editor/richText';
import {
  buildUrlInsertHTML,
  buildPreviewCardHTML,
} from './lib/editor/linkClassifier';
import {
  uploadImageFile,
  uploadLargeMediaFile,
  extractVideoPoster,
} from './lib/editor/imageResizer';
import { processUploadedFileToHTML } from './lib/editor/documentEmbeds';
import { TierConfig, TIER_CONFIGS, getTierConfig } from './lib/tiers';
import UpgradeModal from './components/modals/UpgradeModal';
import BookTransitionOverlay, { TransitionType } from './components/transitions/BookTransitionOverlay';

const NotebookWorkspace: React.FC = () => {
  const { isUnlocked, loading, lock, currentUser, isAdmin } = useAuth();
  const { activeBook, books, updateActiveBook, renameBook } = useVault();
  const { scheduleAutosave } = useEditor();

  const [transitionState, setTransitionState] = useState<{
    active: boolean;
    type: TransitionType;
    resumePageIndex?: number;
  } | null>(null);

  const prevUnlockedRef = useRef<boolean>(isUnlocked);

  useEffect(() => {
    if (!prevUnlockedRef.current && isUnlocked) {
      setTransitionState({
        active: true,
        type: 'open-resume',
        resumePageIndex: 2,
      });
    }
    prevUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  const [userTier, setUserTier] = useState<'classic' | 'premium' | 'ultimate'>('classic');
  const [tierConfig, setTierConfig] = useState<TierConfig>(TIER_CONFIGS.classic);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);
  const [upgradeLimitReason, setUpgradeLimitReason] = useState<'max_books' | 'max_pages' | 'max_video' | 'max_storage' | null>(null);
  const [storageUsedBytes, setStorageUsedBytes] = useState<number>(0);

  const [isBookshelfOpen, setIsBookshelfOpen] = useState<boolean>(false);
  const [isNewBookOpen, setIsNewBookOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isSearchEmbedOpen, setIsSearchEmbedOpen] = useState<boolean>(false);

  const [activeOverlayElement, setActiveOverlayElement] = useState<HTMLElement | null>(null);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    title: string;
    percent: number;
    statsText: string;
    icon: string;
    phase: string;
    eta: string;
    startTime: number;
  }>({
    isOpen: false,
    title: 'Uploading...',
    percent: 0,
    statsText: '0%',
    icon: '📼',
    phase: '',
    eta: '',
    startTime: 0,
  });

  const toastCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [activeFont, setActiveFont] = useState<string>(DEFAULT_FONT);
  const [activeFontSize, setActiveFontSize] = useState<string>(DEFAULT_FONT_SIZE);
  const [textColor, setTextColorState] = useState<string>('#2c2416');
  const [highlightColor, setHighlightColorState] = useState<string>('#f6e27a');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [activeAlignment, setActiveAlignment] = useState<string>('justifyLeft');
  const [activePageId, setActivePageId] = useState<string | null>(null);

  const refreshFormatState = useCallback(() => {
    setIsBold(isCommandActive('bold'));
    setIsItalic(isCommandActive('italic'));
    setIsUnderline(isCommandActive('underline'));
    if (isCommandActive('justifyCenter')) {
      setActiveAlignment('justifyCenter');
    } else if (isCommandActive('justifyRight')) {
      setActiveAlignment('justifyRight');
    } else {
      setActiveAlignment('justifyLeft');
    }
  }, []);

  const handleActiveSlotPageChange = useCallback((page: PageData | null) => {
    if (page) {
      setActivePageId(page.id);
      if (page.font) setActiveFont(page.font);
      if (page.fontSize) setActiveFontSize(page.fontSize);
    }
  }, []);

  const handleFontChange = useCallback(
    (font: string) => {
      setActiveFont(font);
      restoreSelection();
      setFontName(font);
      if (activeBook && activePageId) {
        const updatedPages = activeBook.pages.map((p) =>
          p.id === activePageId ? { ...p, font, updatedAt: new Date().toISOString() } : p
        );
        const updatedBook = { ...activeBook, pages: updatedPages, updatedAt: new Date().toISOString() };
        updateActiveBook(() => updatedBook);
        scheduleAutosave(updatedBook);
      }
    },
    [activeBook, activePageId, updateActiveBook, scheduleAutosave]
  );

  const handleFontSizeChange = useCallback(
    (size: string) => {
      setActiveFontSize(size);
      restoreSelection();
      setFontSize(size);
      if (activeBook && activePageId) {
        const updatedPages = activeBook.pages.map((p) =>
          p.id === activePageId ? { ...p, fontSize: size, updatedAt: new Date().toISOString() } : p
        );
        const updatedBook = { ...activeBook, pages: updatedPages, updatedAt: new Date().toISOString() };
        updateActiveBook(() => updatedBook);
        scheduleAutosave(updatedBook);
      }
    },
    [activeBook, activePageId, updateActiveBook, scheduleAutosave]
  );

  const handleFormatCommand = useCallback(
    (command: string, value?: string) => {
      restoreSelection();
      execFormat(command, value);
      refreshFormatState();
      scheduleAutosave();
    },
    [refreshFormatState, scheduleAutosave]
  );

  const handleTextColorChange = useCallback(
    (color: string) => {
      setTextColorState(color);
      restoreSelection();
      setTextColor(color);
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  const handleHighlightColorChange = useCallback(
    (color: string) => {
      setHighlightColorState(color);
      restoreSelection();
      setHighlightColor(color);
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  const handleSelectEmoji = useCallback(
    (emoji: string) => {
      restoreSelection();
      insertTextAtSelection(emoji);
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  // Toast progress handlers
  const handleMediaUploadStart = useCallback((title: string, icon: string = '📼') => {
    if (toastCloseTimerRef.current) {
      clearTimeout(toastCloseTimerRef.current);
      toastCloseTimerRef.current = null;
    }
    setToastState({
      isOpen: true,
      title,
      percent: 0,
      statsText: '0% (0 MB)',
      icon,
      phase: 'Uploading to server…',
      eta: 'Estimating…',
      startTime: Date.now(),
    });
  }, []);

  const handleMediaUploadProgress = useCallback(
    (percent: number, loadedMB: string, totalMB: string) => {
      setToastState((prev) => {
        const elapsed = (Date.now() - prev.startTime) / 1000;
        let eta = 'Estimating…';
        const totalMbNum = parseFloat(totalMB) || 0;
        const totalChunksEst = Math.max(1, Math.ceil(totalMbNum / 6));
        const currentChunkEst = Math.min(totalChunksEst, Math.max(1, Math.ceil((percent / 100) * totalChunksEst)));

        let phase = `Sharding into 5-8MB chunks (${currentChunkEst}/${totalChunksEst})…`;

        if (percent > 0 && percent < 100 && elapsed > 0.5) {
          const totalEstSec = (elapsed / percent) * 100;
          const remainSec = Math.max(0, totalEstSec - elapsed);
          if (remainSec < 60) {
            eta = `~${Math.ceil(remainSec)}s remaining`;
          } else {
            const mins = Math.floor(remainSec / 60);
            const secs = Math.ceil(remainSec % 60);
            eta = `~${mins}m ${secs}s remaining`;
          }
        }

        if (percent >= 100) {
          phase = 'Encrypting chunks & generating HLS stream playlist…';
          eta = 'Finalizing stream…';
        }

        return {
          ...prev,
          isOpen: true,
          percent,
          statsText: `${percent}% (${loadedMB} MB / ${totalMB} MB) • Chunk ${currentChunkEst}/${totalChunksEst}`,
          phase,
          eta,
        };
      });
    },
    []
  );

  const handleMediaUploadEnd = useCallback(() => {
    setToastState((prev) => ({
      ...prev,
      percent: 100,
      phase: '✓ Processing complete',
      eta: 'Done',
    }));
    if (toastCloseTimerRef.current) {
      clearTimeout(toastCloseTimerRef.current);
    }
    toastCloseTimerRef.current = setTimeout(() => {
      setToastState((prev) => ({ ...prev, isOpen: false }));
    }, 1500);
  }, []);

  // Toolbar Image Upload
  const handleToolbarImageUpload = useCallback(
    async (file: File) => {
      saveSelection();
      const isLarge = file.size > 5 * 1024 * 1024 || file.type === 'image/gif' || file.type === 'image/svg+xml';
      try {
        let url: string;
        if (isLarge) {
          handleMediaUploadStart(`Uploading ${file.name}...`, '🖼');
          const data = await uploadLargeMediaFile(file, (percent, loadedMB, totalMB) => {
            handleMediaUploadProgress(percent, loadedMB, totalMB);
          });
          url = data.url;
        } else {
          url = await uploadImageFile(file);
        }
        restoreSelection();
        insertImageAtSelection(url);
        scheduleAutosave();
      } catch (err: any) {
        alert('Could not add that image: ' + err.message);
      } finally {
        handleMediaUploadEnd();
      }
    },
    [handleMediaUploadStart, handleMediaUploadProgress, handleMediaUploadEnd, scheduleAutosave]
  );

  // Fetch user tier and quota stats on unlock
  useEffect(() => {
    if (isUnlocked && currentUser) {
      fetch('/api/user/tier')
        .then((r) => r.json())
        .then((data) => {
          if (data && data.ok) {
            const t = data.tier || 'classic';
            setUserTier(t);
            setTierConfig(getTierConfig(t));
            if (data.storageUsed) setStorageUsedBytes(data.storageUsed);
          }
        })
        .catch(() => {});
    }
  }, [isUnlocked, currentUser]);

  // Toolbar Video/Audio Upload
  const handleToolbarMediaUpload = useCallback(
    async (file: File) => {
      saveSelection();
      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name);
      const totalMBStr = (file.size / (1024 * 1024)).toFixed(1);

      // Check tier video size limit (200MB Classic, 2GB Premium)
      if (!isAudio && file.size > tierConfig.maxVideoSizeBytes) {
        setUpgradeLimitReason('max_video');
        setIsUpgradeOpen(true);
        return;
      }

      handleMediaUploadStart(
        `Uploading ${isAudio ? 'Audio' : 'Video'} (${totalMBStr} MB)...`,
        isAudio ? '🎵' : '🎬'
      );

      try {
        let posterDataUrl = '';
        if (!isAudio) {
          try {
            posterDataUrl = await extractVideoPoster(file);
          } catch {}
        }

        const data = await uploadLargeMediaFile(file, (percent, loadedMB, totalMB) => {
          handleMediaUploadProgress(percent, loadedMB, totalMB);
        });

        restoreSelection();
        if (data.isAudio || isAudio) {
          const audioHtml = `<div class="media-container audio-container" contenteditable="false"><audio class="vintage-audio" controls preload="metadata" src="${data.url}"></audio><div class="vintage-media-caption" contenteditable="true" placeholder="Add a caption..."></div></div><p><br></p>`;
          insertHtmlAtSelection(audioHtml);
        } else {
          const posterAttr = posterDataUrl ? ` poster="${posterDataUrl}"` : '';
          const videoHtml = `<div class="media-container video-container" contenteditable="false"><video class="vintage-video" controls playsinline preload="metadata"${posterAttr} src="${data.url}"></video><div class="vintage-media-caption" contenteditable="true" placeholder="Add a caption..."></div></div><p><br></p>`;
          insertHtmlAtSelection(videoHtml);
        }
        scheduleAutosave();
      } catch (err: any) {
        alert('Could not upload video/media: ' + err.message);
      } finally {
        handleMediaUploadEnd();
      }
    },
    [handleMediaUploadStart, handleMediaUploadProgress, handleMediaUploadEnd, scheduleAutosave]
  );

  // Toolbar Document / Excel / PPT / Word / Code Upload
  const handleToolbarDocumentUpload = useCallback(
    async (file: File) => {
      saveSelection();
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name);
      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name);
      const isImage = file.type.startsWith('image/');
      const icon = isImage ? '🖼' : isVideo ? '🎬' : isAudio ? '🎵' : '📄';
      const totalMBStr = (file.size / (1024 * 1024)).toFixed(1);

      handleMediaUploadStart(`Uploading ${file.name} (${totalMBStr} MB)...`, icon);

      try {
        const html = await processUploadedFileToHTML(file, (percent, loadedMB, totalMB) => {
          handleMediaUploadProgress(percent, loadedMB, totalMB);
        });
        restoreSelection();
        insertHtmlAtSelection(html);
        scheduleAutosave();
      } catch (err: any) {
        alert('Could not upload document: ' + err.message);
      } finally {
        handleMediaUploadEnd();
      }
    },
    [handleMediaUploadStart, handleMediaUploadProgress, handleMediaUploadEnd, scheduleAutosave]
  );

  // Toolbar Link / URL Insert
  const handleToolbarInsertLink = useCallback(async () => {
    saveSelection();
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    const hasSelection = !!(sel && !sel.isCollapsed);

    const url = window.prompt('Paste or type a URL to insert:');
    if (!url) return;
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      alert('Please enter a full URL starting with http:// or https://');
      return;
    }

    restoreSelection();
    if (hasSelection) {
      execFormat('createLink', trimmed);
    } else {
      try {
        const html = await buildUrlInsertHTML(trimmed);
        insertHtmlAtSelection(html);
      } catch (err) {
        const fallback = `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>`;
        insertHtmlAtSelection(fallback);
      }
    }
    scheduleAutosave();
  }, [scheduleAutosave]);

  // Search Modal Embed Handlers
  const handleInsertLiveEmbed = useCallback(
    async (url: string) => {
      restoreSelection();
      try {
        const html = await buildUrlInsertHTML(url);
        insertHtmlAtSelection(html);
        scheduleAutosave();
      } catch (err) {
        const fallback = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        insertHtmlAtSelection(fallback);
        scheduleAutosave();
      }
    },
    [scheduleAutosave]
  );

  const handleInsertLinkCard = useCallback(
    async (url: string) => {
      restoreSelection();
      try {
        const html = await buildPreviewCardHTML(url);
        insertHtmlAtSelection(html);
        scheduleAutosave();
      } catch (err) {
        const fallback = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        insertHtmlAtSelection(fallback);
        scheduleAutosave();
      }
    },
    [scheduleAutosave]
  );

  const handleCoverThemeChange = useCallback(
    (newTheme: CoverTheme) => {
      if (activeBook) {
        document.body.dataset.cover = newTheme;
        renameBook(activeBook.id, activeBook.title, newTheme);
      }
    },
    [activeBook, renameBook]
  );

  const handleLock = useCallback(() => {
    lock();
    setTransitionState({
      active: true,
      type: 'close',
    });
  }, [lock]);

  const handleTransitionComplete = useCallback(() => {
    setTransitionState(null);
  }, []);

  if (loading) {
    return (
      <div className="split-auth-viewport">
        <div className="split-loading-box" style={{ textAlign: 'center' }}>
          <div className="split-spinner" />
          <p style={{ color: '#d1fae5', marginTop: '14px', fontSize: '0.9rem', fontWeight: 600 }}>
            Opening private notebook vault...
          </p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <>
        <LockScreen />
        {transitionState?.active && (
          <BookTransitionOverlay
            type={transitionState.type}
            resumePageIndex={transitionState.resumePageIndex || 2}
            totalPages={activeBook?.pages?.length || 6}
            coverTheme={(activeBook?.coverColor as string) || 'green'}
            onComplete={handleTransitionComplete}
          />
        )}
      </>
    );
  }

  return (
    <div id="room" className="app">
      {/* Top Skeuomorphic Toolbar */}
      <HeaderToolbar
        activeBookTitle={activeBook?.title || 'Leatherbound Notebook'}
        activeCoverTheme={(activeBook?.coverColor as CoverTheme) || 'green'}
        currentUser={currentUser}
        currentTier={userTier}
        isAdmin={isAdmin}
        activeFont={activeFont}
        activeFontSize={activeFontSize}
        textColor={textColor}
        highlightColor={highlightColor}
        isBold={isBold}
        isItalic={isItalic}
        isUnderline={isUnderline}
        activeAlignment={activeAlignment}
        onFontChange={handleFontChange}
        onFontSizeChange={handleFontSizeChange}
        onFormatCommand={handleFormatCommand}
        onTextColorChange={handleTextColorChange}
        onHighlightColorChange={handleHighlightColorChange}
        onCoverThemeChange={handleCoverThemeChange}
        onSelectEmoji={handleSelectEmoji}
        onImageUpload={handleToolbarImageUpload}
        onMediaUpload={handleToolbarMediaUpload}
        onDocumentUpload={handleToolbarDocumentUpload}
        onInsertLink={handleToolbarInsertLink}
        onOpenSearchEmbed={() => setIsSearchEmbedOpen(true)}
        onOpenBookshelf={() => setIsBookshelfOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenUpgrade={() => {
          setUpgradeLimitReason(null);
          setIsUpgradeOpen(true);
        }}
        onLock={handleLock}
      />

      {/* Main 3D Book Workspace */}
      <BookRoom
        activeFont={activeFont}
        activeFontSize={activeFontSize}
        tierConfig={tierConfig}
        onPageLimitReached={() => {
          setUpgradeLimitReason('max_pages');
          setIsUpgradeOpen(true);
        }}
        onActiveSlotPageChange={handleActiveSlotPageChange}
        onImageClick={(el) => setActiveOverlayElement(el)}
        onMediaUploadStart={handleMediaUploadStart}
        onMediaUploadProgress={handleMediaUploadProgress}
        onMediaUploadEnd={handleMediaUploadEnd}
      />

      {/* 3D Golden Fountain Pen to Book Morphing Transition Overlay */}
      {transitionState?.active && (
        <BookTransitionOverlay
          type={transitionState.type}
          resumePageIndex={transitionState.resumePageIndex || 2}
          totalPages={activeBook?.pages?.length || 6}
          coverTheme={(activeBook?.coverColor as string) || 'green'}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Unified Resizable Media & Document Overlay */}
      {activeOverlayElement && (
        <ImageOverlay
          targetElement={activeOverlayElement}
          onDismiss={() => setActiveOverlayElement(null)}
          onResize={() => scheduleAutosave()}
          onDelete={() => {
            setActiveOverlayElement(null);
            scheduleAutosave();
          }}
          onUpdate={() => scheduleAutosave()}
          onCaptionEdit={() => scheduleAutosave()}
        />
      )}

      {/* Streaming Media Upload Progress Toast */}
      <MediaUploadToast
        isOpen={toastState.isOpen}
        title={toastState.title}
        progressPercent={toastState.percent}
        statsText={toastState.statsText}
        phase={toastState.phase}
        eta={toastState.eta}
        icon={toastState.icon}
        onCancel={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* DuckDuckGo Live Search & Embed Modal */}
      <SearchEmbedModal
        isOpen={isSearchEmbedOpen}
        onClose={() => setIsSearchEmbedOpen(false)}
        onEmbedLive={handleInsertLiveEmbed}
        onEmbedCard={handleInsertLinkCard}
      />

      {/* Modals & Drawers */}
      <BookshelfModal
        isOpen={isBookshelfOpen}
        onClose={() => setIsBookshelfOpen(false)}
        onOpenNewBook={() => {
          if (books.length >= tierConfig.maxBooks) {
            setUpgradeLimitReason('max_books');
            setIsUpgradeOpen(true);
            return;
          }
          setIsBookshelfOpen(false);
          setIsNewBookOpen(true);
        }}
      />

      <NewBookModal
        isOpen={isNewBookOpen}
        onClose={() => setIsNewBookOpen(false)}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Guild Master VIP Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => {
          setIsUpgradeOpen(false);
          setUpgradeLimitReason(null);
        }}
        currentTier={userTier}
        tierConfig={tierConfig}
        booksCount={books.length}
        activePagesCount={(activeBook?.pages || []).length}
        storageUsedBytes={storageUsedBytes}
        limitReason={upgradeLimitReason}
        onUpgradeSuccess={(newTier, newConfig) => {
          setUserTier(newTier);
          setTierConfig(newConfig);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <VaultProvider>
        <EditorProvider>
          <NotebookWorkspace />
        </EditorProvider>
      </VaultProvider>
    </AuthProvider>
  );
};

export default App;
