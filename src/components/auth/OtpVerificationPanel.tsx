import React, { useState, useEffect } from 'react';
import { OtpVerificationPanelProps } from '../../types/otp';
import OtpInputGroup from './OtpInputGroup';
import useOtpTimer from '../../hooks/useOtpTimer';

export const OtpVerificationPanel: React.FC<OtpVerificationPanelProps> = ({
  email,
  purpose = 'verification',
  onVerify,
  onResend,
  onChangeEmail,
  onBack,
  loading = false,
  resending = false,
  error = null,
  successMessage = null,
  cooldownSeconds = 60,
  expirationSeconds = 600,
  title,
  subtitle,
  submitButtonText,
  className = '',
}) => {
  const [otp, setOtp] = useState<string>('');
  const [shaking, setShaking] = useState<boolean>(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const {
    cooldownRemaining,
    expirationRemaining,
    startCooldown,
  } = useOtpTimer({
    initialCooldown: cooldownSeconds,
    initialExpiration: expirationSeconds,
    autoStartCooldown: true,
  });

  // Trigger shake animation when error prop changes
  useEffect(() => {
    if (error || internalError) {
      setShaking(false);
      const timer1 = setTimeout(() => setShaking(true), 10);
      const timer2 = setTimeout(() => setShaking(false), 600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [error, internalError]);

  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (internalError) setInternalError(null);
  };

  const handleOtpComplete = (fullOtp: string) => {
    if (!loading && fullOtp.length === 6) {
      handleFormSubmit(fullOtp);
    }
  };

  const handleFormSubmit = async (codeToVerify?: string) => {
    const targetCode = (codeToVerify || otp).trim();
    if (targetCode.length < 6) {
      setInternalError('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      await onVerify(targetCode);
    } catch (err: any) {
      setInternalError(err?.message || 'Verification code failed. Please check and try again.');
    }
  };

  const handleResendClick = async () => {
    if (cooldownRemaining > 0 || resending || !onResend) return;
    setInternalError(null);
    try {
      await onResend();
      startCooldown(cooldownSeconds);
      setOtp('');
    } catch (err: any) {
      setInternalError(err?.message || 'Failed to resend code. Please wait and try again.');
    }
  };

  // Mask email for privacy if too long, e.g. "user***@domain.com"
  const formatDisplayEmail = (rawEmail: string) => {
    if (!rawEmail) return '';
    const parts = rawEmail.split('@');
    if (parts.length !== 2) return rawEmail;
    const [name, domain] = parts;
    if (name.length <= 3) {
      return `${name[0]}***@${domain}`;
    }
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  const displayError = internalError || error;

  const defaultTitle =
    purpose === 'login'
      ? 'Sign In with Code'
      : purpose === 'register'
      ? 'Verify Your Email'
      : purpose === 'recovery'
      ? 'Account Recovery'
      : 'Enter Verification Code';

  const defaultSubtitle = `We have sent a secure 6-digit code to`;

  const defaultSubmitText =
    purpose === 'login'
      ? 'VERIFY & SIGN IN'
      : purpose === 'recovery'
      ? 'VERIFY & CONTINUE'
      : 'VERIFY CODE';

  return (
    <div className={`otp-verification-panel ${shaking ? 'otp-shake' : ''} ${className}`}>
      {/* 1. Header Wax Seal Emblem & Titles */}
      <div className="otp-panel-header">
        <div className="otp-wax-seal-crest" title="Encrypted OTP Security">
          <div className="otp-seal-ring">
            <svg
              className="otp-seal-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1.5" />
            </svg>
          </div>
        </div>

        <h2 className="otp-panel-title">{title || defaultTitle}</h2>
        
        <p className="otp-panel-subtitle">
          {subtitle || defaultSubtitle}{' '}
          <span className="otp-highlight-email" title={email}>
            {formatDisplayEmail(email) || 'your registered email'}
          </span>
        </p>

        {onChangeEmail && (
          <button
            type="button"
            className="otp-change-email-btn"
            onClick={onChangeEmail}
            disabled={loading || resending}
          >
            ✏️ Change Email
          </button>
        )}
      </div>

      {/* 2. Error or Success Notifications */}
      {displayError && (
        <div className="otp-error-banner" role="alert">
          <svg className="otp-error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="otp-error-text">{displayError}</span>
        </div>
      )}

      {successMessage && !displayError && (
        <div className="otp-success-banner" role="status">
          <svg className="otp-success-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="otp-success-text">{successMessage}</span>
        </div>
      )}

      {/* 3. 6-Digit OTP Interactive Cells */}
      <form
        className="otp-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        <OtpInputGroup
          length={6}
          value={otp}
          onChange={handleOtpChange}
          onComplete={handleOtpComplete}
          disabled={loading}
          isError={Boolean(displayError)}
          autoFocus={true}
          cooldownSeconds={cooldownRemaining}
          onResend={onResend ? handleResendClick : undefined}
          resending={resending}
          expirationSeconds={expirationRemaining}
          theme="emerald-gold"
        />

        {/* 4. Action Verification Button */}
        <button
          type="submit"
          className="pill-btn-primary otp-submit-btn royal-sheen-outline"
          disabled={loading || otp.replace(/\D/g, '').length < 6}
          aria-busy={loading}
        >
          {loading ? (
            <span className="otp-btn-loading-content">
              <span className="otp-btn-spinner" />
              VERIFYING CIPHER...
            </span>
          ) : (
            submitButtonText || defaultSubmitText
          )}
        </button>
      </form>

      {/* 5. Return / Back Navigation */}
      {onBack && (
        <div className="otp-panel-footer">
          <button
            type="button"
            className="otp-back-link-btn"
            onClick={onBack}
            disabled={loading}
          >
            ← Return to Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default OtpVerificationPanel;
