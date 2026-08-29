import React, { useRef, useEffect } from 'react';
import { TierConfig, TIER_CONFIGS } from '../../lib/tiers';

export interface UserMenuPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  currentTier: 'classic' | 'premium' | 'ultimate';
  tierConfig?: TierConfig;
  isAdmin?: boolean;
  booksCount?: number;
  storageUsedBytes?: number;
  onOpenUpgrade: () => void;
  onOpenBookshelf: () => void;
  onOpenSettings: () => void;
  onOpenAdmin?: () => void;
  onLock: () => void;
}

export const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentTier,
  tierConfig: customTierConfig,
  isAdmin = false,
  booksCount = 1,
  storageUsedBytes = 0,
  onOpenUpgrade,
  onOpenBookshelf,
  onOpenSettings,
  onOpenAdmin,
  onLock,
}) => {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const tierConfig = customTierConfig || TIER_CONFIGS[currentTier] || TIER_CONFIGS.classic;

  const isUltimate = currentTier === 'ultimate';
  const isPremium = currentTier === 'premium';

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const usedMB = (storageUsedBytes / (1024 * 1024)).toFixed(1);
  const maxStorageStr = isUltimate
    ? '10 TB (Infinite)'
    : (tierConfig.maxTotalStorageBytes / (1024 * 1024 * 1024)).toFixed(0) + ' GB';

  return (
    <div className="user-menu-popover" ref={popoverRef} role="dialog" aria-label="User Account Menu">
      {/* Popover Header Card */}
      <div className="user-popover-header">
        <div className="user-avatar-ring">
          <span className="user-avatar-icon">
            {isUltimate ? '⚡' : isPremium ? '👑' : '👤'}
          </span>
        </div>

        <div className="user-popover-info">
          <div className="user-popover-name-row">
            <span className="user-popover-username">{currentUser}</span>
            {isAdmin && <span className="user-popover-admin-tag">MASTER ADMIN</span>}
          </div>
          <div className="user-popover-tier-row">
            <span
              className={`tier-pill-badge ${
                isUltimate ? 'tier-pill-ultimate' : isPremium ? 'tier-pill-vip' : 'tier-pill-free'
              }`}
            >
              {isUltimate ? '⚡ Ultimate Sovereign' : isPremium ? '👑 Guild Master (VIP)' : '📜 Classic Scribe'}
            </span>
          </div>
        </div>
      </div>

      {/* Quota & Capacity Status Box */}
      <div className="user-popover-quota-box">
        <div className="user-quota-item">
          <span className="user-quota-label">Notebooks:</span>
          <span className="user-quota-value">
            {booksCount} <small>/ {isUltimate ? '∞' : isPremium ? '100' : '5'}</small>
          </span>
        </div>
        <div className="user-quota-item">
          <span className="user-quota-label">Vault Storage:</span>
          <span className="user-quota-value">
            {usedMB} MB <small>/ {maxStorageStr}</small>
          </span>
        </div>
        <div className="user-quota-bar-track">
          <div
            className="user-quota-bar-fill"
            style={{
              width: isUltimate ? '8%' : `${Math.min(100, Math.max(5, (storageUsedBytes / tierConfig.maxTotalStorageBytes) * 100))}%`,
              background: isUltimate
                ? 'linear-gradient(90deg, #eab308, #a855f7)'
                : isPremium
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #10b981, #059669)',
            }}
          />
        </div>
      </div>

      {/* Popover Action Menu List */}
      <div className="user-popover-menu-list">
        <button
          type="button"
          className="user-popover-item user-popover-item-highlight"
          onClick={() => {
            onClose();
            onOpenUpgrade();
          }}
        >
          <span className="user-menu-item-icon">🔑</span>
          <div className="user-menu-item-text">
            <strong>Redeem License Key</strong>
            <small>Upgrade vault or enter 20-character key</small>
          </div>
          <span className="user-menu-chevron">›</span>
        </button>

        <button
          type="button"
          className="user-popover-item"
          onClick={() => {
            onClose();
            onOpenBookshelf();
          }}
        >
          <span className="user-menu-item-icon">📚</span>
          <div className="user-menu-item-text">
            <strong>My Bookshelf</strong>
            <small>Switch or create notebooks</small>
          </div>
          <span className="user-menu-chevron">›</span>
        </button>

        {isAdmin && onOpenAdmin && (
          <button
            type="button"
            className="user-popover-item user-popover-item-admin"
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
          >
            <span className="user-menu-item-icon">👑</span>
            <div className="user-menu-item-text">
              <strong>Master Admin Portal</strong>
              <small>Users, audit logs, and key generator</small>
            </div>
            <span className="user-menu-chevron">›</span>
          </button>
        )}

        <button
          type="button"
          className="user-popover-item"
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
        >
          <span className="user-menu-item-icon">⚙️</span>
          <div className="user-menu-item-text">
            <strong>Vault Settings</strong>
            <small>Theme & password changes</small>
          </div>
          <span className="user-menu-chevron">›</span>
        </button>
      </div>

      {/* Popover Footer Lock Button */}
      <div className="user-popover-footer">
        <button
          type="button"
          className="user-popover-lock-btn"
          onClick={() => {
            onClose();
            onLock();
          }}
        >
          <span>🔒</span>
          <span>Lock Notebook Vault</span>
        </button>
      </div>
    </div>
  );
};

export default UserMenuPopover;
