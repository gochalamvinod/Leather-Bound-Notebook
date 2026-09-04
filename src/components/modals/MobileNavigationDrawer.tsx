import React, { useEffect } from 'react';
import { CoverTheme } from '../../types/notebook';
import { TierConfig, TIER_CONFIGS } from '../../lib/tiers';
import LeatherboundLogo from '../ui/LeatherboundLogo';

export interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeBookTitle: string;
  activeCoverTheme: CoverTheme;
  currentUser: string | null;
  currentTier: 'classic' | 'premium' | 'ultimate';
  tierConfig?: TierConfig;
  isAdmin?: boolean;
  booksCount?: number;
  storageUsedBytes?: number;
  onOpenProfile?: () => void;
  onOpenBookshelf: () => void;
  onOpenSettings: () => void;
  onOpenAdmin?: () => void;
  onOpenUpgrade?: () => void;
  onCoverThemeChange?: (theme: CoverTheme) => void;
  onLock: () => void;
  onImageClick?: () => void;
  onVideoClick?: () => void;
  onDocClick?: () => void;
  onLinkClick?: () => void;
  onSearchClick?: () => void;
}

const THEME_SWATCHES: Array<{ value: CoverTheme; label: string; color: string }> = [
  { value: 'green', label: 'Emerald Pine', color: '#10b981' },
  { value: 'brown', label: 'Classic Brown', color: '#b45309' },
  { value: 'navy', label: 'Midnight Navy', color: '#3b82f6' },
  { value: 'burgundy', label: 'Royal Burgundy', color: '#be123c' },
  { value: 'black', label: 'Obsidian Noir', color: '#374151' },
];

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeBookTitle,
  activeCoverTheme,
  currentUser,
  currentTier,
  tierConfig: customTierConfig,
  isAdmin = false,
  booksCount = 1,
  storageUsedBytes = 0,
  onOpenProfile,
  onOpenBookshelf,
  onOpenSettings,
  onOpenAdmin,
  onOpenUpgrade,
  onCoverThemeChange,
  onLock,
  onImageClick,
  onVideoClick,
  onDocClick,
  onLinkClick,
  onSearchClick,
}) => {
  const tierConfig = customTierConfig || TIER_CONFIGS[currentTier] || TIER_CONFIGS.classic;
  const isUltimate = currentTier === 'ultimate';
  const isPremium = currentTier === 'premium';

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const usedMB = (storageUsedBytes / (1024 * 1024)).toFixed(1);
  const maxStorageStr = isUltimate
    ? '10 TB (Infinite)'
    : (tierConfig.maxTotalStorageBytes / (1024 * 1024 * 1024)).toFixed(0) + ' GB';

  return (
    <div className="mobile-drawer-root">
      {/* Backdrop Overlay */}
      <div className="mobile-drawer-backdrop" onClick={onClose} />

      {/* Drawer Card */}
      <aside className="mobile-drawer-panel" role="dialog" aria-label="Mobile Navigation Menu">
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LeatherboundLogo size={36} />
            <div>
              <h2 className="mobile-drawer-title">LEATHERBOUND</h2>
              <span className="mobile-drawer-subtitle">PRIVATE VAULT ARCHIVE</span>
            </div>
          </div>
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={onClose}
            title="Close menu"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-drawer-scrollable">
          {/* User Account Card */}
          {currentUser && (
            <div className="mobile-user-card">
              <div className="mobile-user-card-top">
                <div className="mobile-user-avatar">
                  <span>{isUltimate ? '⚡' : isPremium ? '👑' : '👤'}</span>
                </div>
                <div className="mobile-user-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong className="mobile-user-name">{currentUser}</strong>
                    {isAdmin && <span className="mobile-admin-badge">ADMIN</span>}
                  </div>
                  <span
                    className={`tier-pill-badge ${
                      isUltimate ? 'tier-pill-ultimate' : isPremium ? 'tier-pill-vip' : 'tier-pill-free'
                    }`}
                  >
                    {isUltimate ? '⚡ Ultimate Sovereign' : isPremium ? '👑 Guild Master (VIP)' : '📜 Classic Scribe'}
                  </span>
                </div>
              </div>

              {/* Quick Quota Info */}
              <div className="mobile-user-quota">
                <div className="mobile-quota-row">
                  <span>Vault Storage:</span>
                  <strong>{usedMB} MB / {maxStorageStr}</strong>
                </div>
                <div className="mobile-quota-row">
                  <span>Books:</span>
                  <strong>{booksCount} / {isUltimate ? '∞' : isPremium ? '100' : '5'}</strong>
                </div>
              </div>

              {onOpenUpgrade && (
                <button
                  type="button"
                  className="mobile-upgrade-btn"
                  onClick={() => {
                    onClose();
                    onOpenUpgrade();
                  }}
                >
                  <span>🔑</span>
                  <span>{isUltimate ? 'View Ultimate Membership' : 'Redeem License Key / Upgrade'}</span>
                </button>
              )}

              {onOpenProfile && (
                <button
                  type="button"
                  className="mobile-profile-btn"
                  onClick={() => {
                    onClose();
                    onOpenProfile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    marginTop: '8px',
                    background: 'rgba(184, 147, 90, 0.12)',
                    border: '1px solid rgba(184, 147, 90, 0.35)',
                    borderRadius: '7px',
                    color: 'var(--brass-bright, #e6c88b)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span>👤</span>
                  <span>User Profile &amp; Account</span>
                </button>
              )}
            </div>
          )}

          {/* Active Book Card */}
          <div className="mobile-active-book-card">
            <div className="mobile-section-label">CURRENT NOTEBOOK</div>
            <button
              type="button"
              className="mobile-book-selector-btn"
              onClick={() => {
                onClose();
                onOpenBookshelf();
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.4rem' }}>📚</span>
                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                  <strong className="mobile-active-book-title">{activeBookTitle}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Tap to open library bookshelf</div>
                </div>
              </div>
              <span style={{ fontSize: '1.1rem', color: 'var(--brass-highlight, #f0dfa8)' }}>›</span>
            </button>
          </div>

          {/* Media & Insert Quick Tools */}
          <div className="mobile-tools-section">
            <div className="mobile-section-label">INSERT & ATTACH</div>
            <div className="mobile-tools-grid">
              {onImageClick && (
                <button
                  type="button"
                  className="mobile-tool-tile"
                  onClick={() => {
                    onClose();
                    onImageClick();
                  }}
                >
                  <span className="mobile-tool-icon">🖼️</span>
                  <span className="mobile-tool-name">Image</span>
                </button>
              )}
              {onVideoClick && (
                <button
                  type="button"
                  className="mobile-tool-tile"
                  onClick={() => {
                    onClose();
                    onVideoClick();
                  }}
                >
                  <span className="mobile-tool-icon">🎬</span>
                  <span className="mobile-tool-name">Video</span>
                </button>
              )}
              {onDocClick && (
                <button
                  type="button"
                  className="mobile-tool-tile"
                  onClick={() => {
                    onClose();
                    onDocClick();
                  }}
                >
                  <span className="mobile-tool-icon">📄</span>
                  <span className="mobile-tool-name">Doc / PDF</span>
                </button>
              )}
              {onLinkClick && (
                <button
                  type="button"
                  className="mobile-tool-tile"
                  onClick={() => {
                    onClose();
                    onLinkClick();
                  }}
                >
                  <span className="mobile-tool-icon">🔗</span>
                  <span className="mobile-tool-name">Web Link</span>
                </button>
              )}
              {onSearchClick && (
                <button
                  type="button"
                  className="mobile-tool-tile"
                  onClick={() => {
                    onClose();
                    onSearchClick();
                  }}
                >
                  <span className="mobile-tool-icon">🔍</span>
                  <span className="mobile-tool-name">Search</span>
                </button>
              )}
            </div>
          </div>

          {/* Cover Theme Selector */}
          {onCoverThemeChange && (
            <div className="mobile-theme-section">
              <div className="mobile-section-label">LEATHER COVER THEME</div>
              <div className="mobile-theme-swatches">
                {THEME_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.value}
                    type="button"
                    className={`mobile-theme-swatch ${activeCoverTheme === swatch.value ? 'active' : ''}`}
                    style={{ background: swatch.color }}
                    onClick={() => onCoverThemeChange(swatch.value)}
                    title={swatch.label}
                  >
                    {activeCoverTheme === swatch.value && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="mobile-nav-links-section">
            <div className="mobile-section-label">VAULT NAVIGATION</div>

            <button
              type="button"
              className="mobile-nav-link-btn"
              onClick={() => {
                onClose();
                onOpenBookshelf();
              }}
            >
              <span>📚</span>
              <span>Library Bookshelf</span>
            </button>

            {isAdmin && onOpenAdmin && (
              <button
                type="button"
                className="mobile-nav-link-btn mobile-nav-link-admin"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
              >
                <span>👑</span>
                <span>Master Admin Portal</span>
              </button>
            )}

            <button
              type="button"
              className="mobile-nav-link-btn"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
            >
              <span>⚙️</span>
              <span>Vault Settings & Security</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer Lock Button */}
        <div className="mobile-drawer-footer">
          <button
            type="button"
            className="mobile-drawer-lock-btn"
            onClick={() => {
              onClose();
              onLock();
            }}
          >
            <span>🔒</span>
            <span>Lock Notebook Vault</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default MobileNavigationDrawer;
