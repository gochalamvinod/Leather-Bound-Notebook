import React, { useState, useEffect } from 'react';
import { CoverTheme } from '../../types/notebook';
import { api } from '../../lib/api/client';
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter';
import { useAuth } from '../../context/AuthContext';
import OtpVerificationPanel from './OtpVerificationPanel';
import { VerifyOtpRequest } from '../../types/otp';
import useOtpTimer from '../../hooks/useOtpTimer';

export interface RegisterTabProps {
  onRegister: (
    password: string,
    username: string,
    notebookTitle: string,
    coverColor: CoverTheme
  ) => Promise<void> | void;
  onSwitchToLogin: (username?: string) => void;
  error?: string | null;
  loading?: boolean;
  initialUsername?: string;
  initialPassword?: string;
  initialEmail?: string;
  autoNotice?: string | null;
}

const COVER_OPTIONS: Array<{ value: CoverTheme; label: string; bg: string }> = [
  { value: 'green', label: 'Emerald Pine', bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { value: 'brown', label: 'Classic Brown', bg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)' },
  { value: 'navy', label: 'Midnight Navy', bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { value: 'burgundy', label: 'Royal Burgundy', bg: 'linear-gradient(135deg, #be123c 0%, #881337 100%)' },
  { value: 'black', label: 'Obsidian Noir', bg: 'linear-gradient(135deg, #4b5563 0%, #111827 100%)' },
];

type WizardStep = 1 | 2 | 3;

export const RegisterTab: React.FC<RegisterTabProps> = ({
  onRegister: _onRegister,
  onSwitchToLogin,
  error = null,
  loading = false,
  initialUsername: _initialUsername = '',
  initialPassword = '',
  initialEmail = '',
  autoNotice = null,
}) => {
  const { sendOtp, verifyOtp } = useAuth();

  // Wizard step: 1 = Profile + Email, 2 = OTP verify, 3 = Username + Password + Vault
  const [step, setStep] = useState<WizardStep>(1);

  // Step 1: Profile fields
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [preferredName, setPreferredName] = useState<string>('');
  const [email, setEmail] = useState<string>(initialEmail || '');

  // Step 2: OTP state
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpCooldownSecs, setOtpCooldownSecs] = useState<number>(60);
  const [otpExpirySecs, setOtpExpirySecs] = useState<number>(600);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  // Step 3: Account setup fields
  const [username, setUsername] = useState<string>('');
  const [notebookTitle, setNotebookTitle] = useState<string>('notebook');
  const [customTitleEdited, setCustomTitleEdited] = useState<boolean>(false);
  const [coverColor, setCoverColor] = useState<CoverTheme>('green');
  const [password, setPassword] = useState<string>(initialPassword);
  const [confirmPassword, setConfirmPassword] = useState<string>(initialPassword);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  } | null>(null);

  // Shared
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  const { startCooldown } = useOtpTimer({
    initialCooldown: otpCooldownSecs,
    initialExpiration: otpExpirySecs,
    autoStartCooldown: false,
  });

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

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

  // Debounced live username availability check
  useEffect(() => {
    if (step !== 3) return;
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
  }, [username, step]);

  // ─── Step 1: Submit profile + send OTP ───
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirst) { setLocalError('First name is required.'); return; }
    if (!cleanLast) { setLocalError('Last name is required.'); return; }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setOtpSending(true);
    try {
      const res = await sendOtp(cleanEmail, 'register');
      if (res && res.ok) {
        const cd = res.cooldownSeconds || 60;
        const exp = res.expiresInSeconds || res.expiresIn || 600;
        setOtpCooldownSecs(cd);
        setOtpExpirySecs(exp);
        startCooldown(cd);
        setStep(2);
        setLocalSuccess('📬 Verification code sent! Check your inbox (and spam/junk folder).');
      } else {
        setLocalError(res?.message || 'Could not send verification code.');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to send verification code.');
    } finally {
      setOtpSending(false);
    }
  };

  // ─── Step 2: Verify OTP → get verification token → move to step 3 ───
  const handleVerifyOtp = async (code: string) => {
    setLocalError(null);
    setLocalSuccess(null);
    setOtpVerifying(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await verifyOtp({
        email: cleanEmail,
        otp: code.trim(),
        purpose: 'register',
        stage: 'pre-verify',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        preferredName: preferredName.trim() || undefined,
      });

      if (res && res.ok) {
        if (res.verificationToken) {
          setVerificationToken(res.verificationToken);
        }
        setStep(3);
        setLocalSuccess('Email verified! Now set up your account.');
      } else {
        setLocalError(res?.error || 'Verification failed. Please check your code.');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Invalid or expired verification code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setLocalError(null);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await sendOtp(cleanEmail, 'register');
      if (res && res.ok) {
        const cd = res.cooldownSeconds || 60;
        setOtpCooldownSecs(cd);
        startCooldown(cd);
        setLocalSuccess(
          `📬 New verification code sent! Check your inbox and spam/junk folder. Wait ${cd}s before next resend.`
        );
      } else if ((res as any)?.code === 'RESEND_LIMIT_EXCEEDED' || res?.error?.includes('limit') || res?.message?.includes('limit')) {
        setLocalError(res?.error || res?.message || 'Too many resend attempts. Please try again later.');
      } else {
        setLocalError(res?.error || res?.message || 'Could not resend verification code.');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to resend verification code.');
    }
  };

  // ─── Step 3: Final registration ───
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    const cleanUser = username.trim().toLowerCase();
    let cleanTitle = notebookTitle.trim();
    if (!cleanTitle) cleanTitle = `${cleanUser}_notebook`;

    if (!cleanUser) { setLocalError('Please choose a username.'); return; }
    if (usernameStatus && !usernameStatus.available) {
      setLocalError('Username already taken. Please choose another.');
      return;
    }
    if (!password) { setLocalError('Please set a master password.'); return; }
    if (password.length < 4) {
      setLocalError('Password must be at least 4 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const verifyPayload: VerifyOtpRequest = {
        email: cleanEmail,
        purpose: 'register',
        verificationToken: verificationToken || undefined,
        username: cleanUser,
        newPassword: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        preferredName: preferredName.trim() || undefined,
        notebookTitle: cleanTitle,
        coverColor: coverColor,
      };

      const res = await verifyOtp(verifyPayload);
      if (!res || !res.ok) {
        setLocalError(res?.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCoverObj = COVER_OPTIONS.find((c) => c.value === coverColor) || COVER_OPTIONS[0];
  const displayError = localError || error;

  // ─── Step indicator icons ───
  const stepIcon = (s: number) => {
    if (s < step) return '✓';
    if (s === step) return String(s);
    return String(s);
  };

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Create Account</h2>
        <p className="auth-form-subtitle">
          {step === 1 && 'Tell us about yourself to get started'}
          {step === 2 && 'Verify your email address'}
          {step === 3 && 'Set up your username and notebook'}
        </p>
      </div>

      {autoNotice && (
        <div className="auth-pill-notice" style={{ marginBottom: '12px' }}>
          <span>✨</span>
          <span>{autoNotice}</span>
        </div>
      )}

      {/* Step Indicator */}
      <div className="auth-step-indicator" style={{
        display: 'flex', justifyContent: 'center', gap: '8px',
        marginBottom: '16px', fontSize: '12px', opacity: 0.8,
      }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontWeight: s === step ? 700 : 400,
            opacity: s <= step ? 1 : 0.4,
          }}>
            <span style={{
              width: '22px', height: '22px', borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: s < step ? '#10b981' : s === step ? '#d4af37' : '#666',
              color: '#fff', fontSize: '11px', fontWeight: 700,
            }}>
              {stepIcon(s)}
            </span>
            <span style={{ color: s <= step ? '#d4af37' : '#888' }}>
              {s === 1 ? 'Profile' : s === 2 ? 'Verify' : 'Account'}
            </span>
            {s < 3 && <span style={{ margin: '0 2px', color: '#666' }}>→</span>}
          </div>
        ))}
      </div>

      {/* ═══════ STEP 1: Profile + Email ═══════ */}
      {step === 1 && (
        <form className="auth-pill-form" onSubmit={handleStep1Submit} noValidate>
          {/* First Name */}
          <div className="pill-input-group">
            <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              autoFocus
              required
              placeholder="First name *"
              maxLength={50}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={otpSending || loading}
              className="pill-input"
            />
          </div>

          {/* Last Name */}
          <div className="pill-input-group">
            <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              required
              placeholder="Last name *"
              maxLength={50}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={otpSending || loading}
              className="pill-input"
            />
          </div>

          {/* Preferred Name (Optional) */}
          <div className="pill-input-group">
            <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <input
              type="text"
              placeholder="Preferred name (optional)"
              maxLength={50}
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              disabled={otpSending || loading}
              className="pill-input"
            />
          </div>

          {/* Email */}
          <div className="pill-input-group">
            <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              required
              placeholder="Email address *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSending || loading}
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
            disabled={otpSending || loading || !firstName.trim() || !lastName.trim() || !email.trim()}
            aria-busy={otpSending}
          >
            {otpSending ? 'SENDING VERIFICATION CODE...' : 'CONTINUE & VERIFY EMAIL'}
          </button>
        </form>
      )}

      {/* ═══════ STEP 2: OTP Verification ═══════ */}
      {step === 2 && (
        <div className="auth-otp-wrapper">
          <OtpVerificationPanel
            email={email}
            purpose="register"
            title="Verify Your Email"
            subtitle="We have sent a secure 6-digit registration code to"
            submitButtonText="VERIFY & CONTINUE"
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onChangeEmail={() => {
              setStep(1);
              setLocalError(null);
              setLocalSuccess(null);
            }}
            onBack={() => {
              setStep(1);
              setLocalError(null);
              setLocalSuccess(null);
            }}
            loading={otpVerifying}
            resending={otpSending}
            error={displayError}
            successMessage={localSuccess}
            cooldownSeconds={otpCooldownSecs}
            expirationSeconds={otpExpirySecs}
          />
        </div>
      )}

      {/* ═══════ STEP 3: Username + Password + Vault ═══════ */}
      {step === 3 && (
        <form className="auth-pill-form" onSubmit={handleStep3Submit} noValidate>
          {/* Verified email badge */}
          <div className="auth-pill-notice" style={{ marginBottom: '10px' }}>
            <span>✅</span>
            <span>Email verified: <strong>{email}</strong></span>
          </div>

          {localSuccess && (
            <div className="auth-pill-notice" style={{ marginBottom: '10px' }}>
              <span>✨</span>
              <span>{localSuccess}</span>
            </div>
          )}

          {/* Username */}
          <div className="pill-input-group">
            <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              autoFocus
              required
              placeholder="Choose a username *"
              autoComplete="username"
              maxLength={30}
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              disabled={submitting || loading}
              className="pill-input"
            />
            {usernameStatus && (
              <span className={`pill-inline-status ${usernameStatus.available ? 'status-ok' : 'status-err'}`}>
                {usernameStatus.message}
              </span>
            )}
            {!username.trim() && (
              <span className="pill-inline-status status-err">
                Username can't be empty
              </span>
            )}
          </div>

          {/* Master Password */}
          <div className="pill-input-group">
            <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Master password (min 4 chars) *"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting || loading}
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

          {/* Confirm Password */}
          <div className="pill-input-group">
            <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Confirm password *"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting || loading}
              className="pill-input"
            />
          </div>

          {password && <PasswordStrengthMeter password={password} />}

          {/* Notebook Title */}
          <div className="pill-input-group">
            <svg className="pill-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <input
              type="text"
              placeholder="Notebook title..."
              maxLength={80}
              value={notebookTitle}
              onChange={(e) => {
                setCustomTitleEdited(true);
                setNotebookTitle(e.target.value);
              }}
              disabled={submitting || loading}
              className="pill-input"
            />
          </div>

          {/* Leather Cover Swatches */}
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
              <span className="error-icon">⚠️</span>
              <span>{displayError}</span>
            </div>
          )}

          <button
            type="submit"
            className="pill-btn-primary royal-sheen-outline"
            disabled={submitting || loading || !username.trim() || (usernameStatus !== null && !usernameStatus.available)}
            aria-busy={submitting}
          >
            {submitting ? 'CREATING NOTEBOOK...' : 'CREATE ACCOUNT & ENTER'}
          </button>
        </form>
      )}

      {/* Footer Switch to Sign In */}
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
