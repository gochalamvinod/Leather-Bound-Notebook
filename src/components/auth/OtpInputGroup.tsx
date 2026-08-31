import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { OtpInputGroupProps } from '../../types/otp';

export const OtpInputGroup: React.FC<OtpInputGroupProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  isError = false,
  autoFocus = true,
  cooldownSeconds,
  onResend,
  resending = false,
  expirationSeconds,
  className = '',
  size = 'md',
  theme = 'emerald-gold',
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split the value into an array of single characters up to length
  const digits = useMemo(() => {
    const arr = new Array(length).fill('');
    const cleanVal = (value || '').replace(/\D/g, '');
    for (let i = 0; i < length; i++) {
      arr[i] = cleanVal[i] || '';
    }
    return arr;
  }, [value, length]);

  // Focus the first empty digit or first digit on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIndex = digits.findIndex((d) => !d);
      const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
      const el = inputsRef.current[targetIndex];
      if (el) {
        // Small delay to ensure render is complete
        const timer = setTimeout(() => {
          el.focus();
          el.select();
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [autoFocus, disabled]);

  const updateOtpDigits = useCallback(
    (newDigits: string[], triggerComplete = true) => {
      const newOtp = newDigits.join('');
      onChange(newOtp);

      if (triggerComplete && newOtp.length === length && /^\d+$/.test(newOtp)) {
        onComplete?.(newOtp);
      }
    },
    [onChange, onComplete, length]
  );

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanInput = rawVal.replace(/\D/g, '');

    if (!cleanInput) {
      // Cleared the input
      const newDigits = [...digits];
      newDigits[index] = '';
      updateOtpDigits(newDigits, false);
      return;
    }

    if (cleanInput.length === 1) {
      // Single digit typed
      const newDigits = [...digits];
      newDigits[index] = cleanInput;
      updateOtpDigits(newDigits, true);

      // Auto-advance to next cell
      if (index < length - 1) {
        const nextInput = inputsRef.current[index + 1];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    } else {
      // Multiple digits entered in one cell (e.g. mobile autofill or quick typing)
      const newDigits = [...digits];
      const chars = cleanInput.split('');
      let targetIdx = index;

      for (let i = 0; i < chars.length && targetIdx < length; i++, targetIdx++) {
        newDigits[targetIdx] = chars[i];
      }

      updateOtpDigits(newDigits, true);

      // Focus the next empty or last updated cell
      const nextFocus = Math.min(index + chars.length, length - 1);
      const targetEl = inputsRef.current[nextFocus];
      if (targetEl) {
        targetEl.focus();
        targetEl.select();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const currentCellVal = digits[index];

      if (currentCellVal) {
        // Clear current cell
        const newDigits = [...digits];
        newDigits[index] = '';
        updateOtpDigits(newDigits, false);
      } else if (index > 0) {
        // Current cell is already empty, move to previous and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        updateOtpDigits(newDigits, false);

        const prevInput = inputsRef.current[index - 1];
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      }
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      const newDigits = [...digits];
      newDigits[index] = '';
      updateOtpDigits(newDigits, false);
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        const prevInput = inputsRef.current[index - 1];
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < length - 1) {
        const nextInput = inputsRef.current[index + 1];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
      return;
    }

    // Direct key navigation to first or last
    if (e.key === 'Home') {
      e.preventDefault();
      inputsRef.current[0]?.focus();
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      inputsRef.current[length - 1]?.focus();
      return;
    }

    // Ignore non-numeric keys if length is 1 and it's not a control key
    if (
      e.key.length === 1 &&
      !/^\d$/.test(e.key) &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text/plain') || '';
    const pastedDigits = pastedData.replace(/\D/g, '');

    if (!pastedDigits) return;

    const newDigits = [...digits];
    // Fill starting from index 0 for complete codes, or active focused index
    const startIdx = pastedDigits.length >= length ? 0 : digits.findIndex((d) => !d) === -1 ? 0 : digits.findIndex((d) => !d);
    
    for (let i = 0; i < pastedDigits.length && startIdx + i < length; i++) {
      newDigits[startIdx + i] = pastedDigits[i];
    }

    updateOtpDigits(newDigits, true);

    // Focus last filled index or blur if complete
    const filledCount = newDigits.filter(Boolean).length;
    if (filledCount === length) {
      inputsRef.current[length - 1]?.focus();
    } else {
      const nextEmpty = newDigits.findIndex((d) => !d);
      const targetIdx = nextEmpty !== -1 ? nextEmpty : length - 1;
      inputsRef.current[targetIdx]?.focus();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const formatTimer = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const mins = Math.floor(s / 60);
    const remainder = s % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const hasCooldown = cooldownSeconds !== undefined;
  const isCooldownActive = hasCooldown && cooldownSeconds > 0;
  const canClickResend = !isCooldownActive && !resending && !disabled && Boolean(onResend);

  return (
    <div
      className={`otp-input-container ${theme} size-${size} ${isError ? 'has-error' : ''} ${className}`}
      role="group"
      aria-label="6-digit verification code"
    >
      {/* 6 Digit Inputs Row */}
      <div className="otp-cells-row" data-cells-count={length}>
        {digits.map((digit, idx) => {
          const isFilled = Boolean(digit);
          return (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleInputChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              onFocus={handleFocus}
              className={`otp-digit-cell ${isFilled ? 'filled' : ''} ${isError ? 'error' : ''}`}
              aria-label={`Digit ${idx + 1} of ${length}`}
              aria-invalid={isError}
            />
          );
        })}
      </div>

      {/* Timer and Resend Controls Row */}
      {(hasCooldown || onResend || expirationSeconds !== undefined) && (
        <div className="otp-timer-info">
          {expirationSeconds !== undefined && expirationSeconds > 0 && (
            <div className={`otp-expiration-badge ${expirationSeconds < 120 ? 'expiring-soon' : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Code expires in {formatTimer(expirationSeconds)}</span>
            </div>
          )}

          {onResend && (
            <div className="otp-resend-wrapper">
              {isCooldownActive ? (
                <span className="otp-cooldown-text">
                  Resend code in <strong className="otp-timer-highlight">{formatTimer(cooldownSeconds)}</strong>
                </span>
              ) : (
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={onResend}
                  disabled={!canClickResend}
                  aria-busy={resending}
                >
                  {resending ? (
                    <span className="otp-btn-loading">
                      <span className="otp-mini-spinner" />
                      Sending code...
                    </span>
                  ) : (
                    <span>Resend Code</span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OtpInputGroup;
