import React, { useEffect, useState } from 'react';
import { BookshelfEntry } from '../../types/notebook';
import { useAuth } from '../../context/AuthContext';
import AuthSegmentedTabs, { AuthLoginMode } from './AuthSegmentedTabs';
import OtpVerificationPanel from './OtpVerificationPanel';
import GoogleAuthButton from './GoogleAuthButton';

export interface LoginTabProps {
  selectedBook: BookshelfEntry | null;
  onClearSelectedBook: () => void;
  onUnlock: (password: string, username?: string, bookId?: string) => Promise<void>;
  onSwitchToCreate: (username?: string, password?: string, autoNotice?: boolean, email?: string) => void;
  onOpenPasswordReset?: (prefillEmail?: string) => void;
  lockedOut: boolean;
  remainingSeconds: number;
  error: string | null;
  loading?: boolean;
  initialUsername?: string;
}

// Escalating cooldown tiers: 60s → 120s → 180s → blocked
const RESEND_COOLDOWNS = [60, 120, 180];

export const LoginTab: React.FC<LoginTabProps> = ({
  selectedBook,
  onClearSelectedBook,
  onUnlock,
  onSwitchToCreate,
  onOpenPasswordReset,
  lockedOut,
  remainingSeconds,
  error,
  loading = false,
  initialUsername = '',
}) => {
  const { sendOtp, verifyOtp, loginWithGoogle } = useAuth();

  // Mode: Master Password vs Email + OTP
  const [loginMode, setLoginMode] = useState<AuthLoginMode>('password');

  // Shared identity field — accepts username or email
  const [identity, setIdentity] = useState<string>(initialUsername);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Email OTP Form State
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpCooldownSecs, setOtpCooldownSecs] = useState<number>(60);
  const [otpExpirySecs, setOtpExpirySecs] = useState<number>(600);
  const [resendCount, setResendCount] = useState<number>(0);
  const [resendBlocked, setResendBlocked] = useState<boolean>(false);

  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  // Check for Google OAuth callback error in URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error');
      if (urlError) {
        if (urlError === 'access_denied') {
          setLocalError('Google sign-in was cancelled or access was denied.');
        } else if (urlError === 'invalid_state') {
          setLocalError('Google authentication failed: invalid or expired session state. Please try again.');
        } else if (urlError === 'token_exchange_failed') {
          setLocalError('Failed to exchange authorization token with Google.');
        } else {
          setLocalError(`Google sign-in error: ${decodeURIComponent(urlError)}`);
        }
        // Clean URL parameter without reloading
        const cleanPath = window.location.pathname;
        window.history.replaceState({}, document.title, cleanPath);
      }
    }
  }, []);

  useEffect(() => {
    if (initialUsername) {
      setIdentity(initialUsername);
    }
  }, [initialUsername]);

  // Sync selected book from shelf if passed
  useEffect(() => {
    if (selectedBook) {
      const bookUser = selectedBook.owner || selectedBook.user || '';
      if (bookUser && bookUser !== 'default') {
        setIdentity(bookUser);
      }
    }
  }, [selectedBook]);

  // Determine if identity looks like an email
  const isEmail = identity.includes('@');

  // Handle Master Password Login Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanIdentity = identity.trim().toLowerCase();
    if (!cleanIdentity) {
      setLocalError('Please enter your username or email.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your master password.');
      return;
    }

    setSubmitting(true);
    try {
      await onUnlock(password, cleanIdentity, selectedBook ? selectedBook.id : undefined);
    } catch (err: any) {
      if (err?.code === 'USER_NOT_FOUND' || err?.status === 404) {
        const email = isEmail ? cleanIdentity : undefined;
        const username = isEmail ? cleanIdentity.split('@')[0] : cleanIdentity;
        onSwitchToCreate(username, password, true, email);
      } else {
        setLocalError(err.message || 'Incorrect password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Email OTP: Step 1 (Send Code)
  const handleSendOtpClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    const cleanIdentity = identity.trim().toLowerCase();
    if (!cleanIdentity) {
      setLocalError('Please enter your username or email.');
      return;
    }

    // Figure out email and username from identity
    const emailToSend = isEmail ? cleanIdentity : undefined;
    const usernameToSend = isEmail ? undefined : cleanIdentity;

    if (!emailToSend && !usernameToSend) {
      setLocalError('Please enter your username or email address.');
      return;
    }

    setOtpSending(true);
    try {
      const res = await sendOtp(
        emailToSend || cleanIdentity,
        'login',
        usernameToSend
      );
      if (res && res.ok) {
        const cooldown = RESEND_COOLDOWNS[Math.min(resendCount, RESEND_COOLDOWNS.length - 1)];
        setOtpCooldownSecs(res.cooldownSeconds || cooldown);
        setOtpExpirySecs(res.expiresInSeconds || res.expiresIn || 600);
        setOtpSent(true);
        setLocalSuccess(
          '📬 Verification code sent! Check your inbox (and spam/junk folder).'
        );
      } else {
        setLocalError(res?.message || 'Could not send verification code.');
      }
    } catch (err: any) {
      if (err?.code === 'USER_NOT_FOUND' || err?.status === 404) {
        const email = isEmail ? cleanIdentity : undefined;
        const username = isEmail ? cleanIdentity.split('@')[0] : cleanIdentity;
        onSwitchToCreate(username, '', true, email);
      } else {
        setLocalError(err?.message || 'Failed to send verification code.');
      }
    } finally {
      setOtpSending(false);
    }
  };

  // Handle Email OTP: Step 2 (Verify Code & Login)
  const handleVerifyOtp = async (code: string) => {
    setLocalError(null);
    setOtpVerifying(true);
    try {
      const cleanIdentity = identity.trim().toLowerCase();
      const emailToSend = isEmail ? cleanIdentity : undefined;
      const usernameToSend = isEmail ? undefined : cleanIdentity;

      const res = await verifyOtp({
        email: emailToSend || cleanIdentity,
        otp: code,
        purpose: 'login',
        username: usernameToSend,
      });

      if (!res || !res.ok) {
        setLocalError(res?.error || 'Verification code failed.');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Invalid or expired verification code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Handle Resend OTP Code with escalating cooldowns
  const handleResendOtp = async () => {
    const nextResendIndex = resendCount + 1;

    // After 3 resends (60→120→180), block completely
    if (nextResendIndex >= RESEND_COOLDOWNS.length) {
      setResendBlocked(true);
      setLocalError('Too many resend attempts. Please try again later.');
      return;
    }

    const cleanIdentity = identity.trim().toLowerCase();
    const emailToSend = isEmail ? cleanIdentity : undefined;
    const usernameToSend = isEmail ? undefined : cleanIdentity;

    const res = await sendOtp(
      emailToSend || cleanIdentity,
      'login',
      usernameToSend
    );
    if (res && res.ok) {
      const cooldown = RESEND_COOLDOWNS[nextResendIndex];
      setOtpCooldownSecs(res.cooldownSeconds || cooldown);
      setResendCount(nextResendIndex);
      setLocalSuccess(
        `📬 New code sent! Check your inbox and spam folder. Wait ${cooldown}s before next resend.`
      );
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
        <p className="auth-form-subtitle">
          {loginMode === 'password'
            ? 'Sign in with your username or email and master password'
            : 'Enter your username or email to receive a one-time code'}
        </p>
      </div>

      {/* Selected Notebook Spine Banner */}
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
              setIdentity('');
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Google Sign-In */}
      <div className="auth-social-stack" style={{ marginBottom: '14px' }}>
        <GoogleAuthButton
          onSuccess={async (credential) => {
            setLocalError(null);
            try {
              const ok = await loginWithGoogle({ credential });
              if (!ok) {
                setLocalError('Google authentication failed. Please try again.');
              }
            } catch (err: any) {
              setLocalError(err?.message || 'Google sign-in failed.');
            }
          }}
          onError={(err) => setLocalError(err)}
          disabled={submitting || otpSending || otpVerifying || lockedOut}
        />
      </div>

      <div className="auth-social-divider" style={{ margin: '10px 0 16px 0' }}>
        <span className="auth-social-divider-text">OR CONTINUE WITH</span>
      </div>

      {/* Segmented Auth Mode Switcher */}
      <AuthSegmentedTabs
        activeMode={loginMode}
        onChange={(mode) => {
          setLoginMode(mode);
          setLocalError(null);
          setLocalSuccess(null);
          setOtpSent(false);
          setResendCount(0);
          setResendBlocked(false);
        }}
        disabled={submitting || otpSending || otpVerifying || lockedOut}
      />

      {/* MODE 1: Master Password Login */}
      {loginMode === 'password' && (
        <form
          id="auth-password-tabpanel"
          role="tabpanel"
          aria-labelledby="tab-mode-password"
          className="auth-pill-form"
          onSubmit={handlePasswordSubmit}
        >
          <div className="pill-input-group">
            <svg
              className="pill-input-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              id="usernameInput"
              placeholder="Username or email..."
              autoComplete="username"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              disabled={submitting || lockedOut}
              className="pill-input"
            />
          </div>

          <div className="pill-input-group">
            <svg
              className="pill-input-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              id="passwordInput"
              autoComplete="current-password"
              required
              placeholder="Master password..."
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
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="auth-forgot-password-row">
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => onOpenPasswordReset?.(isEmail ? identity : undefined)}
              disabled={submitting || lockedOut}
            >
              Forgot master password?
            </button>
          </div>

          {displayError && (
            <div className="auth-pill-error" role="alert">
              <span className="error-icon">⚠️</span>
              <span>{displayError}</span>
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
            className="pill-btn-primary royal-sheen-outline"
            disabled={submitting || loading || lockedOut}
            aria-busy={submitting}
          >
            {submitting ? 'UNLOCKING VAULT...' : 'SIGN IN & UNLOCK'}
          </button>
        </form>
      )}

      {/* MODE 2: Username/Email + OTP Login */}
      {loginMode === 'otp' && (
        <div
          id="auth-otp-tabpanel"
          role="tabpanel"
          aria-labelledby="tab-mode-otp"
          className="auth-otp-wrapper"
        >
          {!otpSent ? (
            <form className="auth-pill-form" onSubmit={handleSendOtpClick}>
              <div className="pill-input-group">
                <svg
                  className="pill-input-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Username or email..."
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  disabled={otpSending || lockedOut}
                  className="pill-input"
                />
              </div>

              {displayError && (
                <div className="auth-pill-error" role="alert">
                  <span className="error-icon">⚠️</span>
                  <span>{displayError}</span>
                </div>
              )}

              <button
                type="submit"
                className="pill-btn-primary royal-sheen-outline"
                disabled={otpSending || !identity.trim() || lockedOut}
                aria-busy={otpSending}
              >
                {otpSending ? 'SENDING VERIFICATION CODE...' : 'SEND VERIFICATION CODE'}
              </button>
            </form>
          ) : (
            <>
              {/* Spam folder notice */}
              {localSuccess && !displayError && (
                <div className="auth-pill-notice" style={{ marginBottom: '10px', fontSize: '13px' }}>
                  <span>📬</span>
                  <span>{localSuccess}</span>
                </div>
              )}

              {/* Resend blocked notice */}
              {resendBlocked && (
                <div className="auth-pill-error" role="alert" style={{ marginBottom: '10px' }}>
                  <span className="error-icon">🚫</span>
                  <span>Too many resend attempts. Please try again later.</span>
                </div>
              )}

              <OtpVerificationPanel
                email={isEmail ? identity : identity}
                purpose="login"
                onVerify={handleVerifyOtp}
                onResend={resendBlocked ? undefined : handleResendOtp}
                onChangeEmail={() => {
                  setOtpSent(false);
                  setLocalError(null);
                  setLocalSuccess(null);
                }}
                onBack={() => {
                  setOtpSent(false);
                  setLocalError(null);
                  setLocalSuccess(null);
                  setResendCount(0);
                  setResendBlocked(false);
                }}
                loading={otpVerifying}
                resending={otpSending}
                error={displayError}
                successMessage={null}
                cooldownSeconds={otpCooldownSecs}
                expirationSeconds={otpExpirySecs}
              />
            </>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="auth-form-footer">
        <span>Don't have an account? </span>
        <button
          type="button"
          id="switchToCreateUserBtn"
          className="auth-link-btn"
          onClick={() => onSwitchToCreate(identity.trim(), password)}
        >
          Create Master Vault
        </button>
      </div>
    </div>
  );
};

export default LoginTab;
