/**
 * OTP (One-Time Password) TypeScript Definitions
 * Leatherbound Notebook Authentication System
 */

export type OtpPurpose = 'login' | 'register' | 'recovery' | 'verification' | string;

export interface SendOtpRequest {
  email: string;
  purpose?: OtpPurpose;
  username?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  first_name?: string;
  last_name?: string;
  preferred_name?: string;
}

export interface SendOtpResponse {
  ok: boolean;
  success?: boolean;
  message: string;
  cooldownSeconds?: number;
  expiresInSeconds?: number;
  expiresIn?: number;
  email?: string;
  error?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp?: string;
  purpose?: OtpPurpose;
  newPassword?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  first_name?: string;
  last_name?: string;
  preferred_name?: string;
  notebookTitle?: string;
  coverColor?: string;
  verificationToken?: string;
  token?: string;
  stage?: 'pre-verify' | string;
}

export interface VerifyOtpResponse {
  ok: boolean;
  success?: boolean;
  message?: string;
  token?: string;
  user?: string;
  userId?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  preferredName?: string | null;
  displayName?: string | null;
  vault?: any;
  activeBookId?: string;
  notebook?: any;
  isNewUser?: boolean;
  verified?: boolean;
  needsRegistration?: boolean;
  verificationToken?: string;
  error?: string;
  remainingAttempts?: number;
}

export interface ResetPasswordWithOtpRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface OtpInputGroupProps {
  /** Number of OTP digits, default 6 */
  length?: number;
  /** Current combined OTP string value */
  value: string;
  /** Callback fired whenever any digit is entered or changed */
  onChange: (otp: string) => void;
  /** Callback fired automatically when all digits are filled */
  onComplete?: (otp: string) => void;
  /** Disable all digit inputs */
  disabled?: boolean;
  /** Highlight inputs in error state (e.g. invalid OTP) */
  isError?: boolean;
  /** Auto-focus the first empty digit cell on mount */
  autoFocus?: boolean;
  /** Seconds remaining before resend code is permitted (shows countdown) */
  cooldownSeconds?: number;
  /** Callback when user clicks the active Resend button */
  onResend?: () => Promise<void> | void;
  /** Indicates a resend request is in-flight */
  resending?: boolean;
  /** Seconds remaining before OTP code expires */
  expirationSeconds?: number;
  /** Additional container CSS class */
  className?: string;
  /** Visual size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Skeuomorphic theme accent */
  theme?: 'emerald-gold' | 'royal-dark' | 'leather-brown';
}

export interface OtpVerificationPanelProps {
  /** Destination email address to which code was dispatched */
  email: string;
  /** Purpose of verification for descriptive text */
  purpose?: OtpPurpose;
  /** Callback to verify the entered OTP code */
  onVerify: (otp: string) => Promise<void> | void;
  /** Callback to trigger OTP resend */
  onResend?: () => Promise<void> | void;
  /** Callback to change destination email / go back to email entry */
  onChangeEmail?: () => void;
  /** Callback to cancel or go back to main login */
  onBack?: () => void;
  /** Verification request in progress */
  loading?: boolean;
  /** Resend request in progress */
  resending?: boolean;
  /** Error message to display with shake animation */
  error?: string | null;
  /** Success message or banner */
  successMessage?: string | null;
  /** Cooldown seconds between resends (default 60) */
  cooldownSeconds?: number;
  /** Expiration seconds for current OTP (default 600 / 10 minutes) */
  expirationSeconds?: number;
  /** Custom panel title */
  title?: string;
  /** Custom panel subtitle */
  subtitle?: string;
  /** Custom verify CTA button text */
  submitButtonText?: string;
  /** Optional container class */
  className?: string;
}

export interface GoogleAuthRequest {
  credential?: string;
  code?: string;
  email?: string;
  name?: string;
  googleId?: string;
}

export interface GoogleAuthResponse {
  ok: boolean;
  user: string;
  vault?: any;
  activeBookId?: string;
  notebook?: any;
  error?: string;
}
