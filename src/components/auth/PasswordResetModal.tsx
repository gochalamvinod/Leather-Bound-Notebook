import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api/client';
import OtpInputGroup from './OtpInputGroup';
import useOtpTimer from '../../hooks/useOtpTimer';
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter';

export interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialEmail?: string;
}

type ResetStep = 'REQUEST_OTP' | 'VERIFY_OTP' | 'SET_NEW_PASSWORD' | 'SUCCESS';

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
}) => {
  const [step, setStep] = useState<ResetStep>('REQUEST_OTP');
  const [email, setEmail] = useState<string>(initialEmail);
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement | null>(null);

  const {
    cooldownRemaining,
    expirationRemaining,
    startCooldown,
  } = useOtpTimer({
    initialCooldown: 60,
    initialExpiration: 600,
    autoStartCooldown: false,
  });

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setTimeout(() => {
        setStep('REQUEST_OTP');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  const triggerShake = () => {
    setShaking(false);
    setTimeout(() => setShaking(true), 10);
    setTimeout(() => setShaking(false), 600);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid registered email address.');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp({
        email: cleanEmail,
        purpose: 'recovery',
      });

      if (res && res.ok) {
        startCooldown(res.cooldownSeconds || 60);
        setStep('VERIFY_OTP');
      } else {
        setError(res?.message || 'Could not send verification code. Please try again.');
        triggerShake();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch recovery code to email.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldownRemaining > 0 || resending || loading) return;
    setError(null);
    setResending(true);
    try {
      const res = await api.sendOtp({
        email: email.trim().toLowerCase(),
        purpose: 'recovery',
      });
      if (res && res.ok) {
        startCooldown(res.cooldownSeconds || 60);
        setOtp('');
      } else {
        setError(res?.message || 'Could not resend code.');
        triggerShake();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.');
      triggerShake();
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanOtp = otp.replace(/\D/g, '');

    if (cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        purpose: 'recovery',
      });

      if (res && res.ok) {
        setStep('SET_NEW_PASSWORD');
      } else {
        setError(res?.error || 'Invalid or expired verification code.');
        triggerShake();
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired code. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      triggerShake();
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPasswordWithOtp({
        email: email.trim().toLowerCase(),
        otp: otp.replace(/\D/g, ''),
        newPassword,
      });

      if (res && res.ok) {
        setStep('SUCCESS');
        onSuccess?.();
      } else {
        setError((res as any)?.error || 'Failed to update password.');
        triggerShake();
      }
    } catch (err: any) {
      setError(err?.message || 'Could not reset password. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="password-reset-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resetModalTitle"
    >
      <div
        ref={modalRef}
        className={`password-reset-card ${shaking ? 'shake-active' : ''}`}
      >
        {/* Antique Brass Top Rivet Header */}
        <div className="reset-modal-header">
          <div className="reset-modal-crest">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fde68a"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1.5" />
            </svg>
          </div>

          <h2 id="resetModalTitle" className="reset-modal-title">
            Account Recovery
          </h2>

          <button
            type="button"
            className="reset-modal-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close recovery wizard"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator Progress Rings */}
        <div className="reset-step-indicator">
          <div className={`step-node ${step === 'REQUEST_OTP' ? 'active' : 'completed'}`}>
            <span className="step-num">1</span>
            <span className="step-label">Email</span>
          </div>
          <div className="step-line" />
          <div className={`step-node ${step === 'VERIFY_OTP' ? 'active' : step === 'SET_NEW_PASSWORD' || step === 'SUCCESS' ? 'completed' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">Verify</span>
          </div>
          <div className="step-line" />
          <div className={`step-node ${step === 'SET_NEW_PASSWORD' ? 'active' : step === 'SUCCESS' ? 'completed' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">New Key</span>
          </div>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="auth-pill-error" role="alert" style={{ marginBottom: '12px' }}>
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Enter Registered Email */}
        {step === 'REQUEST_OTP' && (
          <form className="reset-step-form" onSubmit={handleRequestOtp}>
            <p className="reset-step-desc">
              Enter the email address registered with your vault. We will send a secure 6-digit recovery code to reset your master cipher.
            </p>

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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                required
                autoFocus
                placeholder="Enter your registered email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="pill-input"
              />
            </div>

            <button
              type="submit"
              className="pill-btn-primary royal-sheen-outline"
              disabled={loading || !email.trim()}
              aria-busy={loading}
            >
              {loading ? 'DISPATCHING CODE...' : 'SEND RECOVERY CODE'}
            </button>
          </form>
        )}

        {/* STEP 2: Verify 6-Digit OTP */}
        {step === 'VERIFY_OTP' && (
          <form className="reset-step-form" onSubmit={handleVerifyOtp}>
            <p className="reset-step-desc">
              Enter the 6-digit verification code sent to{' '}
              <strong className="otp-highlight-email">{email}</strong>
            </p>

            <OtpInputGroup
              length={6}
              value={otp}
              onChange={(newVal) => {
                setOtp(newVal);
                if (error) setError(null);
              }}
              onComplete={() => {
                if (!loading) handleVerifyOtp();
              }}
              disabled={loading}
              isError={Boolean(error)}
              autoFocus={true}
              cooldownSeconds={cooldownRemaining}
              onResend={handleResendOtp}
              resending={resending}
              expirationSeconds={expirationRemaining}
              theme="emerald-gold"
            />

            <div className="reset-btn-row">
              <button
                type="button"
                className="pill-btn-secondary"
                onClick={() => setStep('REQUEST_OTP')}
                disabled={loading}
              >
                ← Change Email
              </button>

              <button
                type="submit"
                className="pill-btn-primary royal-sheen-outline"
                disabled={loading || otp.replace(/\D/g, '').length < 6}
                aria-busy={loading}
              >
                {loading ? 'VERIFYING...' : 'VERIFY CODE'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Master Password */}
        {step === 'SET_NEW_PASSWORD' && (
          <form className="reset-step-form" onSubmit={handleResetPassword}>
            <p className="reset-step-desc">
              Cipher verified. Enter your new master password to regain access to your leatherbound vault.
            </p>

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
                required
                autoFocus
                placeholder="New master password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="pill-input"
              />
              <button
                type="button"
                className="pill-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Confirm new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="pill-input"
              />
            </div>

            {newPassword && <PasswordStrengthMeter password={newPassword} />}

            <button
              type="submit"
              className="pill-btn-primary royal-sheen-outline"
              disabled={loading || !newPassword || newPassword.length < 4}
              aria-busy={loading}
            >
              {loading ? 'UPDATING CIPHER...' : 'RESET PASSWORD & UNLOCK'}
            </button>
          </form>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 'SUCCESS' && (
          <div className="reset-success-view">
            <div className="reset-success-crest">
              <span className="success-check-icon">✓</span>
            </div>

            <h3 className="reset-success-title">Master Cipher Reset!</h3>
            <p className="reset-success-desc">
              Your password has been successfully updated. You can now sign in to your encrypted notebook vault.
            </p>

            <button
              type="button"
              className="pill-btn-primary royal-sheen-outline"
              onClick={onClose}
            >
              RETURN TO SIGN IN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;
