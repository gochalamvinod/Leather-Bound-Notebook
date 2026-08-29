import React, { useState, useEffect } from 'react';
import { CoverTheme } from '../../types/notebook';
import { api } from '../../lib/api/client';
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter';

export interface RegisterTabProps {
  onRegister: (
    password: string,
    username: string,
    notebookTitle: string,
    coverColor: CoverTheme
  ) => Promise<void>;
  onSwitchToLogin: (username?: string) => void;
  error: string | null;
  loading?: boolean;
  initialUsername?: string;
  initialPassword?: string;
  autoNotice?: string | null;
}

const COVER_OPTIONS: Array<{ value: CoverTheme; label: string; bg: string }> = [
  { value: 'green', label: 'Emerald Pine', bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { value: 'brown', label: 'Classic Brown', bg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)' },
  { value: 'navy', label: 'Midnight Navy', bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { value: 'burgundy', label: 'Royal Burgundy', bg: 'linear-gradient(135deg, #be123c 0%, #881337 100%)' },
  { value: 'black', label: 'Obsidian Noir', bg: 'linear-gradient(135deg, #4b5563 0%, #111827 100%)' },
];

export const RegisterTab: React.FC<RegisterTabProps> = ({
  onRegister,
  onSwitchToLogin,
  error,
  loading = false,
  initialUsername = '',
  initialPassword = '',
  autoNotice = null,
}) => {
  const [username, setUsername] = useState<string>(initialUsername);
  const [notebookTitle, setNotebookTitle] = useState<string>(initialUsername ? `${initialUsername.trim().toLowerCase()}_notebook` : 'notebook');
  const [customTitleEdited, setCustomTitleEdited] = useState<boolean>(false);
  const [coverColor, setCoverColor] = useState<CoverTheme>('green');
  const [password, setPassword] = useState<string>(initialPassword);
  const [confirmPassword, setConfirmPassword] = useState<string>(initialPassword);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; available: boolean; message: string } | null>(null);

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
      const clean = initialUsername.trim().toLowerCase();
      if (!customTitleEdited) {
        setNotebookTitle(clean ? `${clean}_notebook` : 'notebook');
      }
    }
  }, [initialUsername, customTitleEdited]);

  useEffect(() => {
    if (initialPassword) {
      setPassword(initialPassword);
      setConfirmPassword(initialPassword);
    }
  }, [initialPassword]);

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    const clean = val.trim().toLowerCase();
    if (!customTitleEdited) {
      setNotebookTitle(clean ? `${clean}_notebook` : 'notebook');
    }
  };

  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 2) {
      setUsernameStatus(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsername(clean);
        setUsernameStatus({
          checked: true,
          available: res.available,
          message: res.available ? '✓ Available' : '⚠️ Taken',
        });
      } catch {
        setUsernameStatus(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanUser = username.trim().toLowerCase();
    let cleanTitle = notebookTitle.trim();
    if (!cleanTitle) {
      cleanTitle = `${cleanUser}_notebook`;
    } else if (!cleanTitle.startsWith(`${cleanUser}_`)) {
      cleanTitle = `${cleanUser}_${cleanTitle}`;
    }

    if (!cleanUser) {
      setLocalError('Please choose a username.');
      return;
    }

    if (usernameStatus && !usernameStatus.available) {
      setLocalError('Username already taken. Please choose another username.');
      return;
    }

    if (!password) {
      setLocalError('Please choose a password.');
      return;
    }

    if (password.length < 4) {
      setLocalError('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await onRegister(password, cleanUser, cleanTitle, coverColor);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCoverObj = COVER_OPTIONS.find((c) => c.value === coverColor) || COVER_OPTIONS[0];
  const displayError = localError || error;

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Create Account</h2>
        <p className="auth-form-subtitle">Register to begin your private notebook</p>
      </div>

      {autoNotice && (
        <div className="auth-pill-notice" style={{ marginBottom: '12px' }}>
          <span>✨</span>
          <span>{autoNotice}</span>
        </div>
      )}

      <form className="auth-pill-form" onSubmit={handleSubmit} noValidate>
        {/* Username */}
        <div className="pill-input-group">
          <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            type="text"
            id="createUsernameInput"
            autoFocus
            required
            placeholder="Username..."
            autoComplete="username"
            maxLength={30}
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            disabled={submitting}
            className="pill-input"
          />
          {usernameStatus && (
            <span className={`pill-inline-status ${usernameStatus.available ? 'status-ok' : 'status-err'}`}>
              {usernameStatus.message}
            </span>
          )}
        </div>

        {/* Notebook Title */}
        <div className="pill-input-group">
          <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <input
            type="text"
            id="createNotebookTitleInput"
            required
            placeholder="Notebook title..."
            maxLength={80}
            value={notebookTitle}
            onChange={(e) => {
              setCustomTitleEdited(true);
              setNotebookTitle(e.target.value);
            }}
            disabled={submitting}
            className="pill-input"
          />
        </div>

        {/* Password */}
        <div className="pill-input-group">
          <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPassword ? 'text' : 'password'}
            id="createPasswordInput"
            required
            placeholder="Password (min 4 chars)..."
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
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

        {/* Confirm Password */}
        <div className="pill-input-group">
          <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <input
            type={showPassword ? 'text' : 'password'}
            id="createConfirmPasswordInput"
            required
            placeholder="Confirm password..."
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
            className="pill-input"
          />
        </div>

        {password && <PasswordStrengthMeter password={password} />}

        {/* Leather Swatches */}
        <div className="pill-swatches-section">
          <div className="pill-swatch-label-row">
            <span>Theme: <strong>{selectedCoverObj.label}</strong></span>
          </div>
          <div className="pill-swatches-row">
            {COVER_OPTIONS.map((opt) => {
              const isSelected = coverColor === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setCoverColor(opt.value)}
                  className={`pill-swatch-disc ${isSelected ? 'active' : ''}`}
                  style={{ background: opt.bg }}
                  title={opt.label}
                >
                  {isSelected && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {displayError && (
          <div className="auth-pill-error" role="alert">
            {displayError}
          </div>
        )}

        <button
          type="submit"
          id="createUserSubmit"
          className="pill-btn-primary"
          disabled={submitting || loading}
        >
          {submitting ? 'CREATING...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <div className="auth-form-footer">
        <span>Already have an account? </span>
        <button
          type="button"
          id="switchToLoginBtn"
          className="auth-link-btn"
          onClick={() => onSwitchToLogin(username.trim())}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default RegisterTab;
