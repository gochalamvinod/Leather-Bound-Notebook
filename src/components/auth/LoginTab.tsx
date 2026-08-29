import React, { useEffect, useState } from 'react';
import { BookshelfEntry } from '../../types/notebook';
import { api } from '../../lib/api/client';

export interface LoginTabProps {
  selectedBook: BookshelfEntry | null;
  onClearSelectedBook: () => void;
  onUnlock: (password: string, username?: string, bookId?: string) => Promise<void>;
  onSwitchToCreate: (username?: string, password?: string, autoNotice?: boolean) => void;
  lockedOut: boolean;
  remainingSeconds: number;
  error: string | null;
  loading?: boolean;
  initialUsername?: string;
}

export const LoginTab: React.FC<LoginTabProps> = ({
  selectedBook,
  onClearSelectedBook,
  onUnlock,
  onSwitchToCreate,
  lockedOut,
  remainingSeconds,
  error,
  loading = false,
  initialUsername = '',
}) => {
  const [username, setUsername] = useState<string>(initialUsername);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  useEffect(() => {
    if (selectedBook) {
      const owner = selectedBook.owner || selectedBook.user || '';
      setUsername(owner !== 'default' ? owner : '');
      setPassword('');
      setLocalError(null);
    }
  }, [selectedBook]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const cleanUser = username.trim();

    if (!cleanUser) {
      setLocalError('Please enter your username.');
      return;
    }

    if (!password) {
      // Check if user exists before showing password error
      if (cleanUser.toLowerCase() !== 'admin') {
        try {
          const checkRes = await api.checkUsername(cleanUser);
          if (checkRes && checkRes.available) {
            onSwitchToCreate(cleanUser, '', true);
            return;
          }
        } catch {}
      }
      setLocalError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      // Fast check: if username is available (doesn't exist), immediately transition to create account
      if (cleanUser.toLowerCase() !== 'admin') {
        try {
          const checkRes = await api.checkUsername(cleanUser);
          if (checkRes && checkRes.available) {
            onSwitchToCreate(cleanUser, password, true);
            return;
          }
        } catch {}
      }

      await onUnlock(
        password,
        cleanUser || (selectedBook?.owner || undefined),
        selectedBook?.id || undefined
      );
    } catch (err: any) {
      if (
        err?.userNotFound ||
        err?.status === 404 ||
        (err?.message &&
          (err.message.toLowerCase().includes('does not exist') ||
            err.message.toLowerCase().includes('not found')))
      ) {
        // Automatic redirection to create account with pre-filled username & password
        onSwitchToCreate(cleanUser, password, true);
        return;
      }
      setLocalError(err.message || 'Incorrect password.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const displayError = localError || error;

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Welcome Back</h2>
        <p className="auth-form-subtitle">Enter your master credentials to unlock your notebook</p>
      </div>

      {selectedBook && (
        <div className="selected-notebook-banner">
          <span className={`banner-spine spine-${selectedBook.coverColor || 'brown'}`} />
          <div className="banner-info">
            <span className="banner-title">{selectedBook.title || 'My Notebook'}</span>
            <span className="banner-owner">User: {selectedBook.owner || selectedBook.user || 'default'}</span>
          </div>
          <button
            type="button"
            className="banner-clear-btn"
            title="Clear selection"
            onClick={() => {
              onClearSelectedBook();
              setUsername('');
            }}
          >
            ✕
          </button>
        </div>
      )}

      <form className="auth-pill-form" onSubmit={handleSubmit}>
        <div className="pill-input-group">
          <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            type="text"
            id="usernameInput"
            placeholder="Username / Account..."
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting || lockedOut}
            className="pill-input"
          />
        </div>

        <div className="pill-input-group">
          <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPassword ? 'text' : 'password'}
            id="passwordInput"
            autoComplete="current-password"
            required
            placeholder="Password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting || lockedOut}
            className="pill-input"
          />
          <button
            type="button"
            className="pill-eye-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            title={showPassword ? 'Hide password' : 'Show password'}
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

        {displayError && (
          <div className="auth-pill-error" role="alert">
            {displayError}
          </div>
        )}

        {lockedOut && (
          <div className="auth-pill-error" role="alert">
            Lockout active. Try again in {formatCountdown(remainingSeconds)}
          </div>
        )}

        <button
          type="submit"
          id="lockSubmit"
          className="pill-btn-primary"
          disabled={submitting || loading || lockedOut}
        >
          {submitting ? 'LOGGING IN...' : 'LOG IN'}
        </button>
      </form>

      <div className="auth-form-footer">
        <span>Don't have an account? </span>
        <button
          type="button"
          id="switchToCreateUserBtn"
          className="auth-link-btn"
          onClick={() => onSwitchToCreate(username.trim(), password)}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LoginTab;
