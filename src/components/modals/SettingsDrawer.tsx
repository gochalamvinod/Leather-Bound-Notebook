import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVault } from '../../context/VaultContext';
import { BookDimensionPreset, CoverTheme } from '../../types/notebook';
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter';
import { DIMENSION_PRESETS } from './NewBookModal';

export interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: Array<{ value: CoverTheme; label: string; bg: string }> = [
  { value: 'brown', label: 'Classic Brown', bg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)' },
  { value: 'green', label: 'Emerald Pine', bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { value: 'navy', label: 'Midnight Navy', bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { value: 'burgundy', label: 'Royal Burgundy', bg: 'linear-gradient(135deg, #be123c 0%, #881337 100%)' },
  { value: 'black', label: 'Obsidian Noir', bg: 'linear-gradient(135deg, #4b5563 0%, #111827 100%)' },
];

export type PaperPattern = 'ruled' | 'grid' | 'dots' | 'blank';

const PAPER_PATTERNS: Array<{ value: PaperPattern; label: string; icon: string; desc: string }> = [
  { value: 'ruled', label: 'Ruled Lines', icon: '📝', desc: '10% Opacity classic notebook lines' },
  { value: 'grid', label: 'Graph Paper', icon: '📐', desc: 'Subtle math & design grid' },
  { value: 'dots', label: 'Dot Grid', icon: '⁖', desc: 'Bullet journal matrix' },
  { value: 'blank', label: 'Blank Parchment', icon: '📜', desc: 'Clean unlined vintage paper' },
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { changePassword, isAdmin, currentUser } = useAuth();
  const { activeBook, renameBook, updateDimensions } = useVault();

  const [activeTab, setActiveTab] = useState<'notebook' | 'dimensions' | 'security'>('notebook');
  const [bookTitleInput, setBookTitleInput] = useState<string>('');
  const [savingTitle, setSavingTitle] = useState<boolean>(false);
  const [activePattern, setActivePattern] = useState<PaperPattern>('ruled');

  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submittingPassword, setSubmittingPassword] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Dimension settings state
  const activeDims = activeBook?.dimensions || {
    preset: 'classic',
    width: 1140,
    height: 840,
    aspectRatio: 1.36,
    dimensionChangeCount: 0,
    maxDimensionChanges: 5,
  };

  const [dimPreset, setDimPreset] = useState<BookDimensionPreset>(activeDims.preset || 'classic');
  const [dimRatio, setDimRatio] = useState<number>(activeDims.aspectRatio || 1.36);
  const [savingDims, setSavingDims] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setNewPasswordConfirm('');
      setMsg(null);
      setShowConfirmModal(false);
      if (activeBook) {
        let cleanTitle = activeBook.title || '';
        cleanTitle = cleanTitle.replace(/^(admin_|default_)+/gi, '');
        if (currentUser) {
          const cleanU = currentUser.toLowerCase().trim();
          while (cleanTitle.toLowerCase().startsWith(`${cleanU}_`)) {
            cleanTitle = cleanTitle.slice(cleanU.length + 1).trim();
          }
        }
        setBookTitleInput(cleanTitle || activeBook.title);
        setDimPreset(activeBook.dimensions?.preset || 'classic');
        setDimRatio(activeBook.dimensions?.aspectRatio || 1.36);
      }
      const savedPattern = (localStorage.getItem('nb_paper_pattern') as PaperPattern) || 'ruled';
      setActivePattern(savedPattern);
      document.body.dataset.paperPattern = savedPattern;
    }
  }, [isOpen, activeBook, currentUser]);

  if (!isOpen) return null;

  const currentTheme = (activeBook?.coverColor as CoverTheme) || 'green';
  const isUltimate = isAdmin || (currentUser && currentUser.toLowerCase() === 'admin');
  const usedChanges = activeDims.dimensionChangeCount || 0;
  const maxChanges = activeDims.maxDimensionChanges !== undefined ? activeDims.maxDimensionChanges : 5;
  const remainingChanges = isUltimate ? 999999 : Math.max(0, maxChanges - usedChanges);
  const isLimitReached = !isUltimate && remainingChanges <= 0;
  const isVipTier = maxChanges === 20;

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBook) return;
    const trimmed = bookTitleInput.trim();
    if (!trimmed) {
      setMsg({ text: 'Notebook title cannot be empty.', isError: true });
      return;
    }
    setSavingTitle(true);
    setMsg(null);
    try {
      await renameBook(activeBook.id, trimmed, currentTheme);
      setMsg({ text: `✓ Notebook title updated to "${trimmed}"`, isError: false });
    } catch (err: any) {
      setMsg({ text: err.message || 'Could not rename notebook.', isError: true });
    } finally {
      setSavingTitle(false);
    }
  };

  const handleThemeChange = async (theme: CoverTheme) => {
    if (activeBook) {
      document.body.dataset.cover = theme;
      await renameBook(activeBook.id, activeBook.title, theme);
      setMsg({ text: `✓ Cover theme updated to ${theme.toUpperCase()}`, isError: false });
    }
  };

  const handlePatternChange = (pat: PaperPattern) => {
    setActivePattern(pat);
    document.body.dataset.paperPattern = pat;
    localStorage.setItem('nb_paper_pattern', pat);
    setMsg({ text: `✓ Paper style updated to ${pat.toUpperCase()}`, isError: false });
  };

  const handleSelectPreset = (pVal: BookDimensionPreset) => {
    setDimPreset(pVal);
    const p = DIMENSION_PRESETS.find((opt) => opt.value === pVal);
    if (p && pVal !== 'custom') {
      setDimRatio(p.ratio);
    }
  };

  const handleRequestApplyDimensions = () => {
    if (!activeBook || isLimitReached) return;
    setShowConfirmModal(true);
  };

  const confirmAndApplyDimensions = async () => {
    if (!activeBook) return;
    setSavingDims(true);
    setMsg(null);
    try {
      await updateDimensions(activeBook.id, {
        preset: dimPreset,
        aspectRatio: Number(dimRatio.toFixed(3)),
        width: Math.round(840 * dimRatio),
        height: 840,
      });
      setShowConfirmModal(false);
      setMsg({
        text: `✓ Spread aspect ratio updated to ${dimRatio.toFixed(2)} : 1 (${isUltimate ? 'Unlimited' : `${remainingChanges - 1} changes left`})`,
        isError: false,
      });
    } catch (err: any) {
      setMsg({
        text: err.message || 'Could not update dimensions.',
        isError: true,
      });
    } finally {
      setSavingDims(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword.length < 4) {
      setMsg({ text: 'Password must be at least 4 characters.', isError: true });
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setMsg({ text: 'Passwords do not match.', isError: true });
      return;
    }

    setSubmittingPassword(true);
    try {
      await changePassword(newPassword);
      setMsg({ text: '✓ Password changed successfully.', isError: false });
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err: any) {
      setMsg({ text: err.message || 'Could not change password.', isError: true });
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div id="settingsDrawer" className="modern-modal-overlay">
      <div className="modern-modal-backdrop" onClick={onClose} />

      <div className="modern-modal-card settings-modern-card" role="dialog" aria-label="Settings">
        {/* Header */}
        <div className="modern-modal-header">
          <div className="modern-modal-title-group">
            <span className="modal-title-icon">⚙️</span>
            <div>
              <h2 className="modern-modal-title">Settings & Customization</h2>
              <p className="modern-modal-subtitle">
                Logged in as <strong>@{currentUser || 'user'}</strong> &bull;{' '}
                <span style={{ color: isUltimate ? '#34d399' : 'var(--brass-bright)', fontWeight: 600 }}>
                  {isUltimate ? '⚡ Sovereign Tier' : '📜 Classic Tier'}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modern-modal-close"
            onClick={onClose}
            title="Close Settings"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('notebook')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: activeTab === 'notebook' ? '1.5px solid var(--brass-bright)' : '1px solid transparent',
              background: activeTab === 'notebook' ? 'rgba(212,175,55,0.2)' : 'transparent',
              color: activeTab === 'notebook' ? 'var(--brass-bright)' : 'rgba(255,255,255,0.7)',
              fontWeight: activeTab === 'notebook' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            📖 Appearance & Paper
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dimensions')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: activeTab === 'dimensions' ? '1.5px solid var(--brass-bright)' : '1px solid transparent',
              background: activeTab === 'dimensions' ? 'rgba(212,175,55,0.2)' : 'transparent',
              color: activeTab === 'dimensions' ? 'var(--brass-bright)' : 'rgba(255,255,255,0.7)',
              fontWeight: activeTab === 'dimensions' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            📐 Page Size & Ratio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: activeTab === 'security' ? '1.5px solid var(--brass-bright)' : '1px solid transparent',
              background: activeTab === 'security' ? 'rgba(212,175,55,0.2)' : 'transparent',
              color: activeTab === 'security' ? 'var(--brass-bright)' : 'rgba(255,255,255,0.7)',
              fontWeight: activeTab === 'security' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            🔒 Security
          </button>
        </div>

        {/* Global Status Banner */}
        {msg && (
          <div
            className={`modern-status-banner ${msg.isError ? 'banner-err' : 'banner-ok'}`}
            style={{ marginBottom: '16px' }}
            role="status"
          >
            {msg.text}
          </div>
        )}

        {/* TAB 1: Notebook Appearance & Paper Style */}
        {activeTab === 'notebook' && (
          <div>
            {/* 1. Change Notebook Title */}
            <form onSubmit={handleSaveTitle} className="modern-settings-section">
              <label className="modern-section-label" htmlFor="settingsBookTitle">
                <span>Rename Notebook</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="settingsBookTitle"
                  type="text"
                  value={bookTitleInput}
                  onChange={(e) => setBookTitleInput(e.target.value)}
                  placeholder="Enter notebook title..."
                  className="pill-input"
                  style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }}
                />
                <button
                  type="submit"
                  disabled={savingTitle || !bookTitleInput.trim()}
                  className="brass-btn"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {savingTitle ? 'Saving...' : 'Save Title'}
                </button>
              </div>
            </form>

            {/* 2. Leather Cover Theme */}
            <div className="modern-settings-section">
              <div className="modern-section-label">
                <span>Leather Cover Color</span>
                <span className="theme-active-tag">
                  {THEME_OPTIONS.find((t) => t.value === currentTheme)?.label}
                </span>
              </div>
              <div className="settings-swatches-grid">
                {THEME_OPTIONS.map((opt) => {
                  const isSelected = currentTheme === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => handleThemeChange(opt.value)}
                      className={`settings-swatch-item ${isSelected ? 'active' : ''}`}
                      style={{ background: opt.bg }}
                      title={opt.label}
                    >
                      {isSelected && <span className="swatch-check-glyph">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Paper Texture & Pattern Style */}
            <div className="modern-settings-section">
              <div className="modern-section-label">
                <span>Paper Pattern & Texture</span>
                <span className="theme-active-tag">
                  {PAPER_PATTERNS.find((p) => p.value === activePattern)?.label}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {PAPER_PATTERNS.map((p) => {
                  const isSelected = activePattern === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handlePatternChange(p.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid var(--brass-bright)' : '1px solid rgba(255,255,255,0.1)',
                        background: isSelected ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.25)',
                        color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.label}</div>
                        <div style={{ fontSize: '0.68rem', opacity: 0.65 }}>{p.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Page Aspect Ratio & Proportion */}
        {activeTab === 'dimensions' && (
          <div className="modern-settings-section">
            <div className="modern-section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📐 Spread Aspect Ratio & Size</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  background: isUltimate
                    ? 'rgba(52, 211, 153, 0.2)'
                    : isLimitReached
                    ? 'rgba(239, 68, 68, 0.2)'
                    : isVipTier
                    ? 'rgba(168, 85, 247, 0.2)'
                    : 'rgba(212, 175, 55, 0.2)',
                  color: isUltimate
                    ? '#34d399'
                    : isLimitReached
                    ? '#f87171'
                    : isVipTier
                    ? '#c084fc'
                    : 'var(--brass-bright)',
                  border: `1px solid ${
                    isUltimate
                      ? '#34d399'
                      : isLimitReached
                      ? '#ef4444'
                      : isVipTier
                      ? '#a855f7'
                      : 'var(--brass)'
                  }`,
                }}
              >
                {isUltimate
                  ? '⚡ Sovereign: Unlimited Changes'
                  : isVipTier
                  ? `👑 VIP: ${remainingChanges} Left (${usedChanges} / ${maxChanges} Used)`
                  : `🎯 Free: ${remainingChanges} Left (${usedChanges} / ${maxChanges} Used)`}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
              Current Spread Ratio: <strong>{dimRatio.toFixed(2)} : 1</strong> &bull;{' '}
              <span style={{ color: isLimitReached ? '#f87171' : 'var(--brass-bright)', fontWeight: 600 }}>
                {isUltimate
                  ? 'Unlimited modifications'
                  : `${remainingChanges} of ${maxChanges} modifications remaining`}
              </span>
            </div>

            {isLimitReached && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  fontSize: '0.78rem',
                  marginBottom: '12px',
                  lineHeight: 1.4,
                }}
              >
                ⚠️ <strong>Modification Limit Reached (0 Left &bull; {usedChanges}/{maxChanges} Used)</strong>: You have used all {maxChanges} {isVipTier ? 'VIP' : 'free'} dimension changes for this notebook. Contact your administrator to increase your quota or upgrade to Sovereign.
              </div>
            )}

            {/* Preset Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px', marginBottom: '10px' }}>
              {DIMENSION_PRESETS.map((preset) => {
                const isSelected = dimPreset === preset.value && (preset.value === 'custom' || Math.abs(dimRatio - preset.ratio) < 0.01);
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleSelectPreset(preset.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: isSelected ? '1.5px solid var(--brass-bright)' : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 0, 0, 0.25)',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span>{preset.icon}</span>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: isSelected ? 700 : 500 }}>{preset.label}</div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.65 }}>{preset.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Continuous Aspect Ratio Slider & Live Visual Box */}
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--brass-bright)', fontWeight: 600 }}>
                  Adjust Spread Aspect Ratio (X : Y)
                </span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800, background: 'rgba(212,175,55,0.25)', padding: '2px 8px', borderRadius: '6px' }}>
                  {dimRatio.toFixed(2)} : 1
                </span>
              </div>

              <input
                type="range"
                min={0.80}
                max={2.20}
                step={0.02}
                value={dimRatio}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDimRatio(val);
                  setDimPreset('custom');
                }}
                style={{ width: '100%', accentColor: 'var(--brass-bright)', marginBottom: '8px' }}
              />

              {/* Quick Ratio Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {[
                  { label: '1:1 Square', ratio: 1.0 },
                  { label: '1.2:1 Compact', ratio: 1.2 },
                  { label: '4:3 (1.33:1)', ratio: 1.333 },
                  { label: '1.36:1 Classic', ratio: 1.36 },
                  { label: 'A4 (1.41:1)', ratio: 1.414 },
                  { label: '3:2 (1.5:1)', ratio: 1.5 },
                  { label: '16:10 (1.6:1)', ratio: 1.6 },
                  { label: '16:9 (1.78:1)', ratio: 1.778 },
                  { label: '2:1 Panoramic', ratio: 2.0 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      setDimRatio(chip.ratio);
                      setDimPreset('custom');
                    }}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: Math.abs(dimRatio - chip.ratio) < 0.01 ? '1px solid var(--brass-bright)' : '1px solid rgba(255,255,255,0.1)',
                      background: Math.abs(dimRatio - chip.ratio) < 0.01 ? 'rgba(212,175,55,0.3)' : 'rgba(0,0,0,0.2)',
                      color: Math.abs(dimRatio - chip.ratio) < 0.01 ? '#fff' : 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Live Preview Box */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '44px',
                    aspectRatio: `${dimRatio} / 1`,
                    background: 'linear-gradient(135deg, #fcfbf9 0%, #ede6db 100%)',
                    border: '1.5px solid var(--brass)',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <div style={{ width: '1px', height: '100%', background: 'rgba(0,0,0,0.2)' }} />
                  <span style={{ position: 'absolute', fontSize: '0.65rem', color: '#555', fontWeight: 700 }}>
                    {dimRatio.toFixed(2)}:1
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="pill-btn-primary"
              onClick={handleRequestApplyDimensions}
              disabled={savingDims || isLimitReached}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                background: isLimitReached
                  ? 'rgba(100, 100, 100, 0.4)'
                  : 'linear-gradient(135deg, var(--brass-mid) 0%, var(--brass-dark) 100%)',
                color: isLimitReached ? '#999' : '#fff',
                cursor: isLimitReached ? 'not-allowed' : 'pointer',
              }}
            >
              {isLimitReached
                ? `MODIFICATION LIMIT REACHED (0/${maxChanges} LEFT)`
                : `APPLY RATIO (${dimRatio.toFixed(2)} : 1)`}
            </button>
          </div>
        )}

        {/* TAB 3: Security & Password */}
        {activeTab === 'security' && (
          <form className="modern-settings-form" onSubmit={handleChangePassword}>
            <div className="modern-section-label">
              <span>Update Master Password</span>
            </div>

            <div className="pill-input-group">
              <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPasswordInput"
                autoComplete="new-password"
                placeholder="New password (min 4 chars)..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submittingPassword}
                className="pill-input"
              />
              <button
                type="button"
                className="pill-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="pill-input-group">
              <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPasswordConfirm"
                autoComplete="new-password"
                placeholder="Confirm new password..."
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                disabled={submittingPassword}
                className="pill-input"
              />
            </div>

            {newPassword && <PasswordStrengthMeter password={newPassword} />}

            <button
              type="submit"
              id="changePasswordBtn"
              className="pill-btn-primary"
              disabled={submittingPassword || !newPassword}
              style={{ marginTop: '8px' }}
            >
              {submittingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        )}

        <div className="modern-modal-footer">
          <button
            type="button"
            id="closeSettingsBtn"
            className="modern-cancel-btn"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>

      {/* Centered Floating Confirmation Popup Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{
              position: 'fixed',
              inset: 0,
            }}
            onClick={() => !savingDims && setShowConfirmModal(false)}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 100051,
              maxWidth: '460px',
              width: '92vw',
              padding: '24px 22px',
              background: 'linear-gradient(165deg, #24160e 0%, #140b06 100%)',
              border: '1.5px solid var(--brass-bright)',
              borderRadius: '14px',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 35px rgba(212, 175, 55, 0.3)',
            }}
            role="dialog"
            aria-labelledby="confirmRatioTitle"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>⚠️</span>
                <div>
                  <h3 id="confirmRatioTitle" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--brass-bright)', fontWeight: 800 }}>
                    Are you sure?
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#cbd5e0', opacity: 0.8 }}>
                    Confirm spread aspect ratio change
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !savingDims && setShowConfirmModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="Quit"
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              You are about to change the page aspect ratio to <strong>{dimRatio.toFixed(2)} : 1</strong> for notebook <em>"{activeBook?.title}"</em>.
            </p>

            <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '8px', marginBottom: '18px', fontSize: '0.8rem' }}>
              {isUltimate ? (
                <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚡</span> Sovereign Tier: Unlimited modifications available
                </span>
              ) : (
                <div>
                  <div style={{ color: 'var(--brass-bright)', fontWeight: 700, marginBottom: '4px' }}>
                    🎯 Quota: {remainingChanges} modifications left ({usedChanges} / {maxChanges} used)
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', lineHeight: 1.4 }}>
                    {isVipTier ? '👑 VIP Tier (20 modifications max per book)' : '📜 Free Tier (5 modifications max per book)'}
                    <br />
                    Applying this change will leave you with <strong>{remainingChanges - 1}</strong> {remainingChanges - 1 === 1 ? 'modification' : 'modifications'} remaining.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="modern-cancel-btn"
                onClick={() => setShowConfirmModal(false)}
                disabled={savingDims}
                style={{ padding: '10px 18px', fontSize: '0.84rem', fontWeight: 600 }}
              >
                Quit / Cancel
              </button>
              <button
                type="button"
                className="pill-btn-primary"
                onClick={confirmAndApplyDimensions}
                disabled={savingDims}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                }}
              >
                {savingDims ? 'APPLYING...' : '✓ YES, APPLY RATIO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDrawer;
