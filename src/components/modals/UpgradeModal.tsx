import React, { useState, useEffect } from 'react';
import { TierConfig, TIER_CONFIGS } from '../../lib/tiers';

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'classic' | 'premium' | 'ultimate';
  tierConfig: TierConfig;
  booksCount?: number;
  activePagesCount?: number;
  storageUsedBytes?: number;
  onUpgradeSuccess: (newTier: 'classic' | 'premium' | 'ultimate', newConfig: TierConfig) => void;
  limitReason?: 'max_books' | 'max_pages' | 'max_video' | 'max_storage' | null;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  tierConfig,
  booksCount = 1,
  activePagesCount = 1,
  storageUsedBytes = 0,
  onUpgradeSuccess,
  limitReason,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number>(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Live countdown timer for 1-hour security lockout
  useEffect(() => {
    if (!isLockedOut || lockoutSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setLockoutSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsLockedOut(false);
          setAttemptsRemaining(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutSecondsLeft]);

  if (!isOpen) return null;

  const isUltimate = currentTier === 'ultimate';
  const isPremium = currentTier === 'premium';
  const usedMB = (storageUsedBytes / (1024 * 1024)).toFixed(1);
  const maxStorageGB = isUltimate
    ? '∞ Completely Unlimited'
    : (tierConfig.maxTotalStorageBytes / (1024 * 1024 * 1024)).toFixed(0) + ' GB';

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleKeyInputChange = (val: string) => {
    const raw = val.toUpperCase().trim();
    // If user enters direct promo code (e.g. ULTIMATE, VIP)
    if (['ULTIMATE', 'INFINITY', 'SOVEREIGN', 'GODMODE', 'UNLIMITED', 'VIP', 'PREMIUM'].some((k) => k.startsWith(raw) || raw.startsWith(k))) {
      setPromoCode(raw);
      return;
    }
    // Formatted key: XXXX-XXXX-XXXX-XXXX-XXXX
    const clean = raw.replace(/[^A-Z0-9]/g, '').slice(0, 20);
    const parts: string[] = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    setPromoCode(parts.join('-'));
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim() || isLockedOut) return;
    setIsUpgrading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/user/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 429 || data.lockedOut) {
        setIsLockedOut(true);
        setLockoutSecondsLeft(data.remainingSeconds || 3600);
        setErrorMsg(data.error || 'Too many failed attempts (5/5). Key redemption is locked for 1 hour.');
        return;
      }

      if (!res.ok || !data.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.error || 'Invalid or expired redeem key.');
      }

      const upgradedTier = data.tier || 'ultimate';
      setAttemptsRemaining(null);
      setSuccessMsg(data.message || `Account successfully upgraded to ${upgradedTier.toUpperCase()} Sovereign!`);
      setTimeout(() => {
        onUpgradeSuccess(
          upgradedTier,
          TIER_CONFIGS[upgradedTier as 'classic' | 'premium' | 'ultimate'] || TIER_CONFIGS.ultimate
        );
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not verify redeem key.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div id="upgradeModal" className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="membership-modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>
              {isUltimate ? '⚡' : isPremium ? '👑' : '📜'}
            </span>
            <div>
              <h2>Vault Membership & License Keys</h2>
              <p className="modal-subtitle">
                Compare plan capabilities and redeem exclusive encrypted license keys.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            title="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Quota Exceeded Banner */}
        {limitReason && !isUltimate && (
          <div className="tier-limit-alert-banner">
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <strong>Plan Limit Reached: </strong>
              {limitReason === 'max_books' &&
                `You have reached the maximum allowed notebooks (${tierConfig.maxBooks}) on your current plan.`}
              {limitReason === 'max_pages' &&
                `You have reached the maximum pages per notebook (${tierConfig.maxPagesPerBook}) on your current plan.`}
              {limitReason === 'max_video' &&
                'This video exceeds the maximum file upload size for your current plan.'}
              {limitReason === 'max_storage' &&
                'Your vault has reached its maximum total storage capacity.'}
            </div>
          </div>
        )}

        {/* Current Usage Stats Bar */}
        <div className="tier-stats-bar">
          <div className="tier-stat-item">
            <span className="tier-stat-label">Notebooks</span>
            <span className="tier-stat-val">
              {booksCount} <small>/ {isUltimate ? '∞' : isPremium ? '100' : '5'}</small>
            </span>
          </div>
          <div className="tier-stat-item">
            <span className="tier-stat-label">Pages / Notebook</span>
            <span className="tier-stat-val">
              {activePagesCount} <small>/ {isUltimate ? '∞' : isPremium ? '1,000' : '20'}</small>
            </span>
          </div>
          <div className="tier-stat-item">
            <span className="tier-stat-label">Storage Usage</span>
            <span className="tier-stat-val">
              {usedMB} MB <small>/ {maxStorageGB}</small>
            </span>
          </div>
        </div>

        {/* 3 Tier Cards Side-by-Side */}
        <div className="tier-grid">
          {/* 1. Classic Free Scribe */}
          <div className={`tier-card ${currentTier === 'classic' ? 'tier-card-active' : ''}`}>
            <div className="tier-card-header">
              <div>
                <h3 className="tier-name">📜 Classic Scribe</h3>
                <span className="tier-tag">Free Signup</span>
              </div>
              <div className="tier-price">$0</div>
            </div>
            <ul className="tier-features-list">
              <li>✓ <strong>5 Notebooks</strong> Maximum</li>
              <li>✓ <strong>20 Pages</strong> per Notebook</li>
              <li>✓ <strong>5.0 GB</strong> Total Storage</li>
              <li>✓ <strong>200 MB</strong> Video Upload Limit</li>
              <li>✓ <strong>50 MB</strong> Images & Documents</li>
              <li>✓ Standard 3 Leather Covers</li>
            </ul>
            <div className="tier-card-footer">
              {currentTier === 'classic' ? (
                <span className="tier-active-pill">✓ Current Active Plan</span>
              ) : (
                <span className="tier-inactive-pill">Basic Plan</span>
              )}
            </div>
          </div>

          {/* 2. Guild Master VIP */}
          <div className={`tier-card tier-card-vip ${isPremium ? 'tier-card-active' : ''}`}>
            <div className="tier-card-header">
              <div>
                <h3 className="tier-name" style={{ color: 'var(--brass-highlight, #f0dfa8)' }}>
                  👑 Guild Master
                </h3>
                <span className="tier-tag tier-tag-vip">VIP Member</span>
              </div>
              <div className="tier-price">VIP</div>
            </div>
            <ul className="tier-features-list">
              <li>✨ <strong>100 Notebooks</strong></li>
              <li>✨ <strong>1,000 Pages</strong> per Notebook</li>
              <li>✨ <strong>100.0 GB</strong> Cloud Vault</li>
              <li>✨ <strong>2.0 GB</strong> 4K UHD Video Uploads</li>
              <li>✨ <strong>500 MB</strong> Lossless Documents</li>
              <li>✨ 6 Premium Leather Covers</li>
              <li>✨ Watermark-Free PDF Exports</li>
            </ul>
            <div className="tier-card-footer">
              {isPremium ? (
                <span className="tier-active-pill tier-active-vip">👑 Active VIP Plan</span>
              ) : (
                <span className="tier-inactive-pill">VIP Tier</span>
              )}
            </div>
          </div>

          {/* 3. Ultimate Sovereign (Zero Limits) */}
          <div className={`tier-card tier-card-ultimate ${isUltimate ? 'tier-card-active' : ''}`}>
            <div className="tier-badge-ribbon">Zero Limits</div>
            <div className="tier-card-header">
              <div>
                <h3 className="tier-name" style={{ color: '#fde047' }}>
                  ⚡ Ultimate
                </h3>
                <span className="tier-tag tier-tag-ultimate">Everything Unlocked</span>
              </div>
              <div className="tier-price">Infinity</div>
            </div>
            <ul className="tier-features-list">
              <li>🌌 <strong>Completely Unlimited Books (∞)</strong></li>
              <li>🌌 <strong>Completely Unlimited Pages (∞)</strong></li>
              <li>🌌 <strong>Completely Unlimited Storage (∞)</strong></li>
              <li>🌌 <strong>Completely Unlimited Video & Media Uploads (∞)</strong></li>
              <li>🌌 <strong>Completely Unlimited Aspect Ratio Adjustments (∞)</strong></li>
              <li>🌌 <strong>All Exclusive Covers & Custom Themes</strong></li>
              <li>🌌 <strong>Full AI God Mode & Voice Scribe</strong></li>
            </ul>
            <div className="tier-card-footer">
              {isUltimate ? (
                <span className="tier-active-pill tier-active-ultimate">⚡ Active Ultimate</span>
              ) : (
                <span className="tier-inactive-pill">Ultimate Tier</span>
              )}
            </div>
          </div>
        </div>

        {/* License Key Redemption Box */}
        <div className="promo-code-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label htmlFor="promoInput" style={{ fontWeight: 600, color: 'var(--brass-highlight, #f0dfa8)' }}>
              🔑 Have a 20-Character License Key or Secret Code?
            </label>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              Format: <code>XXXX-XXXX-XXXX-XXXX-XXXX</code>
            </span>
          </div>

          <div className="promo-code-input-row">
            <input
              id="promoInput"
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
              value={promoCode}
              disabled={isLockedOut || isUpgrading}
              onChange={(e) => handleKeyInputChange(e.target.value)}
              className="admin-input"
              style={{
                letterSpacing: '2px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
              maxLength={24}
            />
            <button
              type="button"
              disabled={isUpgrading || !promoCode.trim() || isLockedOut}
              onClick={handleApplyPromoCode}
              className="brass-btn"
              style={{ minWidth: '150px' }}
            >
              {isUpgrading ? 'Verifying...' : isLockedOut ? 'Locked Out' : 'Redeem Key 🔑'}
            </button>
          </div>

          {/* Security Lockout Alert Banner */}
          {isLockedOut && (
            <div
              className="admin-banner admin-banner-error"
              style={{
                marginTop: '10px',
                background: 'rgba(153, 27, 27, 0.35)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>⏳</span>
              <div>
                <strong>Security Lockout Activated: </strong>
                Maximum 5 failed attempts reached. Key redemption is locked for 1 hour.
                <div style={{ marginTop: '4px', fontWeight: 'bold', color: '#fee2e2' }}>
                  Time Remaining: {formatCountdown(lockoutSecondsLeft)}
                </div>
              </div>
            </div>
          )}

          {/* Warning Banner when attempts are running low */}
          {!isLockedOut && attemptsRemaining !== null && attemptsRemaining < 5 && (
            <div
              className="admin-banner"
              style={{
                marginTop: '8px',
                background: 'rgba(180, 83, 9, 0.25)',
                border: '1px solid #f59e0b',
                color: '#fef3c7',
                fontSize: '0.85rem',
              }}
            >
              ⚠️ <strong>Security Notice:</strong> {attemptsRemaining} of 5 attempt{attemptsRemaining === 1 ? '' : 's'} remaining before a 1-hour security lockout.
            </div>
          )}

          {errorMsg && !isLockedOut && (
            <div className="admin-banner admin-banner-error" style={{ marginTop: '8px' }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="admin-banner admin-banner-success" style={{ marginTop: '8px' }}>
              {successMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="admin-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
