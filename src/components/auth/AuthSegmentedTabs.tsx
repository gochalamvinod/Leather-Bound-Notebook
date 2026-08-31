import React from 'react';

export type AuthLoginMode = 'password' | 'otp';

export interface AuthSegmentedTabsProps {
  activeMode: AuthLoginMode;
  onChange: (mode: AuthLoginMode) => void;
  disabled?: boolean;
  className?: string;
  labels?: {
    password?: string;
    otp?: string;
  };
}

export const AuthSegmentedTabs: React.FC<AuthSegmentedTabsProps> = ({
  activeMode,
  onChange,
  disabled = false,
  className = '',
  labels = {
    password: 'Master Password',
    otp: 'Email + OTP Code',
  },
}) => {
  return (
    <div
      className={`auth-segmented-switcher ${className}`}
      role="tablist"
      aria-label="Authentication Method"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeMode === 'password'}
        aria-controls="auth-password-tabpanel"
        id="tab-mode-password"
        className={`auth-segmented-btn ${activeMode === 'password' ? 'active' : ''}`}
        onClick={() => onChange('password')}
        disabled={disabled}
        tabIndex={activeMode === 'password' ? 0 : -1}
      >
        <span className="auth-tab-icon" aria-hidden="true">🔑</span>
        <span className="auth-tab-label">{labels.password}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeMode === 'otp'}
        aria-controls="auth-otp-tabpanel"
        id="tab-mode-otp"
        className={`auth-segmented-btn ${activeMode === 'otp' ? 'active' : ''}`}
        onClick={() => onChange('otp')}
        disabled={disabled}
        tabIndex={activeMode === 'otp' ? 0 : -1}
      >
        <span className="auth-tab-icon" aria-hidden="true">✉️</span>
        <span className="auth-tab-label">{labels.otp}</span>
      </button>
    </div>
  );
};

export default AuthSegmentedTabs;
