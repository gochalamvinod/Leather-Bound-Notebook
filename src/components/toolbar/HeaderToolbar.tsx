import React, { useState, useRef } from 'react';
import TypographyControls from './TypographyControls';
import ColorSwatches from './ColorSwatches';
import EmojiPicker from './EmojiPicker';
import SaveStatusIndicator from './SaveStatusIndicator';
import { UserMenuPopover } from './UserMenuPopover';
import { MobileNavigationDrawer } from '../modals/MobileNavigationDrawer';
import { CoverTheme } from '../../types/notebook';

export interface HeaderToolbarProps {
  activeBookTitle?: string;
  activeCoverTheme?: CoverTheme;
  currentUser?: string | null;
  currentTier?: 'classic' | 'premium' | 'ultimate';
  isAdmin?: boolean;
  activeFont?: string;
  activeFontSize?: string;
  textColor?: string;
  highlightColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  activeAlignment?: string;
  onFontChange: (font: string) => void;
  onFontSizeChange: (fontSize: string) => void;
  onFormatCommand: (command: string, value?: string) => void;
  onTextColorChange: (color: string) => void;
  onHighlightColorChange: (color: string) => void;
  onCoverThemeChange?: (theme: CoverTheme) => void;
  onSelectEmoji: (emoji: string) => void;
  onImageUpload?: (file: File) => void;
  onMediaUpload?: (file: File) => void;
  onDocumentUpload?: (file: File) => void;
  onInsertLink?: () => void;
  onOpenSearchEmbed?: () => void;
  onOpenBookshelf: () => void;
  onOpenSettings: () => void;
  onOpenAdmin?: () => void;
  onOpenUpgrade?: () => void;
  onLock: () => void;
  className?: string;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  activeBookTitle = 'Leatherbound Notebook',
  activeCoverTheme = 'green',
  currentUser = null,
  currentTier = 'classic',
  isAdmin = false,
  activeFont,
  activeFontSize,
  textColor,
  highlightColor,
  isBold,
  isItalic,
  isUnderline,
  activeAlignment,
  onFontChange,
  onFontSizeChange,
  onFormatCommand,
  onTextColorChange,
  onHighlightColorChange,
  onCoverThemeChange,
  onSelectEmoji,
  onImageUpload,
  onMediaUpload,
  onDocumentUpload,
  onInsertLink,
  onOpenSearchEmbed,
  onOpenBookshelf,
  onOpenSettings,
  onOpenAdmin,
  onOpenUpgrade,
  onLock,
  className = '',
}) => {
  const [isEmojiOpen, setIsEmojiOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaFileInputRef = useRef<HTMLInputElement | null>(null);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const toolbarRef = useRef<HTMLElement | null>(null);

  const handleEmojiSelect = (emoji: string) => {
    onSelectEmoji(emoji);
    setIsEmojiOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onMediaUpload) {
      onMediaUpload(file);
    }
    if (mediaFileInputRef.current) {
      mediaFileInputRef.current.value = '';
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onDocumentUpload) {
      onDocumentUpload(file);
    }
    if (docFileInputRef.current) {
      docFileInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    if (toolbarRef.current) {
      toolbarRef.current.scrollLeft = 0;
    }
  }, [activeBookTitle]);

  const displayTitle = React.useMemo(() => {
    let t = (activeBookTitle || 'My Notebook').trim();
    t = t.replace(/^(admin_|default_)+/gi, '');
    if (currentUser) {
      const cleanU = currentUser.toLowerCase().trim();
      while (t.toLowerCase().startsWith(`${cleanU}_`)) {
        t = t.slice(cleanU.length + 1).trim();
      }
    }
    return t || 'My Notebook';
  }, [activeBookTitle, currentUser]);

  return (
    <>
      <header
        ref={toolbarRef}
        className={`toolbar nb-header-toolbar ${className}`}
        role="toolbar"
        aria-label="Editor toolbar"
      >
        {/* 0. Hamburger Menu Button (Three Lines ☰) */}
        <button
          type="button"
          id="hamburgerMenuBtn"
          className="hamburger-menu-btn"
          onClick={() => setIsMobileDrawerOpen(true)}
          title="Open Vault Menu (☰)"
          aria-label="Open Navigation Menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        {/* 1. Bookshelf Trigger Button */}
        <div className="bookshelf-wrapper">
          <button
            type="button"
            id="bookshelfBtn"
            className="bookshelf-trigger-btn"
            onClick={onOpenBookshelf}
            title="Open Library Bookshelf"
            aria-label="Bookshelf"
          >
            <span className="bookshelf-book-icon">📚</span>
            <span id="currentBookTitle" className="current-book-title">
              {displayTitle}
            </span>
            <span className="bookshelf-caret">▾</span>
          </button>
        </div>

        {/* 2. Typography Controls (Font, Size, B/I/U, Alignment, Lists) */}
        <TypographyControls
          activeFont={activeFont}
          activeFontSize={activeFontSize}
          onFontChange={onFontChange}
          onFontSizeChange={onFontSizeChange}
          onFormatCommand={onFormatCommand}
          isBold={isBold}
          isItalic={isItalic}
          isUnderline={isUnderline}
          activeAlignment={activeAlignment}
        />

        {/* 3. Color & Highlighter Swatches */}
        <ColorSwatches
          textColor={textColor}
          highlightColor={highlightColor}
          onTextColorChange={onTextColorChange}
          onHighlightColorChange={onHighlightColorChange}
        />

        {/* 4. Media & Document Tools */}
        <div className="tool-group">
          <input
            ref={imageFileInputRef}
            type="file"
            id="imageFile"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <button
            type="button"
            id="imageBtn"
            className="icon-btn"
            onClick={() => imageFileInputRef.current?.click()}
            title="Insert Image"
            aria-label="Insert Image"
          >
            🖼
          </button>

          <input
            ref={mediaFileInputRef}
            type="file"
            id="videoFile"
            accept="video/*,audio/*,.mp4,.webm,.mov,.mp3,.wav,.ogg,.m4a,.flac"
            style={{ display: 'none' }}
            onChange={handleMediaChange}
          />
          <button
            type="button"
            id="videoBtn"
            className="icon-btn"
            onClick={() => mediaFileInputRef.current?.click()}
            title="Upload Video / Audio"
            aria-label="Upload Media"
          >
            🎬
          </button>

          <input
            ref={docFileInputRef}
            type="file"
            id="docFile"
            accept=".xlsx,.xls,.csv,.docx,.doc,.pptx,.ppt,.pdf,.txt,.md,.json,.js,.ts,.tsx,.jsx,.py,.c,.cpp,.h,.hpp,.java,.rs,.go,.sql,.html,.css,.scss,.yaml,.yml,.sh,.xml"
            style={{ display: 'none' }}
            onChange={handleDocChange}
          />
          <button
            type="button"
            id="docBtn"
            className="icon-btn"
            onClick={() => docFileInputRef.current?.click()}
            title="Insert Document / PDF / Excel / PPT / Word / Code"
            aria-label="Insert Document"
          >
            📄
          </button>

          {onInsertLink && (
            <button
              type="button"
              id="linkBtn"
              className="icon-btn"
              onClick={onInsertLink}
              title="Insert Link or Live Web Embed"
              aria-label="Insert Link"
            >
              🔗
            </button>
          )}

          {onOpenSearchEmbed && (
            <button
              type="button"
              id="searchEmbedBtn"
              className="icon-btn"
              onClick={onOpenSearchEmbed}
              title="DuckDuckGo Search & Live Embed"
              aria-label="Search and Embed"
            >
              🔍
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              id="emojiBtn"
              className={`icon-btn ${isEmojiOpen ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsEmojiOpen((prev) => !prev);
              }}
              title="Insert Emoji"
              aria-label="Insert Emoji"
            >
              😀
            </button>
            <EmojiPicker
              isOpen={isEmojiOpen}
              onClose={() => setIsEmojiOpen(false)}
              onSelectEmoji={handleEmojiSelect}
            />
          </div>
        </div>

        {/* 5. Right Group: Save Status, User Badge with Popover, Admin Button, Settings, Lock */}
        <div className="tool-group right">
          <SaveStatusIndicator />

          {currentUser && (
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                type="button"
                id="currentUserBadge"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="current-user-badge"
                title={`Signed in as ${currentUser} (${
                  currentTier === 'ultimate'
                    ? 'Ultimate Sovereign'
                    : currentTier === 'premium'
                    ? 'Guild Master'
                    : 'Classic Scribe'
                }) — Click for account menu`}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="dialog"
              >
                <span className="user-icon">
                  {currentTier === 'ultimate' ? '⚡' : currentTier === 'premium' ? '👑' : '👤'}
                </span>
                <span id="currentUserName">{currentUser}</span>
                <span
                  className={`tier-pill-badge ${
                    currentTier === 'ultimate'
                      ? 'tier-pill-ultimate'
                      : currentTier === 'premium'
                      ? 'tier-pill-vip'
                      : 'tier-pill-free'
                  }`}
                >
                  {currentTier === 'ultimate' ? 'Ultimate' : currentTier === 'premium' ? 'VIP' : 'Free'}
                </span>
                <span className="user-badge-caret">▾</span>
              </button>

              {/* Proper User Profile & Membership Popover */}
              <UserMenuPopover
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                currentUser={currentUser}
                currentTier={currentTier}
                isAdmin={isAdmin}
                onOpenUpgrade={onOpenUpgrade || (() => {})}
                onOpenBookshelf={onOpenBookshelf}
                onOpenSettings={onOpenSettings}
                onOpenAdmin={onOpenAdmin}
                onLock={onLock}
              />
            </div>
          )}

          {isAdmin && (
            <button
              type="button"
              id="adminBtn"
              onClick={onOpenAdmin}
              title="Admin Dashboard"
              className="admin-toolbar-btn"
            >
              <span>👑</span>
              <span>Admin</span>
            </button>
          )}

          <button
            type="button"
            id="settingsBtn"
            className="icon-btn"
            onClick={onOpenSettings}
            title="Settings & Password Change"
            aria-label="Settings"
          >
            ⚙
          </button>

          <button
            type="button"
            id="lockBtn"
            className="icon-btn nb-lock-btn"
            onClick={onLock}
            title="Lock Notebook Vault"
            aria-label="Lock Vault"
          >
            🔒
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer (Three Lines Menu ☰) */}
      <MobileNavigationDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeBookTitle={activeBookTitle}
        activeCoverTheme={activeCoverTheme}
        currentUser={currentUser}
        currentTier={currentTier}
        isAdmin={isAdmin}
        onOpenBookshelf={onOpenBookshelf}
        onOpenSettings={onOpenSettings}
        onOpenAdmin={onOpenAdmin}
        onOpenUpgrade={onOpenUpgrade}
        onCoverThemeChange={onCoverThemeChange}
        onLock={onLock}
        onImageClick={() => imageFileInputRef.current?.click()}
        onVideoClick={() => mediaFileInputRef.current?.click()}
        onDocClick={() => docFileInputRef.current?.click()}
        onLinkClick={onInsertLink}
        onSearchClick={onOpenSearchEmbed}
      />
    </>
  );
};

export default HeaderToolbar;
